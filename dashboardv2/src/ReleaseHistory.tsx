import * as React from 'react';
import * as timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import styled from 'styled-components';

import { Checkmark as CheckmarkIcon } from 'grommet-icons';
import { CheckBox, Button, Box, BoxProps, Text } from 'grommet';
import { Omit } from 'grommet/utils';
import ProcessScale from './ProcessScale';
import RightOverlay from './RightOverlay';

import { default as useRouter, UseRouterObejct } from './useRouter';
import useApp from './useApp';
import useAppFormation from './useAppFormation';
import useErrorHandler from './useErrorHandler';
import { listDeploymentsRequestFilterType } from './client';
import { ClientContext } from './withClient';
import {
	Release,
	ReleaseType,
	Deployment,
	ExpandedDeployment,
	ScaleRequest,
	Formation,
	ListDeploymentsResponse
} from './generated/controller_pb';
import Loading from './Loading';
import CreateDeployment from './CreateDeployment';
import CreateScaleRequestComponent from './CreateScaleRequest';
import ReleaseComponent from './Release';
import protoMapDiff, { Diff, DiffOp, DiffOption } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';

function mapHistory<T>(
	deployments: ExpandedDeployment[],
	scaleRequests: ScaleRequest[],
	rfn: (key: string, releases: [Release, Release | null], index: number) => T,
	sfn: (key: string, scaleRequest: ScaleRequest, index: number) => T
): T[] {
	const res = [] as T[];
	const dlen = deployments.length;
	const slen = scaleRequests.length;
	let i = 0;
	let di = 0;
	let si = 0;
	while (di < dlen || si < slen) {
		let d = deployments[di];
		let r = d ? d.getNewRelease() || null : null;
		let pr = d ? d.getOldRelease() || null : null;
		const dt = d ? (d.getCreateTime() as timestamp_pb.Timestamp).toDate() : null;
		const s = scaleRequests[si];
		const st = s ? (s.getCreateTime() as timestamp_pb.Timestamp).toDate() : null;
		if ((dt && st && dt > st) || (dt && !st)) {
			res.push(rfn(d.getName(), [r as Release, pr], i));
			di++;
			i++;
		} else if (st) {
			res.push(sfn(s.getName(), s, i));
			si++;
			i++;
		} else {
			break;
		}
	}
	return res;
}

interface SelectableBoxProps {
	selected: boolean;
}

const selectedBoxCSS = `
	background-color: var(--active);
`;

const SelectableBox = styled(Box)`
	&:hover {
		background-color: var(--active);
	}

	${(props: SelectableBoxProps) => (props.selected ? selectedBoxCSS : '')};
`;

interface ReleaseHistoryFiltersProps extends Omit<UseRouterObejct<{}>, 'match'>, BoxProps {
	urlParams: URLSearchParams;
	filters: string[];
}

function ReleaseHistoryFilters({ location, history, urlParams, filters, ...boxProps }: ReleaseHistoryFiltersProps) {
	const isScaleEnabled = filters.indexOf('scale') !== -1;

	const rhfToggleChangeHanlder = (filterName: string, e: React.ChangeEvent<HTMLInputElement>) => {
		const rhfParam = urlParams.getAll('rhf');
		const rhf = new Set(rhfParam.length ? rhfParam : filters);
		if (e.target.checked) {
			rhf.add(filterName);
		} else {
			rhf.delete(filterName);
			if (filterName === 'code' && rhfParam.indexOf(filterName) === -1) {
				// turning off 'code' will turn on 'env'
				rhf.add('env');
			}
		}
		if (rhf.has('code') && rhf.size === 1) {
			// 'code' is the default so remove it when it's the only one
			rhf.delete('code');
		}
		const nextUrlParams = new URLSearchParams(urlParams);
		nextUrlParams.delete('rhf');
		rhf.forEach((v) => nextUrlParams.append('rhf', v));
		nextUrlParams.sort();
		history.replace(location.pathname + '?' + nextUrlParams.toString());
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
	isCurrent: boolean;
	release: Release;
	prevRelease: Release | null;
	onChange: (isSelected: boolean) => void;
}

function ReleaseHistoryRelease({
	release: r,
	prevRelease: p,
	selected,
	isCurrent,
	onChange,
	...boxProps
}: ReleaseHistoryReleaseProps) {
	return (
		<SelectableBox selected={selected} {...boxProps}>
			<label>
				<CheckBox
					checked={selected}
					indeterminate={!selected && isCurrent}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
				/>
				<ReleaseComponent release={r} prevRelease={p} />
			</label>
		</SelectableBox>
	);
}

interface ReleaseHistoryScaleProps extends BoxProps {
	selected: boolean;
	isCurrent: boolean;
	scaleRequest: ScaleRequest;
	onChange: (isSelected: boolean) => void;
}

function ReleaseHistoryScale({
	scaleRequest: s,
	selected,
	isCurrent,
	onChange,
	...boxProps
}: ReleaseHistoryScaleProps) {
	const releaseID = s.getParent().split('/')[3];
	const diff = protoMapDiff(s.getOldProcessesMap(), s.getNewProcessesMap(), DiffOption.INCLUDE_UNCHANGED);
	return (
		<SelectableBox selected={selected} {...boxProps}>
			<label>
				<CheckBox
					checked={selected}
					indeterminate={!selected && isCurrent}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
				/>
				<div>
					<div>Release {releaseID}</div>
					<Box direction="row">
						{diff.length === 0 ? <Text color="dark-2">&lt;No processes&gt;</Text> : null}
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
		</SelectableBox>
	);
}

export interface Props {
	appName: string;
}

enum SelectedResourceType {
	Release = 1,
	ScaleRequest
}

export default function ReleaseHistory({ appName }: Props) {
	const handleError = useErrorHandler();
	const [isDeploying, setIsDeploying] = React.useState(false);

	const { app, loading: appLoading, error: appError } = useApp(appName);
	React.useEffect(
		() => {
			if (appError) {
				handleError(appError);
			}
		},
		[appError, handleError]
	);

	const currentReleaseName = React.useMemo(
		() => {
			if (!app) return '';
			return app.getRelease();
		},
		[app]
	);

	const [selectedItemName, setSelectedItemName] = React.useState<string>('');
	React.useEffect(
		() => {
			if (!currentReleaseName) return;
			setSelectedItemName(currentReleaseName);
		},
		[currentReleaseName]
	);

	const { history, location, urlParams } = useRouter();
	const releasesListFilters = [urlParams.getAll('rhf'), ['code']].find((i) => i.length > 0) as string[];

	const rhf = releasesListFilters;
	const isCodeReleaseEnabled = React.useMemo(
		() => {
			return rhf.length === 0 || rhf.indexOf('code') !== -1;
		},
		[rhf]
	);
	const isConfigReleaseEnabled = React.useMemo(
		() => {
			return rhf.indexOf('env') !== -1;
		},
		[rhf]
	);
	const isScaleEnabled = React.useMemo(
		() => {
			return rhf.indexOf('scale') !== -1;
		},
		[rhf]
	);

	const client = React.useContext(ClientContext);

	// Stream deployments
	const [deployments, setDeployments] = React.useState<ExpandedDeployment[]>([]);
	const [deploymentsLoading, setDeploymentsLoading] = React.useState(false);
	React.useEffect(
		() => {
			if (!isCodeReleaseEnabled && !isConfigReleaseEnabled) {
				setDeploymentsLoading(false);
				return;
			}

			let filterType = ReleaseType.ANY;
			if (isCodeReleaseEnabled && !isConfigReleaseEnabled) {
				filterType = ReleaseType.CODE;
			} else if (isConfigReleaseEnabled && !isCodeReleaseEnabled) {
				filterType = ReleaseType.CONFIG;
			}

			const cancel = client.streamDeployments(
				appName,
				(res: ListDeploymentsResponse, error: Error | null) => {
					if (error) {
						handleError(error);
						return;
					}

					setDeployments(res.getDeploymentsList());
					setDeploymentsLoading(false);
				},
				listDeploymentsRequestFilterType(filterType)
			);
			return cancel;
		},
		[appName, client, handleError, isCodeReleaseEnabled, isConfigReleaseEnabled]
	);

	// Get scale requests
	const [scaleRequests, setScaleRequests] = React.useState<ScaleRequest[]>([]);
	const [scaleRequestsLoading, setScaleRequestsLoading] = React.useState(isScaleEnabled);
	React.useEffect(
		() => {
			if (!isScaleEnabled) {
				setScaleRequestsLoading(false);
				return;
			}

			const cancel = client.streamScaleRequests(appName, (scaleRequests: ScaleRequest[], error: Error | null) => {
				if (error) {
					handleError(error);
					return;
				}

				setScaleRequests(scaleRequests);
				setScaleRequestsLoading(false);
			});
			return cancel;
		},
		[appName, client, handleError, isScaleEnabled]
	);

	// Get current formation
	const {
		formation: currentFormation,
		loading: currentFormationLoading,
		error: currentFormationError
	} = useAppFormation(appName);
	React.useEffect(
		() => {
			if (currentFormationError) {
				handleError(currentFormationError);
			}
		},
		[currentFormationError, handleError]
	);

	const [selectedResourceType, setSelectedResourceType] = React.useState<SelectedResourceType>(
		SelectedResourceType.Release
	);
	const [selectedScaleRequestDiff, setSelectedScaleRequestDiff] = React.useState<Diff<string, number>>([]);

	// keep updated scale request diff
	React.useEffect(
		() => {
			if (isDeploying) return;

			if (selectedResourceType === SelectedResourceType.ScaleRequest) {
				const sr = scaleRequests.find((sr) => sr.getName() === selectedItemName);
				if (sr) {
					const diff = protoMapDiff((currentFormation as Formation).getProcessesMap(), sr.getNewProcessesMap());
					setSelectedScaleRequestDiff(diff);
					return;
				}
			}
			setSelectedScaleRequestDiff([]);
		},
		[currentFormation, isDeploying, scaleRequests, selectedItemName, selectedResourceType]
	);

	const [nextFormation, setNextFormation] = React.useState<Formation | null>(null);
	const [nextReleaseName, setNextReleaseName] = React.useState('');
	const submitHandler = (e: React.SyntheticEvent) => {
		e.preventDefault();

		if (selectedItemName === '') {
			return;
		}

		if (selectedResourceType === SelectedResourceType.ScaleRequest) {
			// It's a scale request we're deploying
			const sr = scaleRequests.find((sr) => sr.getName() === selectedItemName);
			const nextFormation = new Formation();
			if (!sr) {
				return;
			}
			nextFormation.setParent(sr.getParent());
			protoMapReplace(nextFormation.getProcessesMap(), sr.getNewProcessesMap());
			protoMapReplace(nextFormation.getTagsMap(), sr.getNewTagsMap());
			setNextFormation(nextFormation);
			if (selectedItemName.startsWith(currentReleaseName)) {
				// We're scaling the current release
				setNextReleaseName(currentReleaseName);
			} else {
				// We're deploying and scaling a release
				setNextReleaseName(sr.getParent());
			}
			setIsDeploying(true);
		} else {
			// It's a release we're deploying
			setNextReleaseName(selectedItemName);
			setNextFormation(null);
			setIsDeploying(true);
		}
	};

	const handleDeployCancel = () => {
		setIsDeploying(false);
		setNextReleaseName('');
		setNextFormation(null);
	};

	const handleDeployComplete = (item: Deployment | ScaleRequest) => {
		setIsDeploying(false);
		setNextReleaseName('');
		setNextFormation(null);
	};

	if (deploymentsLoading || scaleRequestsLoading || currentFormationLoading || appLoading) {
		return <Loading />;
	}

	return (
		<>
			{isDeploying ? (
				<RightOverlay onClose={handleDeployCancel}>
					{selectedResourceType === SelectedResourceType.ScaleRequest &&
					nextReleaseName &&
					nextReleaseName === currentReleaseName &&
					nextFormation ? (
						<CreateScaleRequestComponent
							appName={appName}
							nextFormation={nextFormation}
							onCancel={handleDeployCancel}
							onCreate={handleDeployComplete}
							handleError={handleError}
						/>
					) : (
						<CreateDeployment
							appName={appName}
							releaseName={nextReleaseName}
							newFormation={nextFormation || undefined}
							onCancel={handleDeployCancel}
							onCreate={handleDeployComplete}
							handleError={handleError}
						/>
					)}
				</RightOverlay>
			) : null}

			<form onSubmit={submitHandler}>
				<ReleaseHistoryFilters
					location={location}
					history={history}
					filters={releasesListFilters}
					urlParams={urlParams}
				/>

				<Box tag="ul">
					{mapHistory(
						deployments,
						isScaleEnabled ? scaleRequests : [],
						(key, [r, p]) => (
							<ReleaseHistoryRelease
								key={key}
								tag="li"
								margin={{ bottom: 'small' }}
								release={r}
								prevRelease={p}
								selected={selectedItemName === r.getName()}
								isCurrent={currentReleaseName === r.getName()}
								onChange={(isSelected) => {
									if (isSelected) {
										setSelectedItemName(r.getName());
										setSelectedResourceType(SelectedResourceType.Release);
									} else {
										setSelectedItemName(currentReleaseName);
										setSelectedResourceType(SelectedResourceType.Release);
									}
								}}
							/>
						),
						(key, s) => (
							<ReleaseHistoryScale
								key={key}
								tag="li"
								margin={{ bottom: 'small' }}
								scaleRequest={s}
								selected={selectedItemName === s.getName()}
								isCurrent={currentFormation ? currentFormation.getScaleRequest() === s.getName() : false}
								onChange={(isSelected) => {
									if (isSelected) {
										setSelectedItemName(s.getName());
										setSelectedResourceType(SelectedResourceType.ScaleRequest);
									} else {
										setSelectedItemName(currentReleaseName);
										setSelectedResourceType(SelectedResourceType.Release);
									}
								}}
							/>
						)
					)}
				</Box>

				{selectedResourceType === SelectedResourceType.ScaleRequest ? (
					selectedItemName.startsWith(currentReleaseName) ? (
						<Button
							type="submit"
							disabled={(selectedScaleRequestDiff as Diff<string, number>).length === 0}
							primary
							icon={<CheckmarkIcon />}
							label="Scale Release"
						/>
					) : (
						<Button type="submit" primary icon={<CheckmarkIcon />} label="Deploy Release / Scale" />
					)
				) : (
					<Button
						type="submit"
						disabled={selectedItemName === currentReleaseName}
						primary
						icon={<CheckmarkIcon />}
						label="Deploy Release"
					/>
				)}
			</form>
		</>
	);
}
