import * as React from 'react';
import * as jspb from 'google-protobuf';
import Heading from 'grommet/components/Heading';
import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';
import Notification from 'grommet/components/Notification';

import dataStore, { Resource, WatchFunc } from './dataStore';
import protoMapDiff, { applyProtoMapDiff } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';
import withClient, { ClientProps } from './withClient';
import { ServiceError } from './generated/controller_pb_service';
import { App, Release } from './generated/controller_pb';
import Loading from './Loading';
import ReleaseHistory from './ReleaseHistory';
import EnvEditor from './EnvEditor';

export interface Props extends ClientProps {
	name: string;
}

interface State {
	app: App | null;
	release: Release | null;
	errors: Error[];

	envPersisting: boolean;
	releaseError: ServiceError | null;
	releaseDeploying: boolean;
	releaseDeployError: ServiceError | null;
}

class AppComponent extends React.Component<Props, State> {
	private __dataWatcher: WatchFunc;
	constructor(props: Props) {
		super(props);
		this.state = {
			app: null,
			release: null,
			errors: [],

			envPersisting: false,
			releaseError: null,
			releaseDeploying: false,
			releaseDeployError: null
		};
		this._envPersistHandler = this._envPersistHandler.bind(this);
		this._deployReleaseHandler = this._deployReleaseHandler.bind(this);
		this._handleDataChange = this._handleDataChange.bind(this);
	}

	public componentDidMount() {
		const appName = this.props.name;

		// watch for changes on app and all sub resources (e.g. release)
		this.__dataWatcher = dataStore.watch(appName)(this._handleDataChange);

		// fetch app and release
		this._getData(true);
	}

	public componentWillUnmount() {
		this.__dataWatcher.unsubscribe();
	}

	public render() {
		const { app, release, errors } = this.state;

		if ((!app || !release) && errors.length) {
			return this._renderErrors(errors);
		}

		if (!app || !release) {
			return <Loading />;
		}

		const { envPersisting, releaseError, releaseDeploying, releaseDeployError } = this.state;
		return (
			<React.Fragment>
				<Heading>{app.getDisplayName()}</Heading>
				<Accordion openMulti={true} animate={false} active={0}>
					<AccordionPanel heading="Release History">
						{releaseDeployError ? <Notification status="warning" message={releaseDeployError.message} /> : null}

						<ReleaseHistory
							currentReleaseName={release.getName()}
							persisting={releaseDeploying}
							persist={this._deployReleaseHandler}
						/>
					</AccordionPanel>

					<AccordionPanel heading="Environment">
						{releaseError ? <Notification status="warning" message={releaseError.message} /> : null}
						<EnvEditor
							key={release.getName()}
							entries={release.getEnvMap()}
							persist={this._envPersistHandler}
							persisting={envPersisting}
						/>
					</AccordionPanel>
				</Accordion>
			</React.Fragment>
		);
	}

	private _renderErrors(errors: Error[]) {
		return (
			<React.Fragment>
				{errors.map((error) => {
					<Notification status="warning" message={error.message} />;
				})}
			</React.Fragment>
		);
	}

	private _handleDataChange(name: string, resource: Resource | undefined) {
		this._getData();
	}

	private _getData(shouldFetch: boolean = false) {
		// populate app and release from dataStore if available
		const appName = this.props.name;
		const app = dataStore.get(appName) as App | null;
		const release = (app && (dataStore.get(app.getRelease()) as Release | null)) || null;
		this.setState({
			app: app,
			release: release
		});

		// conditionally fetch app and/or release
		const { client } = this.props;
		let pc = [] as Promise<any>[];
		if (shouldFetch || !app) {
			pc.push(client.getApp(appName));
		}
		if (shouldFetch || !release) {
			pc.push(client.getAppRelease(appName));
		}
		Promise.all(pc).catch((error: Error) => {
			this.setState({
				errors: [error]
			});
		});
	}

	private _deployReleaseHandler(releaseName: string) {
		const { client } = this.props;
		const { app } = this.state;
		if (!app) return;
		this.setState({
			releaseDeploying: true
		});
		client
			.createDeployment(app.getName(), releaseName)
			.then(() => {
				return client.getApp(app.getName());
			})
			.then(() => {
				this.setState({
					releaseDeploying: false
				});
			})
			.catch((error: ServiceError) => {
				this.setState({
					releaseDeploying: false,
					releaseDeployError: error
				});
			});
	}

	private _envPersistHandler(next: jspb.Map<string, string>) {
		const { client } = this.props;
		const { app, release } = this.state;
		if (!app || !release) return;
		const envDiff = protoMapDiff(release.getEnvMap(), next);
		this.setState({
			envPersisting: true
		});
		client
			.getApp(app.getName())
			.then((app) => {
				return client.getRelease(app.getRelease());
			})
			.then((release) => {
				const newRelease = new Release();
				newRelease.setArtifactsList(release.getArtifactsList());
				protoMapReplace(newRelease.getLabelsMap(), release.getLabelsMap());
				protoMapReplace(newRelease.getProcessesMap(), release.getProcessesMap());
				protoMapReplace(newRelease.getEnvMap(), applyProtoMapDiff(release.getEnvMap(), envDiff));
				return client.createRelease(app.getName(), newRelease);
			})
			.then((release) => {
				return client
					.createDeployment(app.getName(), release.getName())
					.then((deployment) => {
						this.setState({
							envPersisting: false
						});
					})
					.then(() => {
						dataStore.del(app.getRelease());
						return client.getApp(app.getName()).then((app) => {
							dataStore.add(app);
						});
					});
			})
			.catch((error: ServiceError) => {
				this.setState({
					envPersisting: false,
					releaseError: error
				});
			});
	}
}
export default withClient(AppComponent);
