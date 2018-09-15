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
import {
	ListAppsRequest,
	ListAppsResponse,
	GetAppRequest,
	GetReleaseRequest,
	App,
	Release
} from './generated/controller_pb';
import { ServiceError } from './generated/controller_pb_service';

export interface Props extends RouteComponentProps<{}>, ClientProps {}

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
		this._fetchApp = this._fetchApp.bind(this);
	}
	public componentDidMount() {
		const { location } = this.props;
		this._fetchApps();
		this._fetchApp(location.pathname);
	}

	private _fetchApps() {
		this.props.client.listApps(new ListAppsRequest(), (error: ServiceError, response: ListAppsResponse | null) => {
			this.setState({
				appsList: response ? response.getAppsList() : [],
				appsListLoading: false,
				appsListError: error
			});
		});
	}

	private _fetchApp(path: string) {
		this.setState({
			appLoading: true
		});

		const getAppRequest = new GetAppRequest();
		const getReleaseRequest = new GetReleaseRequest();
		// TODO: release ID
		const m = path.match(/\/apps\/[^\/]+/);
		const appName = m ? m[0].slice(1) : '';
		getAppRequest.setName(appName);
		new Promise<App>((resolve, reject) => {
			this.props.client.getApp(getAppRequest, (error: ServiceError, response: App | null) => {
				if (response && error === null) {
					resolve(response);
				} else {
					reject(error);
				}
			});
		})
			.then((app: App) => {
				getReleaseRequest.setName(app.getRelease());
				return new Promise<Array<App | Release>>((resolve, reject) => {
					this.props.client.getRelease(getReleaseRequest, (error: ServiceError, response: Release | null) => {
						if (response && error === null) {
							resolve([app, response]);
						} else {
							reject(error);
						}
					});
				});
			})
			.then(([app, release]: [App, Release]) => {
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
