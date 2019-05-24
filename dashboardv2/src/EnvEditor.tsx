import * as React from 'react';
import * as jspb from 'google-protobuf';
import Loading from './Loading';
import CreateDeployment from './CreateDeployment';
import KeyValueEditor, { Data as KeyValueData, getEntries, rebaseData, buildData } from './KeyValueEditor';
import protoMapDiff, { applyProtoMapDiff } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';
import useErrorHandler from './useErrorHandler';
import { Release } from './generated/controller_pb';
import RightOverlay from './RightOverlay';
import { isNotFoundError } from './client';
import useAppRelease from './useAppRelease';
import useNavProtection from './useNavProtection';

interface Props {
	appName: string;
}

export default function EnvEditor({ appName }: Props) {
	const handleError = useErrorHandler();
	// Stream app release
	const { release: currentRelease, loading: releaseIsLoading, error: releaseError } = useAppRelease(appName);
	// handle app not having a release (useMemo so it uses the same value over
	// multiple renders so as not to over-trigger hooks depending on `release`)
	const initialRelease = React.useMemo(() => new Release(), []);
	const release = currentRelease || initialRelease;

	const [data, setData] = React.useState<KeyValueData | null>(null);
	const [isDeploying, setIsDeploying] = React.useState(false);

	const [enableNavProtection, disableNavProtection] = useNavProtection();
	React.useEffect(
		() => {
			if (data && data.hasChanges) {
				enableNavProtection();
			} else {
				disableNavProtection();
			}
		},
		[data] // eslint-disable-line react-hooks/exhaustive-deps
	);

	// newRelease is used to create a deployment
	const newRelease = React.useMemo(
		() => {
			if (!release) return new Release();
			const diff = data ? protoMapDiff(release.getEnvMap(), new jspb.Map(getEntries(data))) : [];
			const newRelease = new Release();
			newRelease.setArtifactsList(release.getArtifactsList());
			protoMapReplace(newRelease.getLabelsMap(), release.getLabelsMap());
			protoMapReplace(newRelease.getProcessesMap(), release.getProcessesMap());
			protoMapReplace(newRelease.getEnvMap(), applyProtoMapDiff(release.getEnvMap(), diff));
			return newRelease;
		},
		[release, data]
	);

	React.useEffect(
		() => {
			// handle any non-404 errors (not all apps have a release yet)
			if (releaseError && !isNotFoundError(releaseError)) {
				return handleError(releaseError);
			}

			// maintain any non-conflicting changes made when new release arrives
			if (!release || !release.getName() || !data) return;
			const nextData = rebaseData(data, release.getEnvMap().toArray());
			setData(nextData);
		},
		[release, releaseError] // eslint-disable-line react-hooks/exhaustive-deps
	);

	const handleSubmit = (data: KeyValueData) => {
		setIsDeploying(true);
		setData(data);
	};

	const handleDeployDismiss = () => {
		setIsDeploying(false);
	};

	const handleDeployComplete = () => {
		setIsDeploying(false);
		setData(null);
	};

	if (releaseIsLoading) {
		return <Loading />;
	}

	if (!release) throw new Error('<EnvEditor> Error: Unexpected lack of release');

	return (
		<>
			{isDeploying ? (
				<RightOverlay onClose={handleDeployDismiss}>
					<CreateDeployment
						appName={appName}
						newRelease={newRelease || new Release()}
						onCancel={handleDeployDismiss}
						onCreate={handleDeployComplete}
						handleError={handleError}
					/>
				</RightOverlay>
			) : null}
			<KeyValueEditor
				data={data || buildData(release.getEnvMap().toArray())}
				keyPlaceholder="ENV key"
				valuePlaceholder="ENV value"
				onChange={(data) => {
					setData(data);
				}}
				onSubmit={handleSubmit}
				conflictsMessage="Some edited keys have been updated in the latest release"
			/>
		</>
	);
}
