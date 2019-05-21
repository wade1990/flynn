import * as React from 'react';
import { StatusWarning as WarningIcon, Update as UpdateIcon } from 'grommet-icons';
import { Stack, Box, Button, TextInput, TextArea } from 'grommet';
import useDebouncedInputOnChange from '../useDebouncedInputOnChange';

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
	const [expanded, setExpanded] = React.useState(false);
	const multiline = React.useMemo<boolean>(() => props.value.indexOf('\n') >= 0, [props.value]);
	const textarea = React.useRef(null) as string & React.RefObject<HTMLTextAreaElement>;
	const [value, changeHandler] = useDebouncedInputOnChange(props.value, props.onChange, 300);

	// focus textarea when expanded toggled to true
	React.useLayoutEffect(
		() => {
			if (expanded && textarea.current) {
				textarea.current.focus();
			}
		},
		[expanded] // eslint-disable-line react-hooks/exhaustive-deps
	);

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
