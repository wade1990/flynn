import * as React from 'react';
import * as jspb from 'google-protobuf';
import Heading from 'grommet/components/Heading';
import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';
import Notification from 'grommet/components/Notification';

import protoMapDiff, { applyProtoMapDiff } from './util/protoMapDiff';
import protoMapReplace from './util/protoMapReplace';
import withClient, { ClientProps } from './withClient';
import { ServiceError } from './generated/controller_pb_service';
import { App, Release } from './generated/controller_pb';
import ReleaseHistory from './ReleaseHistory';
import EnvEditor from './EnvEditor';
import dataStore from './dataStore';

export interface Props extends ClientProps {
	app: App;
	release: Release;
}

interface State {
	envPersisting: boolean;
	releaseError: ServiceError | null;
	releaseDeploying: boolean;
	releaseDeployError: ServiceError | null;
}

class AppComponent extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			envPersisting: false,
			releaseError: null,
			releaseDeploying: false,
			releaseDeployError: null
		};
		this._envPersistHandler = this._envPersistHandler.bind(this);
		this._deployReleaseHandler = this._deployReleaseHandler.bind(this);
	}

	public render() {
		const { app, release } = this.props;
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

	private _deployReleaseHandler(releaseName: string) {
		const { client, app } = this.props;
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
		const { client, app, release } = this.props;
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
