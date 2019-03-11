import * as React from 'react';
import * as jspb from 'google-protobuf';

import { Columns, Box, Button, Value } from 'grommet';

import Loading from './Loading';
import IntegerPicker from './IntegerPicker';
import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import protoMapDiff, { applyProtoMapDiff, Diff, DiffOp, DiffOption } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';
import { Formation, ScaleRequest, CreateScaleRequest } from './generated/controller_pb';

function buildProcessesArray(m: jspb.Map<string, number>): [string, number][] {
	return m.toArray().sort(([ak, av]: [string, number], [bk, bv]: [string, number]) => {
		return ak.localeCompare(bk);
	});
}

interface Props extends ClientProps, ErrorHandlerProps {
	appName: string;
}

interface State {
	formation: Formation | null;
	processes: [string, number][];
	processesDiff: Diff<string, number>;
	hasChanges: boolean;
	isLoading: boolean;
	isConfirming: boolean;
	isDeploying: boolean;
}

class FormationEditor extends React.Component<Props, State> {
	private __streamAppFormationCancel: () => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			formation: null,
			processes: [],
			processesDiff: [],
			hasChanges: false,
			isLoading: true,
			isConfirming: false,
			isDeploying: false
		};

		this.__streamAppFormationCancel = () => {};
		this._getData = this._getData.bind(this);
		this._handleSubmit = this._handleSubmit.bind(this);
		this._handleConfirmSubmit = this._handleConfirmSubmit.bind(this);
		this._handleCancelSubmit = this._handleCancelSubmit.bind(this);
		this._handleReset = this._handleReset.bind(this);
	}

	public componentDidMount() {
		this._getData();
	}

	public componentWillUnmount() {
		this.__streamAppFormationCancel();
	}

	public render() {
		const { formation, processes, hasChanges, isLoading, isConfirming, isDeploying } = this.state;
		if (isLoading) {
			return <Loading />;
		}
		if (!formation) throw new Error('Unexpected lack of formation!');
		let diff = [] as Diff<string, number>;
		if (isConfirming) {
			diff = protoMapDiff(formation.getProcessesMap(), new jspb.Map(processes), DiffOption.INCLUDE_UNCHANGED);
		}
		return (
			<form onSubmit={isConfirming ? this._handleConfirmSubmit : this._handleSubmit}>
				<Columns>
					{isConfirming || isDeploying
						? diff.reduce(
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
									delta = Math.abs(delta);
									m.push(
										<Box align="center" separator="right" key={key}>
											<Value size="large" value={delta !== 0 ? `${val} (${sign}${delta})` : val} label={key} />
										</Box>
									);
									return m;
								},
								[] as React.ReactNodeArray
						  )
						: processes.map(([key, val]: [string, number]) => {
								return (
									<Box align="center" separator="right" key={key}>
										<IntegerPicker
											value={val}
											label={key}
											onChange={(newVal) => {
												this._handleProcessChange(key, newVal);
											}}
										/>
									</Box>
								);
						  })}
				</Columns>
				<br />
				<br />
				{hasChanges ? (
					isConfirming ? (
						<>
							<Button type="submit" primary={true} label="Confirm and Create Scale Request" />
							&nbsp;
							<Button type="button" label="Cancel" onClick={this._handleCancelSubmit} />
						</>
					) : isDeploying ? (
						<>
							<Button primary={true} label="Creating Scale Request" />
						</>
					) : (
						<>
							<Button type="submit" primary={true} label="Create Scale Request" />
							&nbsp;
							<Button type="button" label="Reset" onClick={this._handleReset} />
						</>
					)
				) : (
					<Button type="button" primary={true} label="Create Scale Request" />
				)}
			</form>
		);
	}

	private _getData() {
		const { client, appName, handleError } = this.props;
		this.setState({
			formation: null,
			isLoading: true
		});
		this.__streamAppFormationCancel();
		this.__streamAppFormationCancel = client.streamAppFormation(
			appName,
			(formation: Formation, error: Error | null) => {
				if (error) {
					return handleError(error);
				}

				// preserve changes
				const { hasChanges, processesDiff } = this.state;
				let processesMap = formation.getProcessesMap();
				if (hasChanges) {
					processesMap = applyProtoMapDiff(processesMap, processesDiff);
				}

				this.setState({
					formation,
					processes: buildProcessesArray(processesMap),
					isLoading: false
				});
			}
		);
	}

	private _handleProcessChange(key: string, val: number) {
		const nextProcesses = this.state.processes.map(([k, v]: [string, number]) => {
			if (k === key) {
				return [k, val];
			}
			return [k, v];
		}) as [string, number][];
		const diff = protoMapDiff((this.state.formation || new Formation()).getProcessesMap(), new jspb.Map(nextProcesses));
		this.setState({
			processes: nextProcesses,
			processesDiff: diff,
			hasChanges: diff.length > 0
		});
	}

	private _handleSubmit(e: React.SyntheticEvent) {
		e.preventDefault();
		this.setState({
			isConfirming: true
		});
	}

	private _handleConfirmSubmit(e: React.SyntheticEvent) {
		e.preventDefault();

		// build new formation object with new processes map
		const { formation, processes } = this.state;
		if (!formation) return; // should never be null at this point

		this.setState({
			isConfirming: false,
			isDeploying: true
		});

		const { client, handleError } = this.props;
		const req = new CreateScaleRequest();
		req.setParent(formation.getParent());
		protoMapReplace(req.getProcessesMap(), new jspb.Map(processes));
		protoMapReplace(req.getTagsMap(), formation.getTagsMap());
		client
			.createScale(req)
			.then((scaleReq: ScaleRequest) => {
				this.setState({
					isDeploying: false,
					processes: buildProcessesArray(scaleReq.getNewProcessesMap()),
					processesDiff: [],
					hasChanges: false
				});
			})
			.catch((error: Error) => {
				handleError(error);
			});
	}

	private _handleCancelSubmit(e: React.SyntheticEvent) {
		e.preventDefault();
		this.setState({
			isConfirming: false
		});
	}

	private _handleReset(e: React.SyntheticEvent) {
		e.preventDefault();
		this.setState({
			hasChanges: false,
			processesDiff: [],
			processes: buildProcessesArray((this.state.formation || new Formation()).getProcessesMap())
		});
	}
}

export default withErrorHandler(withClient(FormationEditor));
