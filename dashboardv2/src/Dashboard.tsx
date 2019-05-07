import * as React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Grommet, Box, Paragraph, Heading } from 'grommet';
import { aruba } from 'grommet-theme-aruba';

import Split from './Split';
import Loading from './Loading';
import Notification from './Notification';
import AppsListNav from './AppsListNav';
import withClient, { ClientProps } from './withClient';
import ExternalAnchor from './ExternalAnchor';
import { registerErrorHandler } from './withErrorHandler';

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

const AppComponent = React.lazy(() => import('./AppComponent'));

export interface Props extends ClientProps {}

interface State {
	error: Error | null;
	appName: string;
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
			<Grommet full theme={aruba} cssVars>
				<Router>
					<Split>
						<Box tag="aside" basis="medium" flex={false} background="neutral-1" fill>
							<Box tag="header" pad="medium">
								<h1>Flynn Dashboard</h1>
							</Box>
							<Box>
								<AppsListNav
									onNav={(path: string) => {
										this.setState({ appName: this._appName(path) });
									}}
								/>
							</Box>
							<Box tag="footer" direction="row" pad="small" align="center" background="grey-1">
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
							</Box>
						</Box>

						<Box pad="medium" fill overflow="scroll">
							{error ? (
								<Notification message={error.message} status="warning" onClose={this._handleErrorDismiss} />
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
			</Grommet>
		);
	}

	private _appName(path: string) {
		const m = path.match(/\/apps\/[^/]+/);
		return m ? m[0].slice(1) : '';
	}

	private _handleErrorDismiss() {
		this.setState({ error: null });
	}
}

export default withClient(Dashboard);
