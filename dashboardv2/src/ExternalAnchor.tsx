import * as React from 'react';

import { Anchor, AnchorProps } from 'grommet';
import { Omit } from 'grommet/utils';

export interface Props extends Omit<AnchorProps, 'onClick'> {
	onClick?: (event: React.MouseEvent) => void;
}

class ExternalAnchor extends React.Component<Props> {
	constructor(props: Props) {
		super(props);
		this._clickHandler = this._clickHandler.bind(this);
	}

	public render() {
		return <Anchor {...this.props} onClick={this._clickHandler} />;
	}

	private _clickHandler(e: React.MouseEvent) {
		const defaultOnClick = this.props.onClick || (() => {});

		defaultOnClick(e);

		if (e.isPropagationStopped()) {
			return;
		}

		// don't open in new window if any modifier keys are pressed
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
			return;
		}

		e.preventDefault();
		window.open(this.props.href);
	}
}

export default ExternalAnchor;
