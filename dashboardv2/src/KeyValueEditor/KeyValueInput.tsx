import * as React from 'react';
import fz from 'fz';
import { StatusWarning as WarningIcon, Update as UpdateIcon } from 'grommet-icons';
import { Stack, Box, Button, TextArea } from 'grommet';
import { TextInput } from '../GrommetTextInput';
import useDebouncedInputOnChange from '../useDebouncedInputOnChange';
import { default as useStringValidation, StringValidator } from '../useStringValidation';

export interface Selection {
	selectionStart: number;
	selectionEnd: number;
	direction: 'forward' | 'backward' | 'none';
}

export interface KeyValueInputProps {
	placeholder: string;
	value: string;
	validateValue?: StringValidator;
	newValue?: string;
	hasConflict?: boolean;
	onChange: (value: string) => void;
	onBlur?: (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	disabled?: boolean;
	suggestions?: string[];
	onSuggestionSelect?: (suggestion: string) => void;

	refHandler?: (ref: any) => void;
	onPaste?: React.ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
	onSelectionChange?: (selection: Selection) => void;
}

export function KeyValueInput(props: KeyValueInputProps) {
	const [expanded, setExpanded] = React.useState(false);
	const multiline = React.useMemo<boolean>(() => props.value.indexOf('\n') >= 0, [props.value]);
	const textarea = React.useRef(null) as string & React.RefObject<HTMLTextAreaElement>;
	const [value, changeHandler, flushValue] = useDebouncedInputOnChange(props.value, props.onChange, 300);
	const validationErrorMsg = useStringValidation(value, props.validateValue || null);

	// focus textarea when expanded toggled to true
	React.useLayoutEffect(
		() => {
			if (expanded && textarea.current) {
				if (props.refHandler) {
					props.refHandler(textarea.current);
				}
				textarea.current.focus();
			}
		},
		[expanded] // eslint-disable-line react-hooks/exhaustive-deps
	);

	const filteredSuggestions = React.useMemo(
		() => {
			if (!props.suggestions || value === '') return [];
			return props.suggestions.filter((s: string) => fz(s, value));
		},
		[value, props.suggestions]
	);

	function selectionChangeHandler(e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) {
		const { selectionStart, selectionEnd, selectionDirection: direction } = e.target as
			| HTMLInputElement
			| HTMLTextAreaElement;
		if (props.onSelectionChange) {
			props.onSelectionChange({ selectionStart, selectionEnd, direction } as Selection);
		}
	}

	function suggestionSelectionHandler({ suggestion }: { [suggestion: string]: string }) {
		if (props.onSuggestionSelect) {
			props.onSuggestionSelect(suggestion);
		}
	}

	function renderInput() {
		const {
			placeholder,
			hasConflict,
			disabled,
			onChange,
			onBlur,
			onSelectionChange,
			value: _value,
			refHandler,
			suggestions,
			onSuggestionSelect,
			...rest
		} = props;
		const inputRefProp = refHandler ? { ref: refHandler } : {};
		if (expanded) {
			return (
				<TextArea
					value={value}
					onChange={changeHandler}
					onInput={selectionChangeHandler}
					onSelect={selectionChangeHandler}
					onBlur={(e: React.SyntheticEvent<HTMLTextAreaElement>) => {
						expanded ? setExpanded(false) : void 0;
						flushValue();
						if (onBlur) {
							onBlur(e);
						}
					}}
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
				onBlur={(e: React.SyntheticEvent<HTMLInputElement>) => {
					flushValue();
					if (onBlur) {
						onBlur(e);
					}
				}}
				onInput={selectionChangeHandler}
				onSelect={selectionChangeHandler}
				suggestions={filteredSuggestions}
				onSuggestionSelect={suggestionSelectionHandler}
				onFocus={() => (multiline ? setExpanded(true) : void 0)}
				{...rest}
				{...inputRefProp}
			/>
		);
	}

	const { newValue, hasConflict } = props;
	if (newValue) {
		return (
			<Box fill direction="row">
				{renderInput()}
				<Button type="button" icon={<UpdateIcon />} onClick={() => props.onChange(newValue)} />
			</Box>
		);
	}
	if (hasConflict || validationErrorMsg !== null) {
		return (
			<Stack fill anchor="right" guidingChild="last" title={validationErrorMsg || ''}>
				<Box fill="vertical" justify="between" margin="xsmall">
					<WarningIcon />
				</Box>
				{renderInput()}
			</Stack>
		);
	}
	return renderInput();
}
