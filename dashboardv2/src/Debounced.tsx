import * as React from 'react';
import { debounced, DebouncedFunc } from './util';

export interface Props {
	children: React.ReactNode;
	timeoutMs?: number;
}

interface State {
	shouldRender: boolean;
}

export default class Loading extends React.Component<Props, State> {
	private _startRenderTimeout: DebouncedFunc;

	constructor(props: Props) {
		super(props);
		this.state = {
			shouldRender: false
		};
		this._startRenderTimeout = debounced(() => {
			this.setState({
				shouldRender: true
			});
		});
	}

	public componentDidMount() {
		this._startRenderTimeout();
	}

	public componentDidUpdate() {
		if (!this.state.shouldRender) {
			this._startRenderTimeout();
		}
	}

	public componentWillUnmount() {
		this._startRenderTimeout.cancel();
	}

	public render() {
		if (this.state.shouldRender) {
			return this.props.children;
		} else {
			return null;
		}
	}
}
