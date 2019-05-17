import * as React from 'react';
import { Box, Button } from 'grommet';
import { Checkmark as CheckmarkIcon } from 'grommet-icons';

import useClient from './useClient';
import useAppFormation from './useAppFormation';
import useCallIfMounted from './useCallIfMounted';
import { handleError } from './withErrorHandler';
import Loading from './Loading';
import ProcessesDiff from './ProcessesDiff';
import protoMapDiff from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';
import { Formation, ScaleRequest, CreateScaleRequest } from './generated/controller_pb';

interface Props {
	appName: string;
	nextFormation: Formation;
	onCancel: () => void;
	onCreate: (scaleRequest: ScaleRequest) => void;
}

export default function CreateScaleRequestComponent({ appName, nextFormation, onCancel, onCreate }: Props) {
	const client = useClient();
	const callIfMounted = useCallIfMounted();
	const { formation, loading: isLoading, error: formationError } = useAppFormation(appName);
	const [hasChanges, setHasChanges] = React.useState(true);
	const [isCreating, setIsCreating] = React.useState(false);
	const [isScaleToZeroConfirmed, setIsScaleToZeroConfirmed] = React.useState(false);

	React.useEffect(
		() => {
			if (formationError) {
				handleError(formationError);
			}
		},
		[formationError]
	);

	// keep track of if selected formation actually changes anything
	React.useEffect(
		() => {
			const diff = protoMapDiff((formation || new Formation()).getProcessesMap(), nextFormation.getProcessesMap());
			setHasChanges(diff.length > 0);
		},
		[nextFormation, formation]
	);

	function handleSubmit(e: React.SyntheticEvent) {
		e.preventDefault();

		setIsCreating(true);

		const req = new CreateScaleRequest();
		req.setParent(nextFormation.getParent());
		protoMapReplace(req.getProcessesMap(), nextFormation.getProcessesMap());
		protoMapReplace(req.getTagsMap(), nextFormation.getTagsMap());
		client.createScale(req, (scaleReq: ScaleRequest, error: Error | null) => {
			callIfMounted(() => {
				if (error) {
					setIsCreating(false);
					handleError(error);
					return;
				}
				onCreate(scaleReq);
			});
		});
	}

	if (isLoading) {
		return <Loading />;
	}

	if (!formation) throw new Error('<CreateScaleRequestComponent> Error: Unexpected lack of formation!');

	return (
		<Box tag="form" fill direction="column" onSubmit={handleSubmit} gap="small" justify="between">
			<Box>
				<h3>Review Changes</h3>

				<ProcessesDiff
					margin="small"
					align="center"
					formation={formation}
					nextFormation={nextFormation}
					onConfirmScaleToZeroChange={(c) => setIsScaleToZeroConfirmed(c)}
				/>
			</Box>

			<Box fill="horizontal" direction="row" align="end" gap="small" justify="between">
				<Button
					type="submit"
					disabled={isCreating || !hasChanges || !isScaleToZeroConfirmed}
					primary
					icon={<CheckmarkIcon />}
					label={isCreating ? 'Creating Scale Request...' : 'Create Scale Request'}
				/>
				<Button
					type="button"
					label="Cancel"
					onClick={(e: React.SyntheticEvent) => {
						e.preventDefault();
						onCancel();
					}}
				/>
			</Box>
		</Box>
	);
}
