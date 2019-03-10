import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';

import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import Loading from './Loading';
import NavLink from './NavLink';
import { App } from './generated/controller_pb';

export interface Props extends RouteComponentProps<{}>, ClientProps, ErrorHandlerProps {
	onNav(path: string): void;
}

interface State {
	isLoading: boolean;
	apps: App[];
}

class AppsListNav extends React.Component<Props, State> {
	private __listAppsStreamCancel: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			apps: []
		};

		this.__listAppsStreamCancel = () => {};
		this._navHandler = this._navHandler.bind(this);
	}

	public componentDidMount() {
		this._getData();
	}

	public componentWillUnmount() {
		this.__listAppsStreamCancel();
	}

	public render() {
		const { location } = this.props;
		const { isLoading, apps } = this.state;

		if (isLoading) {
			return <Loading />;
		}

		let selectedAppRouteIndex;
		const appRoutes = apps.map((app, index) => {
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

	private _getData() {
		const { client, handleError } = this.props;
		this.setState({
			isLoading: true
		});
		this.__listAppsStreamCancel();
		this.__listAppsStreamCancel = client.listAppsStream((apps: App[], error: Error | null) => {
			this.setState({
				isLoading: false,
				apps
			});
			if (error) {
				handleError(error);
			}
		});
	}

	private _navHandler(path: string) {
		const { location, onNav } = this.props;
		if (location.pathname === path) {
			return;
		}
		onNav(path);
	}
}

export default withErrorHandler(withClient(withRouter(AppsListNav)));
