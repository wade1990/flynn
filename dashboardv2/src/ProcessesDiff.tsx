import * as React from 'react';
import { Box, BoxProps } from 'grommet';

import ProcessScale from './ProcessScale';
import protoMapDiff, { Diff, DiffOp, DiffOption } from './util/protoMapDiff';
import { Formation, ScaleRequestState } from './generated/controller_pb';

interface Props extends BoxProps {
	formation: Formation;
	nextFormation: Formation;
	confirmScaleToZero?: boolean;
	onConfirmScaleToZeroChange?: (confirmed: boolean) => void;
}

export default function ProcessesDiff({
	formation,
	nextFormation,
	confirmScaleToZero = true,
	onConfirmScaleToZeroChange = () => {},
	...boxProps
}: Props) {
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

	const [isScaleToZeroConfirmed, setIsScaleToZeroConfirmed] = React.useState<boolean | null>(null);
	const [scaleToZeroConfirmed, setScaleToZeroConfirmed] = React.useState(new Map<string, boolean>());
	const scaleToZeroConfirmationRequired = React.useMemo(
		() => {
			const keys = new Set<string>();
			if (!confirmScaleToZero) return keys;
			processesFullDiff.forEach((op) => {
				if (op.op === 'remove' || op.value === 0) {
					keys.add(op.key);
				}
			});
			return keys;
		},
		[confirmScaleToZero, processesFullDiff]
	);
	React.useEffect(
		() => {
			let isConfirmed = true;
			for (let k of scaleToZeroConfirmationRequired) {
				if (scaleToZeroConfirmed.get(k) !== true) {
					isConfirmed = false;
				}
			}
			if (isScaleToZeroConfirmed !== isConfirmed || isScaleToZeroConfirmed === null) {
				setIsScaleToZeroConfirmed(isConfirmed);
				onConfirmScaleToZeroChange(isConfirmed);
			}
		},
		[onConfirmScaleToZeroChange, scaleToZeroConfirmationRequired, scaleToZeroConfirmed] // eslint-disable-line react-hooks/exhaustive-deps
	);

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
					m.push(
						<Box align="center" key={key}>
							<ProcessScale
								confirmScaleToZero={confirmScaleToZero}
								scaleToZeroConfirmed={scaleToZeroConfirmed.get(key)}
								onConfirmChange={(isConfirmed) => {
									const nextScaleToZeroConfirmed = new Map(scaleToZeroConfirmed);
									nextScaleToZeroConfirmed.set(key, isConfirmed);
									setScaleToZeroConfirmed(nextScaleToZeroConfirmed);
								}}
								value={val}
								originalValue={startVal}
								showDelta={!isPending}
								label={key}
							/>
						</Box>
					);
					return m;
				},
				[] as React.ReactNodeArray
			)}
		</Box>
	);
}
