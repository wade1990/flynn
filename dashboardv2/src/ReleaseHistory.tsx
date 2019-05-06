import * as React from 'react';
import * as timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Layer, CheckmarkIcon, CheckBox, Button, Columns, Box, Value } from 'grommet';

import { listReleasesRequestFilterType } from './client';
import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import { Release, ReleaseType, Deployment, ScaleRequest, Formation } from './generated/controller_pb';
import Loading from './Loading';
import CreateDeployment from './CreateDeployment';
import { renderRelease } from './Release';
import { parseURLParams, urlParamsToString } from './util/urlParams';
import protoMapDiff, { Diff, DiffOp, DiffOption } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';

import './ReleaseHistory.scss';

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

function renderScaleRequest(s: ScaleRequest): React.ReactNode {
	const releaseID = s.getParent().split('/')[3];
	const diff = protoMapDiff(s.getOldProcessesMap(), s.getNewProcessesMap(), DiffOption.INCLUDE_UNCHANGED);
	return (
		<Columns>
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
						<div key={op.key}>
							<div>Release {releaseID}</div>
							<Box align="center" separator="right">
								<Value value={val} label={op.key} size="small" />
							</Box>
						</div>
					);
					return m;
				},
				[] as React.ReactNodeArray
			)}
		</Columns>
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

interface State {
	selectedItemName: string;
	selectedResourceType: SelectedResourceType;
	selectedScaleRequestDiff: Diff<string, number> | null;
}

export class ReleaseHistory extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selectedItemName: props.selectedItemName || props.currentReleaseName,
			selectedResourceType: SelectedResourceType.Release,
			selectedScaleRequestDiff: null
		};
		this._submitHandler = this._submitHandler.bind(this);
	}

	public componentDidUpdate(prevProps: Props, prevState: State) {
		const { currentReleaseName } = this.props;
		const { selectedItemName } = this.state;
		if (selectedItemName === prevProps.currentReleaseName && currentReleaseName !== prevState.selectedItemName) {
			this.setState({
				selectedItemName: currentReleaseName,
				selectedResourceType: SelectedResourceType.Release,
				selectedScaleRequestDiff: null
			});
		}
	}

	public render() {
		const { releases, scaleRequests, currentReleaseName, currentFormation, location, history } = this.props;
		const { selectedItemName, selectedResourceType, selectedScaleRequestDiff } = this.state;

		const urlParams = parseURLParams(location.search);
		const releasesListFilters = urlParams['rhf'] || ['code'];

		const getListItemClassName = (item: Release | ScaleRequest): string => {
			if (item.getName() === selectedItemName) {
				return 'selected';
			}
			return '';
		};

		const isScaleEnabled = releasesListFilters.indexOf('scale') !== -1;

		const rhfToggleChangeHanlder = (filterName: string, e: React.ChangeEvent<HTMLInputElement>) => {
			const rhf = new Set(urlParams.rhf || releasesListFilters);
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
			<form onSubmit={this._submitHandler}>
				<ul className="releases-list">
					<CheckBox
						toggle
						checked={releasesListFilters.indexOf('code') > -1}
						label="Code"
						onChange={rhfToggleChangeHanlder.bind(this, 'code')}
					/>

					<CheckBox
						toggle
						checked={releasesListFilters.indexOf('env') > -1}
						label="Env"
						onChange={rhfToggleChangeHanlder.bind(this, 'env')}
					/>

					<CheckBox
						toggle
						checked={isScaleEnabled}
						label="Scale"
						onChange={rhfToggleChangeHanlder.bind(this, 'scale')}
					/>

					<br />
					<br />

					{mapHistory(
						releases,
						isScaleEnabled ? scaleRequests : [],
						([r, p]) => {
							return (
								<li className={getListItemClassName(r)} key={r.getName()}>
									<label>
										<CheckBox
											checked={selectedItemName === r.getName()}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												if (e.target.checked) {
													this.setState({
														selectedItemName: r.getName(),
														selectedResourceType: SelectedResourceType.Release,
														selectedScaleRequestDiff: null
													});
												} else {
													this.setState({
														selectedItemName: currentReleaseName,
														selectedResourceType: SelectedResourceType.Release,
														selectedScaleRequestDiff: null
													});
												}
											}}
										/>
										{renderRelease(r, p)}
									</label>
								</li>
							);
						},
						(s) => {
							return (
								<li className={getListItemClassName(s)} key={s.getName()}>
									<label>
										<CheckBox
											checked={selectedItemName === s.getName()}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												if (e.target.checked) {
													const diff = protoMapDiff(currentFormation.getProcessesMap(), s.getNewProcessesMap());
													this.setState({
														selectedItemName: s.getName(),
														selectedResourceType: SelectedResourceType.ScaleRequest,
														selectedScaleRequestDiff: diff
													});
												} else {
													this.setState({
														selectedItemName: currentReleaseName,
														selectedResourceType: SelectedResourceType.Release,
														selectedScaleRequestDiff: null
													});
												}
											}}
										/>
										{renderScaleRequest(s)}
									</label>
								</li>
							);
						}
					)}
				</ul>

				{selectedItemName === currentReleaseName ? (
					// disabled button
					<Button primary icon={<CheckmarkIcon />} label="Deploy Release" />
				) : selectedResourceType === SelectedResourceType.ScaleRequest ? (
					selectedItemName.startsWith(currentReleaseName) ? (
						(selectedScaleRequestDiff as Diff<string, number>).length > 0 ? (
							<Button type="submit" primary icon={<CheckmarkIcon />} label="Scale Release" />
						) : (
							// disabled button (no diff)
							<Button primary icon={<CheckmarkIcon />} label="Scale Release" />
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

	private _submitHandler(e: React.SyntheticEvent) {
		e.preventDefault();
		const { selectedItemName } = this.state;
		if (selectedItemName == '') {
			return;
		}
		this.props.onSubmit(selectedItemName);
	}
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
					<Layer closer overlayClose align="right" onClose={this._handleDeployCancel}>
						<Box full="vertical" justify="center" pad="small">
							<CreateDeployment
								appName={appName}
								releaseName={releaseName}
								newFormation={newFormation || undefined}
								onCancel={this._handleDeployCancel}
								onCreate={this._handleDeploymentCreate}
							/>
						</Box>
					</Layer>
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
