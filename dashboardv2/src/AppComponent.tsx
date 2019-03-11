import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Heading from 'grommet/components/Heading';
import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';

import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import { App } from './generated/controller_pb';
import Loading from './Loading';
const FormationEditor = React.lazy(() => import('./FormationEditor'));
const ReleaseHistory = React.lazy(() => import('./ReleaseHistory'));
const EnvEditor = React.lazy(() => import('./EnvEditor'));
import { parseURLParams, urlParamsToString } from './util/urlParams';

export interface Props extends ClientProps, ErrorHandlerProps, RouteComponentProps {
	name: string;
}

interface State {
	app: App | null;
}

class AppComponent extends React.Component<Props, State> {
	private __streamAppCancel: () => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			app: null
		};
		this.__streamAppCancel = () => {};
		this._handleSectionChange = this._handleSectionChange.bind(this);
	}

	public componentDidMount() {
		// fetch app and release
		this._getData();
	}

	public componentWillUnmount() {
		this.__streamAppCancel();
	}

	public render() {
		const { app } = this.state;
		const { location } = this.props;
		const urlParams = parseURLParams(location.search);
		const activeIndices = (urlParams['s'] || ([] as string[])).map((i: string) => parseInt(i, 10));

		if (!app) {
			return <Loading />;
		}

		return (
			<React.Fragment>
				<Heading>{app.getDisplayName()}</Heading>
				<Accordion openMulti={true} animate={false} onActive={this._handleSectionChange} active={activeIndices}>
					<AccordionPanel heading="Scale">
						<React.Suspense fallback={<Loading />}>
							<FormationEditor appName={app.getName()} />
						</React.Suspense>
					</AccordionPanel>

					<AccordionPanel heading="Release History">
						<React.Suspense fallback={<Loading />}>
							<ReleaseHistory appName={app.getName()} currentReleaseName={app.getRelease()} />
						</React.Suspense>
					</AccordionPanel>

					<AccordionPanel heading="Environment">
						<React.Suspense fallback={<Loading />}>
							<EnvEditor appName={app.getName()} />
						</React.Suspense>
					</AccordionPanel>
				</Accordion>
			</React.Fragment>
		);
	}

	private _getData() {
		const appName = this.props.name;
		const { client, handleError } = this.props;
		this.__streamAppCancel();
		this.__streamAppCancel = client.streamApp(appName, (app: App, error: Error | null) => {
			if (error !== null) {
				return handleError(error);
			}
			this.setState({
				app
			});
		});
	}

	private _handleSectionChange(activeIndices: number[]) {
		const { history, location } = this.props;
		const urlParams = parseURLParams(location.search);
		history.replace(
			location.pathname +
				urlParamsToString(
					Object.assign({}, urlParams, {
						s: activeIndices.map((i: number) => String(i))
					})
				)
		);
	}
}
export default withRouter(withErrorHandler(withClient(AppComponent)));
