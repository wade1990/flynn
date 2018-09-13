import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';

import NavLink from './NavLink';
import { App } from './generated/controller_pb';

export interface Props extends RouteComponentProps<{}> {
	appsList: Array<App>;
	onNav(path: string): void;
}

class AppsListNav extends React.Component<Props> {
	public render() {
		const { appsList, location } = this.props;

		let selectedAppRouteIndex;
		const appRoutes = appsList.map((app, index) => {
			const r = {
				path: `/${app.getName()}`, // e.g. /apps/48a2d322-5cfe-4323-8823-4dad4528c090
				displayName: app.getDisplayName() // e.g. controller
			};

			if (location.pathname === r.path) {
				selectedAppRouteIndex = index;
			}

			return r;
		});

		return (
			<List selectable={true} selected={selectedAppRouteIndex}>
				{appRoutes.map((r) => {
					return (
						<NavLink path={r.path} key={r.path} onNav={this.props.onNav}>
							<ListItem justify="between" separator="horizontal">
								{r.displayName}
							</ListItem>
						</NavLink>
					);
				})}
			</List>
		);
	}
}

export default withRouter(AppsListNav);
