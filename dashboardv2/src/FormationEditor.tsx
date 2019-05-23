import * as React from 'react';
import * as jspb from 'google-protobuf';
import { Box, Button, Text } from 'grommet';

import useClient from './useClient';
import useAppFormation from './useAppFormation';
import useNavProtection from './useNavProtection';
import { handleError } from './withErrorHandler';
import Loading from './Loading';
import ProcessScale from './ProcessScale';
import ProcessesDiff from './ProcessesDiff';
import protoMapDiff, { applyProtoMapDiff, Diff } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';
import { Formation, ScaleRequest, ScaleRequestState, CreateScaleRequest } from './generated/controller_pb';

function buildProcessesArray(m: jspb.Map<string, number>): [string, number][] {
	return Array.from(m.getEntryList()).sort(([ak, av]: [string, number], [bk, bv]: [string, number]) => {
		return ak.localeCompare(bk);
	});
}

interface Props {
	appName: string;
}

export default function FormationEditor({ appName }: Props) {
	const client = useClient();
	const { formation, loading: isLoading, error: formationError } = useAppFormation(appName);
	const [initialProcesses, setInitialProcesses] = React.useState<jspb.Map<string, number>>(
		new jspb.Map<string, number>([])
	);
	const [processes, setProcesses] = React.useState<[string, number][]>([]);
	const [processesDiff, setProcessesDiff] = React.useState<Diff<string, number>>([]);
	const [hasChanges, setHasChanges] = React.useState(false);
	const [isConfirming, setIsConfirming] = React.useState(false);
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

	const [enableNavProtection, disableNavProtection] = useNavProtection();
	React.useEffect(
		() => {
			if (hasChanges) {
				enableNavProtection();
			} else {
				disableNavProtection();
			}
		},
		[hasChanges] // eslint-disable-line react-hooks/exhaustive-deps
	);

	React.useEffect(
		() => {
			if (!formation) return;

			// preserve changes
			let processesMap = formation.getProcessesMap();
			if (hasChanges) {
				processesMap = applyProtoMapDiff(processesMap, processesDiff);
			}

			setProcesses(buildProcessesArray(processesMap));
			setInitialProcesses(formation.getProcessesMap());
		},
		[formation] // eslint-disable-line react-hooks/exhaustive-deps
	);

	// set `processesDiff`, `processesFullDiff`, and `hasChanges` when
	// `processes` changes
	React.useEffect(
		() => {
			const diff = protoMapDiff(initialProcesses, new jspb.Map(processes));
			setProcessesDiff(diff);
			setHasChanges(diff.length > 0);
		},
		[processes] // eslint-disable-line react-hooks/exhaustive-deps
	);

	// used to render diff
	const nextFormation = React.useMemo(
		() => {
			const f = new Formation();
			protoMapReplace(f.getProcessesMap(), new jspb.Map(processes));
			return f;
		},
		[processes]
	);

	function handleProcessChange(key: string, val: number) {
		setProcesses(processes.map(([k, v]: [string, number]) => {
			if (k === key) {
				return [k, val];
			}
			return [k, v];
		}) as [string, number][]);
	}

	function handleSubmit(e: React.SyntheticEvent) {
		e.preventDefault();
		setIsConfirming(true);
	}

	function handleConfirmSubmit(e: React.SyntheticEvent) {
		e.preventDefault();

		// build new formation object with new processes map
		if (!formation) return; // should never be null at this point

		setIsConfirming(false);
		setIsCreating(true);

		const req = new CreateScaleRequest();
		req.setParent(formation.getParent());
		protoMapReplace(req.getProcessesMap(), new jspb.Map(processes));
		protoMapReplace(req.getTagsMap(), formation.getTagsMap());
		client.createScale(req, (scaleReq: ScaleRequest, error: Error | null) => {
			setIsCreating(false);
			if (error) {
				handleError(error);
				return;
			}
			setProcesses(buildProcessesArray(scaleReq.getNewProcessesMap()));
		});
	}

	if (isLoading) {
		return <Loading />;
	}

	if (!formation) throw new Error('<FormationEditor> Error: Unexpected lack of formation!');

	const isPending = formation.getState() === ScaleRequestState.SCALE_PENDING;

	return (
		<form onSubmit={isConfirming ? handleConfirmSubmit : handleSubmit}>
			{isConfirming || isCreating || isPending ? (
				<ProcessesDiff
					formation={formation}
					nextFormation={nextFormation}
					onConfirmScaleToZeroChange={(c) => setIsScaleToZeroConfirmed(c)}
				/>
			) : (
				<Box direction="row" gap="small">
					{processes.length === 0 ? (
						<Text color="dark-2">&lt;No processes&gt;</Text>
					) : (
						processes.map(([key, val]: [string, number]) => (
							<Box align="center" key={key}>
								<ProcessScale
									value={val}
									label={key}
									editable
									onChange={(newVal) => {
										handleProcessChange(key, newVal);
									}}
								/>
							</Box>
						))
					)}
				</Box>
			)}
			<br />
			<br />
			{hasChanges && !isPending ? (
				isConfirming ? (
					<>
						<Button
							type="submit"
							primary={true}
							label="Confirm and Create Scale Request"
							disabled={!isScaleToZeroConfirmed}
						/>
						&nbsp;
						<Button
							type="button"
							label="Cancel"
							onClick={(e: React.SyntheticEvent) => {
								e.preventDefault();
								setIsConfirming(false);
							}}
						/>
					</>
				) : isCreating ? (
					<>
						<Button disabled primary={true} label="Creating Scale Request" />
					</>
				) : (
					<>
						<Button type="submit" primary={true} label="Create Scale Request" />
						&nbsp;
						<Button
							type="button"
							label="Reset"
							onClick={(e: React.SyntheticEvent) => {
								e.preventDefault();
								setProcesses(buildProcessesArray(initialProcesses));
							}}
						/>
					</>
				)
			) : (
				<Button disabled type="button" primary={true} label="Create Scale Request" />
			)}
		</form>
	);
}
