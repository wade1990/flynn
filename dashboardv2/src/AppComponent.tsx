import * as React from 'react';
import Heading from 'grommet/components/Heading';

import { App, Release } from './generated/controller_pb';
import EnvEditor from './EnvEditor';

export interface Props {
	app: App;
	release: Release;
}

export default class AppComponent extends React.Component<Props> {
	constructor(props: Props) {
		super(props);
		this._envPersistHandler = this._envPersistHandler.bind(this);
	}

	public render() {
		const { app, release } = this.props;
		let env = {} as Map<string, string>; // TODO(jvatic): improve type assertion
		release.getEnvMap().forEach((entry: string, key: string) => {
			env[key] = entry;
		});
		return (
			<React.Fragment>
				<Heading>{app.getDisplayName()}</Heading>
				<EnvEditor entries={release.getEnvMap().getEntryList()} persist={this._envPersistHandler} />
			</React.Fragment>
		);
	}

	private _envPersistHandler(next: Array<[string, string]>) {
		console.log('TODO: update env', next);
	}
}
