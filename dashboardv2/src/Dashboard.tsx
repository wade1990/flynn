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

import AppsListNav from './AppsListNav';
import AppComponent from './AppComponent';
import withClient, { ClientProps } from './withClient';
import { AppNameContext } from './withAppName';
import ExternalAnchor from './ExternalAnchor';
import { App } from './generated/controller_pb';
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
}

class Dashboard extends React.Component<Props, State> {
	private _appsUnsub: () => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			appsList: [],
			appsListLoading: true,
			appsListError: null
		};
		this._appsUnsub = () => {};
		this._handleAppsListChange = this._handleAppsListChange.bind(this);
	}

	public componentDidMount() {
		this._fetchApps();
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

	private _appName() {
		const { location } = this.props;
		const m = location.pathname.match(/\/apps\/[^\/]+/);
		return m ? m[0].slice(1) : '';
	}

	public render() {
		const { appsList, appsListError } = this.state;
		const appName = this._appName();

		return (
			<GrommetApp centered={false}>
				<AppNameContext.Provider value={appName}>
					<Split flex="right">
						<Sidebar colorIndex="neutral-1">
							<Header pad="medium" justify="between">
								<Title>Flynn Dashboard</Title>
							</Header>
							<Box flex="grow" justify="start">
								{appsListError ? <Notification status="warning" message={appsListError.message} /> : null}
								<AppsListNav appsList={appsList} onNav={() => {}} />
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
									<ExternalAnchor href="https://flynn.io/docs/trademark-guidelines">
										Trademark Guidelines
									</ExternalAnchor>
								</Paragraph>
							</Footer>
						</Sidebar>

						<Box pad="medium">
							<Switch>
								<Route path="/apps/:appID">
									<AppComponent key={appName} name={appName} />
								</Route>
							</Switch>
						</Box>
					</Split>
				</AppNameContext.Provider>
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
