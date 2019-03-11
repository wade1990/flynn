import * as React from 'react';

import Loading from './Loading';
import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import { Formation } from './generated/controller_pb';

interface Props extends ClientProps, ErrorHandlerProps {
	appName: string;
}

interface State {
	formation: Formation | null;
	processes: [string, number][];
	isLoading: boolean;
}

class FormationEditor extends React.Component<Props, State> {
	private __streamAppFormationCancel: () => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			formation: null,
			processes: [],
			isLoading: true
		};

		this.__streamAppFormationCancel = () => {};
		this._getData = this._getData.bind(this);
	}

	public componentDidMount() {
		this._getData();
	}

	public componentWillUnmount() {
		this.__streamAppFormationCancel();
	}

	public render() {
		const { formation, processes, isLoading } = this.state;
		if (isLoading) {
			return <Loading />;
		}
		if (!formation) throw new Error('Unexpected lack of formation!');
		return (
			<>
				{processes.map(([key, val]: [string, number]) => {
					return (
						<div key={key}>
							{key}: {val}
						</div>
					);
				})}
			</>
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

				this.setState({
					formation,
					processes: formation
						.getProcessesMap()
						.toArray()
						.sort(([ak, av]: [string, number], [bk, bv]: [string, number]) => {
							return ak.localeCompare(bk);
						}),
					isLoading: false
				});
			}
		);
	}
}

export default withErrorHandler(withClient(FormationEditor));
