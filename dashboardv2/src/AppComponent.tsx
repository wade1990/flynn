import * as React from 'react';
import Heading from 'grommet/components/Heading';
import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';
import Notification from 'grommet/components/Notification';

import dataStore, { Resource, WatchFunc } from './dataStore';
import withClient, { ClientProps } from './withClient';
import { ServiceError } from './generated/controller_pb_service';
import { App } from './generated/controller_pb';
import Loading from './Loading';
import ReleaseHistory from './ReleaseHistory';
import EnvEditor from './EnvEditor';

export interface Props extends ClientProps {
	name: string;
}

interface State {
	app: App | null;
	errors: Error[];

	releaseDeploying: boolean;
	releaseDeployError: ServiceError | null;
}

class AppComponent extends React.Component<Props, State> {
	private __dataWatcher: WatchFunc;
	constructor(props: Props) {
		super(props);
		this.state = {
			app: null,
			errors: [],

			releaseDeploying: false,
			releaseDeployError: null
		};
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
		const { app, errors } = this.state;

		if (errors.length) {
			return this._renderErrors(errors);
		}

		if (!app) {
			return <Loading />;
		}

		const { releaseDeploying, releaseDeployError } = this.state;
		return (
			<React.Fragment>
				<Heading>{app.getDisplayName()}</Heading>
				<Accordion openMulti={true} animate={false} active={0}>
					<AccordionPanel heading="Release History">
						{releaseDeployError ? <Notification status="warning" message={releaseDeployError.message} /> : null}

						<ReleaseHistory
							currentReleaseName={app.getRelease()}
							persisting={releaseDeploying}
							persist={this._deployReleaseHandler}
						/>
					</AccordionPanel>

					<AccordionPanel heading="Environment">
						<EnvEditor key={app.getRelease()} appName={app.getName()} />
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
		this.setState({
			app: app
		});

		// conditionally fetch app and/or release
		const { client } = this.props;
		if (shouldFetch || !app) {
			client.getApp(appName).catch((error: Error) => {
				this.setState({
					errors: [error]
				});
			});
		}
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
}
export default withClient(AppComponent);
