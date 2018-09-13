import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import GrommetApp from 'grommet/components/App';

import Dashboard from './Dashboard';

export interface Props {}

export default class App extends React.Component<Props> {
	public render() {
		return (
			<GrommetApp centered={false}>
				<Router>
					<Dashboard />
				</Router>
			</GrommetApp>
		);
	}
}
