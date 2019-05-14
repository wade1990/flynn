import * as React from 'react';
import { debounce } from 'lodash';
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

export function KeyValueInput(props: KeyValueInputProps) {
	const onChange = React.useMemo(() => debounce(props.onChange, 300), [props.onChange]);
	const [expanded, setExpanded] = React.useState(false);
	const [value, setValue] = React.useState(props.value);
	const multiline = React.useMemo<boolean>(() => props.value.indexOf('\n') >= 0, [props.value]);
	const textarea = React.useRef(null) as string & React.RefObject<HTMLTextAreaElement>;

	// handle new props.value
	React.useEffect(
		() => {
			setValue(props.value);
		},
		[props.value] // eslint-disable-line react-hooks/exhaustive-deps
	);

	// focus textarea when expanded toggled to true
	React.useLayoutEffect(
		() => {
			if (expanded && textarea.current) {
				textarea.current.focus();
			}
		},
		[expanded] // eslint-disable-line react-hooks/exhaustive-deps
	);

	function changeHandler(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		onChange.cancel();
		const value = e.target.value || '';
		setValue(value);
		onChange(value);
	}

	function renderInput() {
		const { placeholder, hasConflict, disabled, onChange, value: _value, ...rest } = props;
		if (expanded) {
			return (
				<TextArea
					value={value}
					onChange={changeHandler}
					onBlur={() => (expanded ? setExpanded(false) : void 0)}
					resize="vertical"
					style={{ height: 500, paddingRight: hasConflict ? '2em' : undefined }}
					ref={textarea}
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
				onChange={changeHandler}
				onFocus={() => (multiline ? setExpanded(true) : void 0)}
				{...rest}
			/>
		);
	}

	const { hasConflict, newValue } = props;
	if (hasConflict) {
		return (
			<Stack fill anchor="right" guidingChild="last">
				<Box fill="vertical" justify="between" margin="xsmall">
					<WarningIcon />
				</Box>
				{renderInput()}
			</Stack>
		);
	}
	if (newValue) {
		return (
			<Box fill direction="row">
				{renderInput()}
				<Button type="button" icon={<UpdateIcon />} onClick={() => props.onChange(newValue)} />
			</Box>
		);
	}
	return renderInput();
}
