import * as React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Grommet, Box, Paragraph, Heading } from 'grommet';
import { aruba } from 'grommet-theme-aruba';

import Split from './Split';
import Loading from './Loading';
import Notification from './Notification';
import AppsListNav from './AppsListNav';
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

function appNameFromPath(path: string): string {
	const m = path.match(/\/apps\/[^/]+/);
	return m ? m[0].slice(1) : '';
}

/*
 * <Dashboard> is the root component of the dashboard app
 */
export default function Dashboard() {
	const [currentPath, setCurrentPath] = React.useState<string>(window.location.pathname);
	const [appName, setAppName] = React.useState<string>(appNameFromPath(currentPath));
	React.useEffect(
		() => {
			setAppName(appNameFromPath(currentPath));
		},
		[currentPath]
	);

	const [error, setError] = React.useState<Error | null>(null);
	React.useEffect(() => {
		const discardErrorHandler = registerErrorHandler((error: Error) => {
			setError(error);
		});
		return discardErrorHandler;
	}, []);

	return (
		<Grommet full theme={aruba} cssVars>
			<Router>
				<Split>
					<Box tag="aside" basis="medium" flex={false} background="neutral-1" fill>
						<Box tag="header" pad="medium">
							<h1>Flynn Dashboard</h1>
						</Box>
						<Box>
							<AppsListNav onNav={(path: string) => setCurrentPath(path)} />
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
								<ExternalAnchor href="https://flynn.io/docs/trademark-guidelines">Trademark Guidelines</ExternalAnchor>
							</Paragraph>
						</Box>
					</Box>

					<Box pad="medium" fill overflow="scroll">
						{error ? <Notification message={error.message} status="warning" onClose={() => setError(null)} /> : null}
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
