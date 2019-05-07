import * as React from 'react';
import * as timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Checkmark as CheckmarkIcon } from 'grommet-icons';
import { CheckBox, Button, Box, BoxProps } from 'grommet';
import { Omit } from 'grommet/utils';
import ProcessScale from './ProcessScale';
import RightOverlay from './RightOverlay';

import { listReleasesRequestFilterType } from './client';
import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import { Release, ReleaseType, Deployment, ScaleRequest, Formation } from './generated/controller_pb';
import Loading from './Loading';
import CreateDeployment from './CreateDeployment';
import { renderRelease } from './Release';
import { parseURLParams, urlParamsToString, URLParams } from './util/urlParams';
import protoMapDiff, { Diff, DiffOp, DiffOption } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';

function mapHistory<T>(
	releases: Release[],
	scaleRequests: ScaleRequest[],
	rfn: (releases: [Release, Release | null], index: number) => T,
	sfn: (scaleRequest: ScaleRequest, index: number) => T
): T[] {
	const res = [] as T[];
	const rlen = releases.length;
	const slen = scaleRequests.length;
	let i = 0;
	let ri = 0;
	let si = 0;
	while (ri < rlen || si < slen) {
		let r = releases[ri];
		let pr = releases[ri + 1] || null;
		const rt = r ? (r.getCreateTime() as timestamp_pb.Timestamp).toDate() : null;
		const s = scaleRequests[si];
		const st = s ? (s.getCreateTime() as timestamp_pb.Timestamp).toDate() : null;
		if ((rt && st && rt > st) || (rt && !st)) {
			res.push(rfn([r, pr], i));
			ri++;
			i++;
		} else if (st) {
			res.push(sfn(s, i));
			si++;
			i++;
		} else {
			break;
		}
	}
	return res;
}

interface ReleaseHistoryFiltersProps extends Omit<RouteComponentProps<{}>, 'match'>, BoxProps {
	urlParams: URLParams;
	filters: string[];
}

function ReleaseHistoryFilters({ location, history, urlParams, filters, ...boxProps }: ReleaseHistoryFiltersProps) {
	const isScaleEnabled = filters.indexOf('scale') !== -1;

	const rhfToggleChangeHanlder = (filterName: string, e: React.ChangeEvent<HTMLInputElement>) => {
		const rhf = new Set(urlParams.rhf || filters);
		if (e.target.checked) {
			rhf.add(filterName);
		} else {
			rhf.delete(filterName);
			if (filterName === 'code' && (urlParams.rhf || []).indexOf(filterName) === -1) {
				// turning off 'code' will turn on 'env'
				rhf.add('env');
			}
		}
		if (rhf.has('code') && rhf.size === 1) {
			// 'code' is the default so remove it when it's the only one
			rhf.delete('code');
		}
		history.replace(
			location.pathname +
				urlParamsToString(
					Object.assign({}, urlParams, {
						rhf: [...rhf]
					})
				)
		);
	};

	return (
		<Box direction="row" gap="medium" margin={{ bottom: 'medium' }} {...boxProps}>
			<CheckBox
				toggle
				checked={filters.indexOf('code') > -1}
				label="Code"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => rhfToggleChangeHanlder('code', e)}
			/>

			<CheckBox
				toggle
				checked={filters.indexOf('env') > -1}
				label="Env"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => rhfToggleChangeHanlder('env', e)}
			/>

			<CheckBox
				toggle
				checked={isScaleEnabled}
				label="Scale"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => rhfToggleChangeHanlder('scale', e)}
			/>
		</Box>
	);
}

interface ReleaseHistoryReleaseProps extends BoxProps {
	selected: boolean;
	release: Release;
	prevRelease: Release | null;
	onChange: (isSelected: boolean) => void;
}

function ReleaseHistoryRelease({
	release: r,
	prevRelease: p,
	selected,
	onChange,
	...boxProps
}: ReleaseHistoryReleaseProps) {
	return (
		<Box {...boxProps}>
			<label>
				<CheckBox
					checked={selected}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
				/>
				{renderRelease(r, p)}
			</label>
		</Box>
	);
}

interface ReleaseHistoryScaleProps extends BoxProps {
	selected: boolean;
	scaleRequest: ScaleRequest;
	onChange: (isSelected: boolean) => void;
}

function ReleaseHistoryScale({ scaleRequest: s, selected, onChange, ...boxProps }: ReleaseHistoryScaleProps) {
	const releaseID = s.getParent().split('/')[3];
	const diff = protoMapDiff(s.getOldProcessesMap(), s.getNewProcessesMap(), DiffOption.INCLUDE_UNCHANGED);
	return (
		<Box {...boxProps}>
			<label>
				<CheckBox
					checked={selected}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
				/>
				<div>
					<div>Release {releaseID}</div>
					<Box direction="row">
						{diff.reduce(
							(m: React.ReactNodeArray, op: DiffOp<string, number>) => {
								if (op.op === 'remove') {
									return m;
								}
								let val = op.value;
								if (op.op === 'keep') {
									val = s.getOldProcessesMap().get(op.key);
								}
								m.push(
									<ProcessScale
										key={op.key}
										direction="row"
										margin="small"
										size="small"
										value={val as number}
										label={op.key}
									/>
								);
								return m;
							},
							[] as React.ReactNodeArray
						)}
					</Box>
				</div>
			</label>
		</Box>
	);
}

export interface Props extends RouteComponentProps<{}> {
	releases: Release[];
	scaleRequests: ScaleRequest[];
	currentReleaseName: string;
	selectedItemName: string;
	currentFormation: Formation;
	onSubmit: (releaseName: string) => void;
}

enum SelectedResourceType {
	Release = 1,
	ScaleRequest
}

function ReleaseHistory(props: Props) {
	const [selectedItemName, setSelectedItemName] = React.useState<string>(
		props.selectedItemName || props.currentReleaseName
	);
	const [selectedResourceType, setSelectedResourceType] = React.useState<SelectedResourceType>(
		SelectedResourceType.Release
	);
	const [selectedScaleRequestDiff, setSelectedScaleRequestDiff] = React.useState<Diff<string, number> | null>(null);

	const submitHandler = (e: React.SyntheticEvent) => {
		e.preventDefault();
		if (selectedItemName === '') {
			return;
		}
		props.onSubmit(selectedItemName);
	};

	const { releases, scaleRequests, currentReleaseName, currentFormation, location, history } = props;

	const urlParams = parseURLParams(location.search);
	const releasesListFilters = urlParams['rhf'] || ['code'];

	const isScaleEnabled = releasesListFilters.indexOf('scale') !== -1;

	return (
		<form onSubmit={submitHandler}>
			<ReleaseHistoryFilters
				location={location}
				history={history}
				filters={releasesListFilters}
				urlParams={urlParams}
			/>

			<Box tag="ul">
				{mapHistory(
					releases,
					isScaleEnabled ? scaleRequests : [],
					([r, p]) => (
						<ReleaseHistoryRelease
							key={r.getName()}
							tag="li"
							margin={{ bottom: 'small' }}
							release={r}
							prevRelease={p}
							selected={selectedItemName === r.getName()}
							onChange={(isSelected) => {
								if (isSelected) {
									setSelectedItemName(r.getName());
									setSelectedResourceType(SelectedResourceType.Release);
									setSelectedScaleRequestDiff(null);
								} else {
									setSelectedItemName(currentReleaseName);
									setSelectedResourceType(SelectedResourceType.Release);
									setSelectedScaleRequestDiff(null);
								}
							}}
						/>
					),
					(s) => (
						<ReleaseHistoryScale
							key={s.getName()}
							tag="li"
							margin={{ bottom: 'small' }}
							scaleRequest={s}
							selected={selectedItemName === s.getName()}
							onChange={(isSelected) => {
								if (isSelected) {
									const diff = protoMapDiff(currentFormation.getProcessesMap(), s.getNewProcessesMap());
									setSelectedItemName(s.getName());
									setSelectedResourceType(SelectedResourceType.ScaleRequest);
									setSelectedScaleRequestDiff(diff);
								} else {
									setSelectedItemName(currentReleaseName);
									setSelectedResourceType(SelectedResourceType.Release);
									setSelectedScaleRequestDiff(null);
								}
							}}
						/>
					)
				)}
			</Box>

			{selectedItemName === currentReleaseName ? (
				<Button disabled primary icon={<CheckmarkIcon />} label="Deploy Release" />
			) : selectedResourceType === SelectedResourceType.ScaleRequest ? (
				selectedItemName.startsWith(currentReleaseName) ? (
					(selectedScaleRequestDiff as Diff<string, number>).length > 0 ? (
						<Button type="submit" primary icon={<CheckmarkIcon />} label="Scale Release" />
					) : (
						// disabled button (no diff)
						<Button disabled primary icon={<CheckmarkIcon />} label="Scale Release" />
					)
				) : (
					<Button type="submit" primary icon={<CheckmarkIcon />} label="Deploy Release / Scale" />
				)
			) : (
				<Button type="submit" primary icon={<CheckmarkIcon />} label="Deploy Release" />
			)}
		</form>
	);
}

export interface WrappedProps extends ClientProps, ErrorHandlerProps, RouteComponentProps<{}> {
	appName: string;
	currentReleaseName: string;
}

interface WrappedState {
	releases: Release[];
	releasesLoading: boolean;
	scaleRequests: ScaleRequest[];
	scaleRequestsLoading: boolean;
	currentFormation: Formation | null;
	currentFormationLoading: boolean;
	isDeploying: boolean;
	releaseName: string;
	newFormation: Formation | null;
}

class WrappedReleaseHistory extends React.Component<WrappedProps, WrappedState> {
	private __streamReleasesCancel: () => void;
	private __streamScaleRequestsCancel: () => void;
	private __streamAppFormationCancel: () => void;
	private __isScaleEnabled: boolean;
	private __isCodeReleaseEnabled: boolean;
	private __isConfigReleaseEnabled: boolean;
	constructor(props: WrappedProps) {
		super(props);
		this.state = {
			releases: [],
			releasesLoading: false,
			scaleRequests: [],
			scaleRequestsLoading: false,
			currentFormation: null,
			currentFormationLoading: false,
			isDeploying: false,
			releaseName: '',
			newFormation: null
		};
		this.__isScaleEnabled = false;
		this.__isCodeReleaseEnabled = false;
		this.__isConfigReleaseEnabled = false;
		this._checkToggles(false);
		this.__streamReleasesCancel = () => {};
		this.__streamScaleRequestsCancel = () => {};
		this.__streamAppFormationCancel = () => {};
		this._handleSubmit = this._handleSubmit.bind(this);
		this._handleDeployCancel = this._handleDeployCancel.bind(this);
		this._handleDeploymentCreate = this._handleDeploymentCreate.bind(this);
	}

	public componentDidMount() {
		if (this.__isCodeReleaseEnabled || this.__isConfigReleaseEnabled) {
			this._fetchReleases();
		}
		if (this.__isScaleEnabled) {
			this._fetchScaleRequests();
		}
	}

	public componentDidUpdate() {
		this._checkToggles(true);
	}

	public componentWillUnmount() {
		this.__streamReleasesCancel();
		this.__streamScaleRequestsCancel();
		this.__streamAppFormationCancel();
	}

	private _checkToggles(toggleFetch: boolean) {
		const { location } = this.props;
		const rhf = parseURLParams(location.search)['rhf'] || [];
		const prevIsScaleEnabled = this.__isScaleEnabled;
		this.__isScaleEnabled = rhf.indexOf('scale') !== -1;
		if (toggleFetch) {
			if (!prevIsScaleEnabled && this.__isScaleEnabled) {
				this._fetchScaleRequests();
			} else if (prevIsScaleEnabled && !this.__isScaleEnabled) {
				this.__streamScaleRequestsCancel();
				this.__streamAppFormationCancel();
				if (this.state.scaleRequestsLoading || this.state.currentFormationLoading) {
					this.setState({
						scaleRequestsLoading: false,
						currentFormationLoading: false
					});
				}
			}
		}

		const prevIsCodeReleaseEnabled = this.__isCodeReleaseEnabled;
		this.__isCodeReleaseEnabled = rhf.length === 0 || rhf.indexOf('code') !== -1;

		const prevIsConfigReleaseEnabled = this.__isConfigReleaseEnabled;
		this.__isConfigReleaseEnabled = rhf.indexOf('env') !== -1;

		if (toggleFetch) {
			const isReleaseEnabled = this.__isCodeReleaseEnabled || this.__isConfigReleaseEnabled;
			if (
				prevIsCodeReleaseEnabled !== this.__isCodeReleaseEnabled ||
				prevIsConfigReleaseEnabled !== this.__isConfigReleaseEnabled
			) {
				this._fetchReleases();
			} else if (prevIsScaleEnabled && !isReleaseEnabled) {
				this.__streamReleasesCancel();
				if (this.state.releasesLoading) {
					this.setState({
						releasesLoading: false
					});
				}
			}
		}
	}

	private _fetchReleases() {
		const { client, appName, handleError } = this.props;
		this.setState({
			releases: [],
			releasesLoading: true
		});

		let filterType = ReleaseType.ANY;
		if (this.__isCodeReleaseEnabled && !this.__isConfigReleaseEnabled) {
			filterType = ReleaseType.CODE;
		} else if (this.__isConfigReleaseEnabled && !this.__isCodeReleaseEnabled) {
			filterType = ReleaseType.CONFIG;
		}

		this.__streamReleasesCancel();
		this.__streamReleasesCancel = client.listReleasesStream(
			appName,
			(releases: Release[], error: Error | null) => {
				if (error) {
					return handleError(error);
				}

				this.setState({
					releasesLoading: false,
					releases
				});
			},
			listReleasesRequestFilterType(filterType)
		);
	}

	private _fetchScaleRequests() {
		const { client, appName, handleError } = this.props;
		this.setState({
			scaleRequests: [],
			scaleRequestsLoading: true,
			currentFormationLoading: true
		});
		this.__streamScaleRequestsCancel();
		this.__streamScaleRequestsCancel = client.listScaleRequestsStream(
			appName,
			(scaleRequests: ScaleRequest[], error: Error | null) => {
				if (error) {
					return handleError(error);
				}

				this.setState({
					scaleRequestsLoading: false,
					scaleRequests
				});
			}
		);

		this.__streamAppFormationCancel();
		this.__streamAppFormationCancel = client.streamAppFormation(
			appName,
			(formation: Formation, error: Error | null) => {
				if (error) {
					return handleError(error);
				}

				this.setState({
					currentFormation: formation,
					currentFormationLoading: false
				});
			}
		);
	}

	public render() {
		const { appName, client, handleError, ...props } = this.props;
		const {
			releasesLoading,
			releases,
			scaleRequestsLoading,
			scaleRequests,
			currentFormation,
			currentFormationLoading,
			isDeploying,
			releaseName,
			newFormation
		} = this.state;
		if (releasesLoading || scaleRequestsLoading || currentFormationLoading) {
			return <Loading />;
		}
		return (
			<>
				{isDeploying ? (
					<RightOverlay onClose={this._handleDeployCancel}>
						<CreateDeployment
							appName={appName}
							releaseName={releaseName}
							newFormation={newFormation || undefined}
							onCancel={this._handleDeployCancel}
							onCreate={this._handleDeploymentCreate}
						/>
					</RightOverlay>
				) : null}
				<ReleaseHistory
					{...props as Props}
					selectedItemName={releaseName}
					releases={releases}
					scaleRequests={scaleRequests}
					currentFormation={currentFormation as Formation}
					onSubmit={this._handleSubmit}
				/>
			</>
		);
	}

	private _handleSubmit(itemName: string) {
		if (itemName.includes('/scale/')) {
			const sr = this.state.scaleRequests.find((sr) => sr.getName() === itemName);
			const newFormation = new Formation();
			if (!sr) {
				return;
			}
			protoMapReplace(newFormation.getProcessesMap(), sr.getNewProcessesMap());
			protoMapReplace(newFormation.getTagsMap(), sr.getNewTagsMap());
			this.setState({
				isDeploying: true,
				releaseName: sr.getParent(),
				newFormation
			});
		} else {
			this.setState({
				isDeploying: true,
				releaseName: itemName,
				newFormation: null
			});
		}
	}

	private _handleDeployCancel() {
		this.setState({
			isDeploying: false,
			releaseName: '',
			newFormation: null
		});
	}

	private _handleDeploymentCreate(deployment: Deployment) {
		this.setState({
			isDeploying: false,
			releaseName: '',
			newFormation: null
		});
	}
}

export default withErrorHandler(withRouter(withClient(WrappedReleaseHistory)));
