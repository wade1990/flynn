import * as React from 'react';
import { debounce } from 'lodash';

import { LinkUpIcon, LinkDownIcon, Button } from 'grommet';
import './IntegerPicker.scss';

interface Props {
	value: number;
	label: string;
	onChange: (value: number) => void;
}

interface State {
	value: number;
}

export default class IntegerPicker extends React.Component<Props, State> {
	private __onChange: (value: number) => void;
	constructor(props: Props) {
		super(props);
		this.state = {
			value: props.value
		};
		this.__onChange = debounce(props.onChange, 0);
		this.__handleIncrement = this.__handleIncrement.bind(this);
		this.__handleDecrement = this.__handleDecrement.bind(this);
	}

	public componentDidUpdate(prevProps: Props, prevState: State) {
		const { value } = this.props;
		const { value: stateValue } = this.state;
		if (prevProps.value !== value && value !== stateValue) {
			this.setState({
				value
			});
		}
	}

	public render() {
		const { value, label } = this.props;
		return (
			<div className="integer-picker">
				<div className="grommetux-value grommetux-value--large grommetux-value--align-center">
					<div className="grommetux-value__annotated">
						<div>
							<div className="grommetux-value__value">{value}</div>
							<div className="actions">
								<Button icon={<LinkUpIcon />} onClick={this.__handleIncrement} />
								<Button icon={<LinkDownIcon />} onClick={this.__handleDecrement} />
							</div>
						</div>
					</div>
					<span className="grommetux-value__label">{label}</span>
				</div>
			</div>
		);
	}

	__handleIncrement() {
		const value = this.state.value + 1;
		this.setState({
			value
		});
		this.__onChange(value);
	}

	__handleDecrement() {
		const value = Math.max(this.state.value - 1, 0);
		this.setState({
			value
		});
		this.__onChange(value);
	}
}
