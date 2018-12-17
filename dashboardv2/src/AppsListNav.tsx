import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import Notification from 'grommet/components/Notification';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';

import dataStore, { Resource, WatchFunc } from './dataStore';
import withClient, { ClientProps } from './withClient';
import Loading from './Loading';
import NavLink from './NavLink';
import { App } from './generated/controller_pb';

export interface Props extends RouteComponentProps<{}>, ClientProps {
	onNav(path: string): void;
}

interface State {
	isLoading: boolean;
	errors: Error[];
	apps: App[];
}

class AppsListNav extends React.Component<Props, State> {
	private __dataWatcher: WatchFunc | null;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			errors: [],
			apps: []
		};

		this.__dataWatcher = null;
		this._navHandler = this._navHandler.bind(this);
		this._handleDataChange = this._handleDataChange.bind(this);
	}

	public componentDidMount() {
		// fetch app and release
		this._getData();
	}

	public componentWillUnmount() {
		if (this.__dataWatcher) {
			this.__dataWatcher.unsubscribe();
		}
	}

	public render() {
		const { location } = this.props;
		const { isLoading, errors, apps } = this.state;

		if (isLoading) {
			return <Loading />;
		}

		if (errors.length > 0) {
			return this._renderErrors(errors);
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

	private _renderErrors(errors: Error[]) {
		return (
			<React.Fragment>
				{errors.map((error) => {
					<Notification status="warning" message={error.message} />;
				})}
			</React.Fragment>
		);
	}

	private _getData() {
		const { client } = this.props;
		this.setState({
			isLoading: true,
			errors: []
		});
		client
			.listApps()
			.then((apps) => {
				this.__dataWatcher = dataStore.add(...apps).arrayWatcher(this._handleDataChange);
				this.setState({
					isLoading: false,
					errors: [],
					apps
				});
			})
			.catch((error: Error) => {
				this.setState({
					isLoading: false,
					errors: [error]
				});
			});
	}

	private _handleDataChange(list: Resource[], name: string, resource: Resource | undefined) {
		// TODO(jvatic): refresh data from cache
	}

	private _navHandler(path: string) {
		const { location, onNav } = this.props;
		if (location.pathname === path) {
			return;
		}
		onNav(path);
	}
}

export default withClient(withRouter(AppsListNav));
