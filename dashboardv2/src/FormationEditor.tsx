import * as React from 'react';
import * as jspb from 'google-protobuf';
import { Box, Button, Text } from 'grommet';

import useClient from './useClient';
import useAppFormation from './useAppFormation';
import { handleError } from './withErrorHandler';
import Loading from './Loading';
import ProcessScale from './ProcessScale';
import protoMapDiff, { applyProtoMapDiff, Diff, DiffOp, DiffOption } from './util/protoMapDiff';
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

interface State {
	formation: Formation | null;
	processes: [string, number][];
	processesDiff: Diff<string, number>;
	processesFullDiff: Diff<string, number>; // includes keep entries for rendering
	hasChanges: boolean;
	isLoading: boolean;
	isConfirming: boolean;
	isCreating: boolean;
}

export default function FormationEditor({ appName }: Props) {
	const client = useClient();
	const { formation, loading: isLoading, error: formationError } = useAppFormation(appName);
	const [initialProcesses, setInitialProcesses] = React.useState<jspb.Map<string, number>>(
		new jspb.Map<string, number>([])
	);
	const [processes, setProcesses] = React.useState<[string, number][]>([]);
	const [processesDiff, setProcessesDiff] = React.useState<Diff<string, number>>([]);
	const [processesFullDiff, setProcessesFullDiff] = React.useState<Diff<string, number>>([]); // includes keep entries for rendering
	const [hasChanges, setHasChanges] = React.useState(false);
	const [isConfirming, setIsConfirming] = React.useState(false);
	const [isCreating, setIsCreating] = React.useState(false);

	React.useEffect(
		() => {
			if (formationError) {
				handleError(formationError);
			}
		},
		[formationError]
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
			const fullDiff = protoMapDiff(
				(formation || new Formation()).getProcessesMap(),
				new jspb.Map(processes),
				DiffOption.INCLUDE_UNCHANGED
			);
			setProcessesDiff(diff);
			setProcessesFullDiff(fullDiff);
			setHasChanges(diff.length > 0);
		},
		[processes] // eslint-disable-line react-hooks/exhaustive-deps
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
			<Box direction="row" gap="small">
				{isConfirming || isCreating || isPending ? (
					processesFullDiff.reduce(
						(m: React.ReactNodeArray, op: DiffOp<string, number>) => {
							const key = op.key;
							let startVal = formation.getProcessesMap().get(key) || 0;
							let val = op.value || 0;
							if (op.op === 'remove') {
								return m;
							}
							if (op.op === 'keep') {
								val = startVal;
							}
							let delta = val - startVal;
							let sign = '+';
							if (delta < 0) {
								sign = '-';
							}
							if (isPending) {
								// don't show delta
								delta = 0;
							} else {
								delta = Math.abs(delta);
							}
							m.push(
								<Box align="center" key={key}>
									<ProcessScale value={val} label={delta !== 0 ? `${key} (${sign}${delta})` : key} />
								</Box>
							);
							return m;
						},
						[] as React.ReactNodeArray
					)
				) : processes.length === 0 ? (
					<Text color="dark-2">&lt;No processes&gt;</Text>
				) : (
					processes.map(([key, val]: [string, number]) => {
						return (
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
						);
					})
				)}
			</Box>
			<br />
			<br />
			{hasChanges && !isPending ? (
				isConfirming ? (
					<>
						<Button type="submit" primary={true} label="Confirm and Create Scale Request" />
						&nbsp;
						<Button
							type="button"
							label="Cancel"
							onClick={(e: React.SyntheticEvent) => {
								e.preventDefault();
								setIsConfirming(true);
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
