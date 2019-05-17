import * as React from 'react';
import { Box, BoxProps } from 'grommet';

import ProcessScale from './ProcessScale';
import protoMapDiff, { Diff, DiffOp, DiffOption } from './util/protoMapDiff';
import { Formation, ScaleRequestState } from './generated/controller_pb';

interface Props extends BoxProps {
	formation: Formation;
	nextFormation: Formation;
}

export default function ProcessesDiff({ formation, nextFormation, ...boxProps }: Props) {
	const [processesFullDiff, setProcessesFullDiff] = React.useState<Diff<string, number>>([]);
	React.useEffect(
		// keep up-to-date full diff of processes
		() => {
			const fullDiff = protoMapDiff(
				(formation || new Formation()).getProcessesMap(),
				nextFormation.getProcessesMap(),
				DiffOption.INCLUDE_UNCHANGED,
				DiffOption.NO_DUPLICATE_KEYS
			);
			setProcessesFullDiff(fullDiff);
		},
		[nextFormation, formation]
	);

	const isPending = formation.getState() === ScaleRequestState.SCALE_PENDING;

	return (
		<Box direction="row" gap="small" {...boxProps}>
			{processesFullDiff.reduce(
				(m: React.ReactNodeArray, op: DiffOp<string, number>) => {
					const key = op.key;
					let startVal = formation.getProcessesMap().get(key) || 0;
					let val = op.value || 0;
					if (op.op === 'remove') {
						val = 0;
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
			)}
		</Box>
	);
}
