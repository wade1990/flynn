import * as React from 'react';
import { App } from './generated/controller_pb';

export interface Props {
	app: App;
}

export default class AppComponent extends React.Component<Props> {
	public render() {
		const { app } = this.props;
		return <div>{app.getDisplayName()}</div>;
	}
}
