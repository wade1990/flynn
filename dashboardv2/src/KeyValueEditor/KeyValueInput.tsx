import * as React from 'react';
import { debounce, Cancelable } from 'lodash';
import { StatusWarning as WarningIcon, Update as UpdateIcon } from 'grommet-icons';
import { Stack, Box, Button, TextInput, TextArea } from 'grommet';

export interface KeyValueInputProps {
	placeholder: string;
	value: string;
	newValue?: string;
	hasConflict?: boolean;
	onChange: (value: string) => void;
	disabled?: boolean;

	onPaste?: React.ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

interface KeyValueInputState {
	value: string;
	expanded: boolean;
	multiline: boolean;
}

export class KeyValueInput extends React.Component<KeyValueInputProps, KeyValueInputState> {
	private _textarea: React.RefObject<any>;
	private _onChange: ((value: string) => void) & Cancelable;

	constructor(props: KeyValueInputProps) {
		super(props);
		this.state = {
			value: props.value,
			expanded: false,
			multiline: props.value.indexOf('\n') >= 0
		};
		this._inputFocusHandler = this._inputFocusHandler.bind(this);
		this._textareaBlurHandler = this._textareaBlurHandler.bind(this);
		this._changeHandler = this._changeHandler.bind(this);
		this._textarea = React.createRef();
		this._onChange = debounce((value) => {
			this.props.onChange(value);
		}, 300);
	}

	public componentDidUpdate(prevProps: KeyValueInputProps, prevState: KeyValueInputState) {
		if (!prevState.expanded && this.state.expanded && this._textarea.current) {
			(this._textarea.current as HTMLTextAreaElement).focus();
		}
		if (this.props.value !== prevProps.value) {
			this.setState({ value: this.props.value });
		}
	}

	public componentWillUnmount() {
		this._onChange.cancel();
	}

	public render() {
		const { hasConflict, newValue } = this.props;
		if (hasConflict) {
			return (
				<Stack fill anchor="right" guidingChild="last">
					<Box fill="vertical" justify="between" margin="xsmall">
						<WarningIcon />
					</Box>
					{this._renderInput()}
				</Stack>
			);
		}
		if (newValue) {
			return (
				<Box fill direction="row">
					{this._renderInput()}
					<Button type="button" icon={<UpdateIcon />} onClick={() => this.props.onChange(newValue)} />
				</Box>
			);
		}
		return this._renderInput();
	}

	private _renderInput() {
		const { value } = this.state;
		const { placeholder, hasConflict, disabled, onChange, value: _value, ...rest } = this.props;
		const { expanded } = this.state;
		if (expanded) {
			return (
				<TextArea
					value={value}
					onChange={this._changeHandler}
					onBlur={this._textareaBlurHandler}
					resize="vertical"
					style={{ height: 500, paddingRight: hasConflict ? '2em' : undefined }}
					ref={this._textarea}
					{...rest}
				/>
			);
		}
		return (
			<TextInput
				type="text"
				style={hasConflict ? { paddingRight: '2em' } : undefined}
				disabled={disabled}
				placeholder={placeholder}
				value={value}
				onChange={this._changeHandler}
				onFocus={this._inputFocusHandler}
				{...rest}
			/>
		);
	}

	private _changeHandler(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		this._onChange.cancel();
		const value = e.target.value || '';
		this.setState({ value });
		this._onChange(value);
	}

	private _inputFocusHandler() {
		if (this.state.multiline) {
			this.setState({
				expanded: true
			});
		}
	}

	private _textareaBlurHandler() {
		if (this.state.expanded) {
			this.setState({
				expanded: false
			});
		}
	}
}
