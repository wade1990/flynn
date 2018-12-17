import * as React from 'react';
import { Switch, Route, withRouter, RouteComponentProps } from 'react-router-dom';

import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import GrommetApp from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Paragraph from 'grommet/components/Paragraph';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import Title from 'grommet/components/Title';

import AppsListNav from './AppsListNav';
import AppComponent from './AppComponent';
import withClient, { ClientProps } from './withClient';
import { AppNameContext } from './withAppName';
import ExternalAnchor from './ExternalAnchor';
import dataStore, { DataStore } from './dataStore';

export interface Props extends RouteComponentProps<{}>, ClientProps {}

// DEBUG:
declare global {
	interface Window {
		dataStore: DataStore;
	}
}
window.dataStore = dataStore;

class Dashboard extends React.Component<Props> {
	constructor(props: Props) {
		super(props);
	}

	private _appName() {
		const { location } = this.props;
		const m = location.pathname.match(/\/apps\/[^\/]+/);
		return m ? m[0].slice(1) : '';
	}

	public render() {
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
								<AppsListNav onNav={() => {}} />
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

export default withRouter(withClient(Dashboard));
