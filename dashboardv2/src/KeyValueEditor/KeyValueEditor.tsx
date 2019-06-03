import * as React from 'react';

import { Checkmark as CheckmarkIcon, Copy as CopyIcon, StatusWarning as WarningIcon } from 'grommet-icons';
import { Box, Button, TextInput } from 'grommet';
import Notification from '../Notification';
import copyToClipboard from '../util/copyToClipboard';
import {
	Data,
	Entry,
	hasKey as hasDataKey,
	hasIndex as hasDataIndex,
	nextIndex as nextDataIndex,
	setKeyAtIndex,
	setValueAtIndex,
	appendEntry,
	getEntries,
	filterData,
	mapEntries,
	MapEntriesOption
} from './KeyValueData';
import { KeyValueInput, Selection as InputSelection } from './KeyValueInput';
import useDebouncedInputOnChange from '../useDebouncedInputOnChange';
import { StringValidator } from '../useStringValidation';

type DataCallback = (data: Data) => void;

export interface SuggestionValueTemplate extends InputSelection {
	value: string;
}

export interface Suggestion {
	key: string;
	validateValue: StringValidator;
	valueTemplate: SuggestionValueTemplate;
}

export interface Props {
	data: Data;
	onChange: DataCallback;
	onSubmit: DataCallback;
	keyPlaceholder?: string;
	valuePlaceholder?: string;
	submitLabel?: string;
	conflictsMessage?: string;
	suggestions?: Suggestion[];
}

interface Selection extends InputSelection {
	entryIndex: number;
	entryInnerIndex: 0 | 1; // key | val
}

export default function KeyValueEditor({
	data,
	onChange,
	onSubmit,
	keyPlaceholder = 'Key',
	valuePlaceholder = 'Value',
	submitLabel = 'Review Changes',
	conflictsMessage = 'Some entries have conflicts',
	suggestions = []
}: Props) {
	const hasConflicts = React.useMemo(() => (data.conflicts || []).length > 0, [data.conflicts]);
	const [searchInputValue, searchInputHandler] = useDebouncedInputOnChange(
		'',
		(value: string) => {
			onChange(filterData(data, value));
		},
		300
	);

	const [selectedSuggestion, setSelectedSuggestion] = React.useState<Suggestion | null>(null);
	const keyInputSuggestions = React.useMemo(
		() => {
			return suggestions.reduce(
				(m: string[], s: Suggestion) => {
					if (hasDataKey(data, s.key)) return m;
					return m.concat(s.key);
				},
				[] as string[]
			);
		},
		[suggestions, data]
	);

	const inputs = React.useMemo(
		() => {
			return {
				currentSelection: null as Selection | null,
				refs: [] as [HTMLInputElement | HTMLTextAreaElement | null, HTMLInputElement | HTMLTextAreaElement | null][]
			};
		},
		[] // eslint-disable-line react-hooks/exhaustive-deps
	);
	inputs.refs = [];
	const setCurrentSelection = (s: Selection | null) => {
		inputs.currentSelection = s;
	};

	// focus next entry's input when entry deleted
	React.useLayoutEffect(
		() => {
			if (!inputs.currentSelection) return;
			const { entryIndex, entryInnerIndex } = inputs.currentSelection;
			if (!hasDataIndex(data, entryIndex)) {
				// focus next input down when entry removed
				const nextIndex = nextDataIndex(data, entryIndex);
				const ref = (inputs.refs[nextIndex] || [])[entryInnerIndex];
				if (ref) {
					const length = ref.value.length;
					const selectionStart = length;
					const selectionEnd = length;
					const selectionDirection = 'forward';
					ref.focus();
					ref.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
				}
			} else {
				// maintain current focus/selection
				// ref.value isn't set yet if we don't use setTimeout [TODO(jvatic): figure out why]
				setTimeout(() => {
					const ref = (inputs.refs[entryIndex] || [])[entryInnerIndex];
					if (ref && inputs.currentSelection) {
						const { selectionStart, selectionEnd, direction } = inputs.currentSelection;
						ref.focus();
						ref.setSelectionRange(selectionStart, selectionEnd, direction);
					}
				}, 10);
			}
		},
		[data] // eslint-disable-line react-hooks/exhaustive-deps
	);

	function keyChangeHandler(entryIndex: number, key: string) {
		let nextData: Data;
		nextData = setKeyAtIndex(data, key, entryIndex);
		const s = suggestions.find((s) => s.key === key);
		if (s) {
			nextData = setValueAtIndex(nextData, s.valueTemplate.value, entryIndex);
			const { selectionStart, selectionEnd, direction } = s.valueTemplate;
			const valueInput = (inputs.refs[entryIndex] || [])[1];
			if (valueInput) {
				valueInput.value = s.valueTemplate.value;
				setCurrentSelection({
					entryIndex,
					entryInnerIndex: 1,
					selectionStart,
					selectionEnd,
					direction
				});
			}
			setSelectedSuggestion(s);
		}
		onChange(nextData);
	}

	function valueChangeHandler(index: number, value: string) {
		onChange(setValueAtIndex(data, value, index));
	}

	function inputBlurHandler(entryIndex: number, entryInnerIndex: number, e: React.SyntheticEvent) {
		if (
			inputs.currentSelection &&
			inputs.currentSelection.entryIndex === entryIndex &&
			inputs.currentSelection.entryInnerIndex === entryInnerIndex
		) {
			setCurrentSelection(null);
		}
	}

	function selectionChangeHandler(entryIndex: number, entryInnerIndex: 0 | 1, selection: InputSelection) {
		setCurrentSelection({
			entryIndex,
			entryInnerIndex,
			...selection
		});
	}

	function inputRefHandler(entryIndex: number, entryInnerIndex: 0 | 1, ref: any) {
		let entryRefs = inputs.refs[entryIndex] || [null, null];
		if (entryInnerIndex === 0) {
			entryRefs = [ref as HTMLInputElement | HTMLTextAreaElement | null, entryRefs[1]];
		} else {
			entryRefs = [entryRefs[0], ref as HTMLInputElement | HTMLTextAreaElement | null];
		}
		inputs.refs[entryIndex] = entryRefs;
	}

	function handlePaste(event: React.ClipboardEvent) {
		// Detect key=value paste
		const text = event.clipboardData.getData('text/plain');
		if (text.match(/^(\S+=\S+\n?)+$/)) {
			let nextData = data;
			event.preventDefault();
			text
				.trim()
				.split('\n')
				.forEach((line) => {
					const [key, val] = line.split('=');
					nextData = appendEntry(nextData, key, val);
				});
			onChange(nextData);
		}
	}

	function handleCopyButtonClick(event: React.SyntheticEvent) {
		event.preventDefault();

		const text = getEntries(data)
			.map(([key, val]: [string, string]) => {
				return `${key}=${val}`;
			})
			.join('\n');

		copyToClipboard(text);
	}

	return (
		<form
			onSubmit={(e: React.SyntheticEvent) => {
				e.preventDefault();
				onSubmit(data);
			}}
		>
			<Box direction="column" gap="xsmall">
				{hasConflicts ? <Notification status="warning" message={conflictsMessage} /> : null}
				<TextInput type="search" value={searchInputValue} onChange={searchInputHandler} />
				{mapEntries(
					data,
					([key, value, { rebaseConflict, originalValue }]: Entry, index: number) => {
						const hasConflict = rebaseConflict !== undefined;
						return (
							<Box key={index} direction="row" gap="xsmall">
								<KeyValueInput
									refHandler={inputRefHandler.bind(null, index, 0)}
									placeholder={keyPlaceholder}
									value={key}
									hasConflict={hasConflict}
									onChange={keyChangeHandler.bind(null, index)}
									onBlur={inputBlurHandler.bind(null, index, 0)}
									onSelectionChange={selectionChangeHandler.bind(null, index, 0)}
									suggestions={keyInputSuggestions}
									onSuggestionSelect={keyChangeHandler.bind(null, index)}
									onPaste={handlePaste}
								/>
								<KeyValueInput
									refHandler={inputRefHandler.bind(null, index, 1)}
									placeholder={valuePlaceholder}
									value={value}
									validateValue={selectedSuggestion ? selectedSuggestion.validateValue : undefined}
									newValue={hasConflict ? originalValue : undefined}
									onChange={valueChangeHandler.bind(null, index)}
									onBlur={inputBlurHandler.bind(null, index, 1)}
									onSelectionChange={selectionChangeHandler.bind(null, index, 1)}
									onPaste={handlePaste}
								/>
							</Box>
						);
					},
					MapEntriesOption.APPEND_EMPTY_ENTRY
				)}
			</Box>
			<Button
				disabled={!data.hasChanges}
				type="submit"
				primary
				icon={hasConflicts ? <WarningIcon /> : <CheckmarkIcon />}
				label={submitLabel}
			/>
			&nbsp;
			<Button type="button" icon={<CopyIcon />} onClick={handleCopyButtonClick} />
		</form>
	);
}
