import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Box } from 'grommet';

import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import Loading from './Loading';
import NavLink from './NavLink';
import { App } from './generated/controller_pb';
import { parseURLParams, urlParamsToString } from './util/urlParams';

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

		// some query params are persistent, make sure they're passed along if present
		const params = parseURLParams(location.search, 'rhf', 's');
		const search = urlParamsToString(params);

		const appRoutes = apps.map((app, index) => {
			const path = `/${app.getName()}`; // e.g. /apps/48a2d322-5cfe-4323-8823-4dad4528c090
			return {
				path,
				search,
				displayName: app.getDisplayName(), // e.g. controller
				selected: location.pathname === path
			};
		});

		return (
			<Box tag="ul" margin="none" pad="none" flex={true} overflow="auto">
				{appRoutes.map((r) => {
					return (
						<NavLink path={r.path} search={search} key={r.path} onNav={this._navHandler}>
							<Box
								tag="li"
								direction="row"
								justify="between"
								align="center"
								border="bottom"
								pad={{ horizontal: 'medium', vertical: 'small' }}
								basis="auto"
								flex={false}
								background={r.selected ? 'accent-1' : 'neutral-1'}
							>
								{r.displayName}
							</Box>
						</NavLink>
					);
				})}
			</Box>
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
