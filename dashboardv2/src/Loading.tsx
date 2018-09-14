import * as React from 'react';
import Spinning from 'grommet/components/icons/Spinning';

import Debounced from './Debounced';

export default class Loading extends React.Component {
	public render() {
		return (
			<Debounced timeoutMs={200}>
				<Spinning />
			</Debounced>
		);
	}
}
