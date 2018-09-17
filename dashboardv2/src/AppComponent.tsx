import * as React from 'react';
import Heading from 'grommet/components/Heading';
import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';

import { App, Release } from './generated/controller_pb';
import EnvEditor from './EnvEditor';

export interface Props {
	app: App;
	release: Release;
}

interface State {
	envPersisting: boolean;
}

export default class AppComponent extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			envPersisting: false
		};
		this._envPersistHandler = this._envPersistHandler.bind(this);
	}

	public render() {
		const { app, release } = this.props;
		const { envPersisting } = this.state;
		return (
			<React.Fragment>
				<Heading>{app.getDisplayName()}</Heading>
				<Accordion openMulti={true} animate={false} active={0}>
					<AccordionPanel heading="Environment">
						<EnvEditor
							entries={release.getEnvMap().getEntryList()}
							persist={this._envPersistHandler}
							persisting={envPersisting}
						/>
					</AccordionPanel>
				</Accordion>
			</React.Fragment>
		);
	}

	private _envPersistHandler(next: Array<[string, string]>) {
		console.log('TODO: update env', next);
		this.setState({
			envPersisting: true
		});
	}
}
