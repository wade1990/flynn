import * as React from 'react';
import { Switch, Route, withRouter, RouteComponentProps } from 'react-router-dom';

import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import GrommetApp from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Notification from 'grommet/components/Notification';
import Paragraph from 'grommet/components/Paragraph';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import Title from 'grommet/components/Title';

import Loading from './Loading';
import AppsListNav from './AppsListNav';
import AppComponent from './AppComponent';
import withClient, { ClientProps } from './withClient';
import ExternalAnchor from './ExternalAnchor';
import { App, Release } from './generated/controller_pb';
import { ServiceError } from './generated/controller_pb_service';
import dataStore, { DataStore } from './dataStore';

export interface Props extends RouteComponentProps<{}>, ClientProps {}

// DEBUG:
declare global {
	interface Window {
		dataStore: DataStore;
	}
}
window.dataStore = dataStore;

interface State {
	appsList: Array<App>;
	appsListLoading: boolean;
	appsListError: ServiceError | null;

	app: App | null;
	release: Release | null;
	appLoading: boolean;
	appError: ServiceError | null;
}

class Dashboard extends React.Component<Props, State> {
	private _appsUnsub: () => void;
	private _appUnsub: () => void;
	private _releaseUnsub: () => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			appsList: [],
			appsListLoading: true,
			appsListError: null,

			app: null,
			release: null,
			appLoading: props.location.pathname.startsWith('/apps/'),
			appError: null
		};
		this._appsUnsub = () => {};
		this._appUnsub = () => {};
		this._releaseUnsub = () => {};
		this._fetchApp = this._fetchApp.bind(this);
		this._handleAppsListChange = this._handleAppsListChange.bind(this);
		this._handleAppChange = this._handleAppChange.bind(this);
		this._handleReleaseChange = this._handleReleaseChange.bind(this);
	}

	public componentDidMount() {
		const { location } = this.props;
		this._fetchApps();
		this._fetchApp(location.pathname);
	}

	private _fetchApps() {
		this._appsUnsub();
		this.props.client
			.listApps()
			.then((apps) => {
				this._appsUnsub = dataStore.add(...apps).arrayWatcher(this._handleAppsListChange).unsubscribe;
				this.setState({
					appsList: apps,
					appsListLoading: false,
					appsListError: null
				});
			})
			.catch((error: ServiceError) => {
				this.setState({
					appsList: [],
					appsListLoading: false,
					appsListError: error
				});
			});
	}

	private _handleAppsListChange(apps: any[], name: string, data: any) {
		this.setState({
			appsList: apps as App[]
		});
	}

	private _fetchApp(path: string) {
		this._appUnsub();
		this._releaseUnsub();

		this.setState({
			appLoading: true
		});

		const m = path.match(/\/apps\/[^\/]+/);
		const appName = m ? m[0].slice(1) : '';
		this.props.client
			.getApp(appName)
			.then((app: App) => {
				this._appUnsub = dataStore.add(app)(this._handleAppChange).unsubscribe;
				return this.props.client.getRelease(app.getRelease()).then((release) => {
					return [app, release];
				});
			})
			.then(([app, release]: [App, Release]) => {
				this._releaseUnsub = dataStore.add(release)(this._handleReleaseChange).unsubscribe;
				this.setState({
					app: app,
					release: release,
					appError: null,
					appLoading: false
				});
			})
			.catch((error: ServiceError) => {
				this.setState({
					app: null,
					release: null,
					appError: error,
					appLoading: false
				});
			});
	}

	private _handleAppChange(name: string, data: any) {
		const app = (data || null) as App | null;
		let release = this.state.release;
		if (this.state.app && app && app.getRelease() !== this.state.app.getRelease()) {
			this._releaseUnsub();
			this._releaseUnsub = dataStore.watch(app.getRelease())(this._handleReleaseChange).unsubscribe;
			const newRelease = dataStore.get(app.getRelease());
			if (newRelease) {
				release = newRelease as Release;
			}
		}
		this.setState({
			app,
			release
		});
	}

	private _handleReleaseChange(name: string, data: any) {
		this.setState({
			release: (data || null) as Release | null
		});
	}

	public render() {
		const { appsList, appsListError, app, release, appError, appLoading } = this.state;

		return (
			<GrommetApp centered={false}>
				<Split flex="right">
					<Sidebar colorIndex="neutral-1">
						<Header pad="medium" justify="between">
							<Title>Flynn Dashboard</Title>
						</Header>
						<Box flex="grow" justify="start">
							{appsListError ? <Notification status="warning" message={appsListError.message} /> : null}
							<AppsListNav appsList={appsList} onNav={this._fetchApp} />
						</Box>
						<Footer appCentered={true} direction="column" pad="small" colorIndex="grey-1">
							<Paragraph size="small">
								Flynn is designed, built, and managed by Prime Directive, Inc.
								<br />
								&copy; 2013-
								{new Date().getFullYear()} Prime Directive, Inc. Flynn® is a trademark of Prime Directive, Inc.
							</Paragraph>
							<Paragraph size="small">
								<ExternalAnchor href="https://flynn.io/legal/privacy">Privacy Policy</ExternalAnchor>
								&nbsp;|&nbsp;
								<ExternalAnchor href="https://flynn.io/docs/trademark-guidelines">Trademark Guidelines</ExternalAnchor>
							</Paragraph>
						</Footer>
					</Sidebar>

					<Box pad="medium">
						<Switch>
							<Route path="/apps/:name">
								<React.Fragment>
									{appLoading ? (
										<Loading />
									) : (
										<React.Fragment>
											{appError ? <Notification status="warning" message={appError.message} /> : null}
											{app && release ? <AppComponent app={app} release={release} /> : null}
										</React.Fragment>
									)}
								</React.Fragment>
							</Route>
						</Switch>
					</Box>
				</Split>
			</GrommetApp>
		);
	}
}

class DashboardContainer extends React.Component<Props> {
	public render() {
		return <Dashboard {...this.props} />;
	}
}

export default withRouter(withClient(DashboardContainer));
