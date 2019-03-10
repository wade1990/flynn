import * as React from 'react';
import Heading from 'grommet/components/Heading';
import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';

import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import { App } from './generated/controller_pb';
import Loading from './Loading';
import ReleaseHistory from './ReleaseHistory';
const EnvEditor = React.lazy(() => import('./EnvEditor'));

export interface Props extends ClientProps, ErrorHandlerProps {
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

		if (!app) {
			return <Loading />;
		}

		return (
			<React.Fragment>
				<Heading>{app.getDisplayName()}</Heading>
				<Accordion openMulti={true} animate={false} active={0}>
					<AccordionPanel heading="Release History">
						<ReleaseHistory appName={app.getName()} currentReleaseName={app.getRelease()} />
					</AccordionPanel>

					<AccordionPanel heading="Environment">
						<React.Suspense fallback={<Loading />}>
							<EnvEditor key={app.getRelease()} appName={app.getName()} />
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
}
export default withErrorHandler(withClient(AppComponent));
