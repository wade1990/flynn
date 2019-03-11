import * as React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import GrommetApp from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Paragraph from 'grommet/components/Paragraph';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import Title from 'grommet/components/Title';
import Heading from 'grommet/components/Heading';
import Notification from 'grommet/components/Notification';

import Loading from './Loading';
import AppsListNav from './AppsListNav';
import withClient, { ClientProps } from './withClient';
import ExternalAnchor from './ExternalAnchor';
import { registerErrorHandler } from './withErrorHandler';

const AppComponent = React.lazy(() => import('./AppComponent'));

export interface Props extends ClientProps {}

interface State {
	error: Error | null;
	appName: string;
}

// DEBUG:
import { default as client, Client } from './client';
declare global {
	interface Window {
		client: Client;
	}
}
if (typeof window !== 'undefined') {
	window.client = client;
}

class Dashboard extends React.Component<Props, State> {
	private _discardErrorHandler: () => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			appName: this._appName(window.location.pathname),
			error: null
		};
		this._discardErrorHandler = () => {};
		this._handleErrorDismiss = this._handleErrorDismiss.bind(this);
	}

	public componentDidMount() {
		this._discardErrorHandler = registerErrorHandler((error: Error) => {
			console.log('Dashboard handle error', error);
			this.setState({ error });
		});
	}

	public componentDidCatch(error: Error, info: any) {
		console.log('Dashboard componentDidCatch', error, info);
		this.setState({ error });
	}

	public componentWillUnmount() {
		this._discardErrorHandler();
	}

	public render() {
		const { error, appName } = this.state;

		return (
			<GrommetApp centered={false}>
				<Router>
					<Split flex="right">
						<Sidebar colorIndex="neutral-1">
							<Header pad="medium" justify="between">
								<Title>Flynn Dashboard</Title>
							</Header>
							<Box flex="grow" justify="start">
								<AppsListNav
									onNav={(path: string) => {
										this.setState({ appName: this._appName(path) });
									}}
								/>
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
							{error ? (
								<Notification
									status="warning"
									message={error.message}
									closer={true}
									onClose={this._handleErrorDismiss}
								/>
							) : null}
							<React.Suspense fallback={<Loading />}>
								<Switch>
									<Route path="/apps/:appID">
										<AppComponent key={appName} name={appName} />
									</Route>
									<Route path="/">
										<Heading>Select an app to begin.</Heading>
									</Route>
								</Switch>
							</React.Suspense>
						</Box>
					</Split>
				</Router>
			</GrommetApp>
		);
	}

	private _appName(path: string) {
		const m = path.match(/\/apps\/[^\/]+/);
		return m ? m[0].slice(1) : '';
	}

	private _handleErrorDismiss() {
		this.setState({ error: null });
	}
}

export default withClient(Dashboard);
