import * as React from 'react';
import { Checkmark as CheckmarkIcon } from 'grommet-icons';
import { Box, Button } from 'grommet';

import { Release, Formation, Deployment, CreateScaleRequest } from './generated/controller_pb';
import { handleError } from './withErrorHandler';
import useClient from './useClient';
import useAppRelease from './useAppRelease';
import useAppFormation from './useAppFormation';
import useRelease from './useRelease';
import useCallIfMounted from './useCallIfMounted';
import Loading from './Loading';
import ReleaseComponent from './Release';
import ProcessesDiff from './ProcessesDiff';
import protoMapReplace from './util/protoMapReplace';

interface Props {
	appName: string;
	releaseName?: string;
	newRelease?: Release;
	newFormation?: Formation;
	onCancel: () => void;
	onCreate: (deployment: Deployment) => void;
}

export default function CreateDeployment(props: Props) {
	const client = useClient();
	const newRelease = props.newRelease;
	const newFormation = props.newFormation;
	const { release: currentRelease, loading: currentReleaseLoading, error: currentReleaseError } = useAppRelease(
		props.appName
	);
	const {
		formation: currentFormation,
		loading: currentFormationLoading,
		error: currentFormationError
	} = useAppFormation(props.appName);
	const { release: nextRelease, loading: nextReleaseLoading, error: nextReleaseError } = useRelease(
		props.releaseName || ''
	);
	const isLoading = React.useMemo(
		() => {
			return currentReleaseLoading || nextReleaseLoading || currentFormationLoading;
		},
		[currentReleaseLoading, nextReleaseLoading, currentFormationLoading]
	);
	const [isCreating, setIsCreating] = React.useState(false);
	const [isScaleToZeroConfirmed, setIsScaleToZeroConfirmed] = React.useState(!props.newFormation);

	React.useEffect(
		() => {
			const error = currentReleaseError || nextReleaseError || currentFormationError;
			if (error) {
				handleError(error);
			}
		},
		[currentReleaseError, nextReleaseError, currentFormationError]
	);

	const callIfMounted = useCallIfMounted();

	function createRelease(newRelease: Release) {
		const { appName } = props;
		return new Promise((resolve, reject) => {
			client.createRelease(appName, newRelease, (release: Release, error: Error | null) => {
				if (release && error === null) {
					resolve(release);
				} else {
					reject(error);
				}
			});
		}) as Promise<Release>;
	}

	function createDeployment(release: Release, formation?: Formation) {
		const { appName } = props;
		let scaleRequest = null as CreateScaleRequest | null;
		if (formation) {
			scaleRequest = new CreateScaleRequest();
			protoMapReplace(scaleRequest.getProcessesMap(), formation.getProcessesMap());
			protoMapReplace(scaleRequest.getTagsMap(), formation.getTagsMap());
		}
		let resolve: (deployment: Deployment) => void, reject: (error: Error) => void;
		const p = new Promise((rs, rj) => {
			resolve = rs;
			reject = rj;
		});
		const cb = (deployment: Deployment, error: Error | null) => {
			if (error) {
				reject(error);
			}
			resolve(deployment);
		};
		const createDeployment = scaleRequest
			? () => {
					return client.createDeploymentWithScale(appName, release.getName(), scaleRequest as CreateScaleRequest, cb);
			  }
			: () => {
					return client.createDeployment(appName, release.getName(), cb);
			  };
		createDeployment();
		return p;
	}

	function handleFormSubmit(e: React.SyntheticEvent) {
		e.preventDefault();
		const { onCreate, newFormation } = props;
		setIsCreating(true);
		let p = Promise.resolve(null) as Promise<any>;
		if (newRelease) {
			p = createRelease(newRelease).then((release: Release) => {
				return createDeployment(release, newFormation);
			});
		} else if (nextRelease) {
			p = createDeployment(nextRelease, newFormation);
		}
		p.then((deployment) => {
			callIfMounted(() => {
				onCreate(deployment);
			});
		}).catch((error: Error) => {
			callIfMounted(() => {
				setIsCreating(false);
				handleError(error);
			});
		});
	}

	if (isLoading) return <Loading />;

	if (!(nextRelease || newRelease)) {
		return null;
	}

	return (
		<Box tag="form" fill direction="column" onSubmit={handleFormSubmit} gap="small" justify="between">
			<Box>
				<h3>Review Changes</h3>
				<ReleaseComponent release={(nextRelease || newRelease) as Release} prevRelease={currentRelease} />

				{currentFormation && newFormation ? (
					<ProcessesDiff
						align="center"
						direction="column"
						margin="small"
						formation={currentFormation}
						nextFormation={newFormation}
						onConfirmScaleToZeroChange={(c) => setIsScaleToZeroConfirmed(c)}
					/>
				) : null}
			</Box>

			<Box fill="horizontal" direction="row" align="end" gap="small" justify="between">
				<Button
					type="submit"
					disabled={isCreating || !isScaleToZeroConfirmed}
					primary
					icon={<CheckmarkIcon />}
					label={isCreating ? 'Deploying...' : 'Deploy'}
				/>
				<Button
					type="button"
					label="Cancel"
					onClick={(e: React.SyntheticEvent) => {
						e.preventDefault();
						props.onCancel();
					}}
				/>
			</Box>
		</Box>
	);
}
