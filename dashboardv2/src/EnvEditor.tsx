import * as React from 'react';
import * as jspb from 'google-protobuf';
import { Layer, Box } from 'grommet';
import Loading from './Loading';
import CreateDeployment from './CreateDeployment';
import KeyValueEditor, { KeyValueData } from './KeyValueEditor';
import protoMapDiff, { applyProtoMapDiff } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';
import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import { Release } from './generated/controller_pb';

interface Props extends ClientProps, ErrorHandlerProps {
	appName: string;
}

interface State {
	release: Release | null;
	isLoading: boolean;
	isDeploying: boolean;
	envState: KeyValueData | null;
	newRelease: Release | null;
}

class EnvEditor extends React.Component<Props, State> {
	private __streamAppReleaseCancel: () => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			release: null,
			isLoading: true,
			isDeploying: false,
			envState: null,
			newRelease: null
		};

		this.__streamAppReleaseCancel = () => {};
		this._getData = this._getData.bind(this);
		this._handleChange = this._handleChange.bind(this);
		this._handleSubmit = this._handleSubmit.bind(this);
		this._buildNewRelease = this._buildNewRelease.bind(this);
		this._handleDeployCancel = this._handleDeployCancel.bind(this);
		this._handleDeploymentCreate = this._handleDeploymentCreate.bind(this);
	}

	public componentDidMount() {
		this._getData();
	}

	public componentWillUnmount() {
		this.__streamAppReleaseCancel();
	}

	public render() {
		const { appName } = this.props;
		const { release, isLoading, isDeploying, envState, newRelease } = this.state;
		if (isLoading) {
			return <Loading />;
		}
		if (!release) throw new Error('Unexpected lack of release!');
		return (
			<>
				{isDeploying ? (
					<Layer closer overlayClose align="right" onClose={this._handleDeployCancel}>
						<Box full="vertical" justify="center" pad="small">
							<CreateDeployment
								appName={appName}
								newRelease={newRelease || undefined}
								onCancel={this._handleDeployCancel}
								onCreate={this._handleDeploymentCreate}
							/>
						</Box>
					</Layer>
				) : null}
				<KeyValueEditor
					data={envState || new KeyValueData(release.getEnvMap())}
					keyPlaceholder="ENV key"
					valuePlaceholder="ENV value"
					onChange={this._handleChange}
					onSubmit={this._handleSubmit}
				/>
			</>
		);
	}

	private _getData() {
		const { client, appName, handleError } = this.props;
		this.setState({
			release: null,
			envState: null,
			isLoading: true
		});
		this.__streamAppReleaseCancel();
		this.__streamAppReleaseCancel = client.streamAppRelease(appName, (release: Release, error: Error | null) => {
			if (error) {
				return handleError(error);
			}

			// maintain any changes made
			const envState = new KeyValueData(release.getEnvMap());
			const prevKeyValueData = this.state.envState;
			const prevRelease = this.state.release;
			if (!prevRelease || prevRelease.getName() !== release.getName()) {
				if (prevKeyValueData && prevKeyValueData.hasChanges) {
					const envDiff = protoMapDiff(
						prevRelease ? prevRelease.getEnvMap() : new jspb.Map<string, string>([]),
						prevKeyValueData.entries()
					);
					if (envDiff.length) {
						envState.applyDiff(envDiff);
					}
				}
			}

			this.setState({
				release,
				envState,
				newRelease: this.state.isDeploying ? this._buildNewRelease(release, envState) : null,
				isLoading: false
			});
		});
	}

	private _handleChange(entries: KeyValueData) {
		this.setState({
			envState: entries
		});
	}

	private _handleSubmit(entries: KeyValueData) {
		this.setState({
			isDeploying: true,
			newRelease: this._buildNewRelease(this.state.release as Release, entries),
			envState: entries
		});
	}

	private _buildNewRelease(currentRelease: Release, envState: KeyValueData): Release {
		const envDiff = protoMapDiff(currentRelease.getEnvMap(), envState.entries());
		const newRelease = new Release();
		newRelease.setArtifactsList(currentRelease.getArtifactsList());
		protoMapReplace(newRelease.getLabelsMap(), currentRelease.getLabelsMap());
		protoMapReplace(newRelease.getProcessesMap(), currentRelease.getProcessesMap());
		protoMapReplace(newRelease.getEnvMap(), applyProtoMapDiff(currentRelease.getEnvMap(), envDiff));
		return newRelease;
	}

	private _handleDeployCancel() {
		this.setState({
			isDeploying: false
		});
	}

	private _handleDeploymentCreate() {
		this.setState({
			isDeploying: false,
			envState: null
		});
	}
}

export default withErrorHandler(withClient(EnvEditor));
