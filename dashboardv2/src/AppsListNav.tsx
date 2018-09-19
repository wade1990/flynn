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
	constructor(props: Props) {
		super(props);
		this._navHandler = this._navHandler.bind(this);
	}

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
						<NavLink path={r.path} key={r.path} onNav={this._navHandler}>
							<ListItem justify="between" separator="horizontal">
								{r.displayName}
							</ListItem>
						</NavLink>
					);
				})}
			</List>
		);
	}

	private _navHandler(path: string) {
		const { location, onNav } = this.props;
		if (location.pathname === path) {
			return;
		}
		onNav(path);
	}
}

export default withRouter(AppsListNav);
