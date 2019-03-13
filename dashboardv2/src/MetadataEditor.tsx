import * as React from 'react';
import * as jspb from 'google-protobuf';
import { CheckmarkIcon, Button } from 'grommet';
import Loading from './Loading';
import KeyValueEditor, { KeyValueData, renderKeyValueDiff } from './KeyValueEditor';
import protoMapReplace from './util/protoMapReplace';
import protoMapDiff from './util/protoMapDiff';
import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import { App } from './generated/controller_pb';

interface Props extends ClientProps, ErrorHandlerProps {
	appName: string;
}

interface State {
	isLoading: boolean;
	isConfirming: boolean;
	isDeploying: boolean;
	app: App | null;
	data: KeyValueData | null;
}

class MetadataEditor extends React.Component<Props, State> {
	private __streamAppCancel: () => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			isLoading: true,
			isConfirming: false,
			isDeploying: false,
			app: null,
			data: null
		};

		this.__streamAppCancel = () => {};
		this._getData = this._getData.bind(this);
		this._handleChange = this._handleChange.bind(this);
		this._handleSubmit = this._handleSubmit.bind(this);
		this._handleConfirmSubmit = this._handleConfirmSubmit.bind(this);
		this._handleCancelBtnClick = this._handleCancelBtnClick.bind(this);
	}

	public componentDidMount() {
		this._getData();
	}

	public componentWillUnmount() {
		this.__streamAppCancel();
	}

	public render() {
		const { isLoading, data, isConfirming } = this.state;
		if (isLoading) {
			return <Loading />;
		}
		if (isConfirming) {
			return this._renderDeployMetadata();
		}
		return (
			<KeyValueEditor
				data={data || new KeyValueData(new jspb.Map<string, string>([]))}
				onChange={this._handleChange}
				onSubmit={this._handleSubmit}
			/>
		);
	}

	private _renderDeployMetadata() {
		const { isDeploying } = this.state;
		const app = this.state.app as App;
		const data = this.state.data as KeyValueData;
		return (
			<form onSubmit={this._handleConfirmSubmit}>
				<h3>Review Changes</h3>
				{renderKeyValueDiff(app.getLabelsMap(), data.entries())}
				{isDeploying ? (
					// Disabled button
					<Button type="button" primary icon={<CheckmarkIcon />} label="Saving..." />
				) : (
					<Button type="submit" primary icon={<CheckmarkIcon />} label="Save" />
				)}
				&nbsp;
				<Button type="button" label="Cancel" onClick={this._handleCancelBtnClick} />
			</form>
		);
	}

	private _getData() {
		const { client, appName, handleError } = this.props;
		this.setState({
			app: null,
			data: null,
			isLoading: true
		});
		this.__streamAppCancel();
		this.__streamAppCancel = client.streamApp(appName, (app: App, error: Error | null) => {
			if (error !== null) {
				return handleError(error);
			}

			// maintain any changes made
			const prevApp = this.state.app;
			const prevData = this.state.data;
			const data = new KeyValueData(app.getLabelsMap());
			if (prevApp && prevData) {
				data.applyDiff(protoMapDiff(prevApp.getLabelsMap(), prevData.entries()));
			}

			this.setState({
				app,
				data,
				isLoading: false
			});
		});
	}

	private _handleChange(entries: KeyValueData) {
		this.setState({
			data: entries
		});
	}

	private _handleSubmit(entries: KeyValueData) {
		this.setState({
			isConfirming: true,
			data: entries
		});
	}

	private _handleConfirmSubmit(event: React.SyntheticEvent) {
		event.preventDefault();
		const data = this.state.data as KeyValueData;
		const { client, appName, handleError } = this.props;
		const app = new App();
		app.setName(appName);
		protoMapReplace(app.getLabelsMap(), data.entries());
		this.setState({
			isDeploying: true
		});
		client
			.updateAppMeta(app)
			.then((app) => {
				const data = new KeyValueData(app.getLabelsMap());
				this.setState({
					data,
					isDeploying: false,
					isConfirming: false
				});
			})
			.catch(handleError);
	}

	private _handleCancelBtnClick(event: React.SyntheticEvent) {
		event.preventDefault();
		this.setState({
			isConfirming: false
		});
	}
}

export default withErrorHandler(withClient(MetadataEditor));
