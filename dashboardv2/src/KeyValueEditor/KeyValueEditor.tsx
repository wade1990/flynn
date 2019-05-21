import * as React from 'react';

import { Checkmark as CheckmarkIcon, Copy as CopyIcon, StatusWarning as WarningIcon } from 'grommet-icons';
import { Box, Button, TextInput } from 'grommet';
import Notification from '../Notification';
import copyToClipboard from '../util/copyToClipboard';
import {
	Data,
	Entry,
	setKeyAtIndex,
	setValueAtIndex,
	appendEntry,
	removeEntryAtIndex,
	getEntries,
	filterData,
	mapEntries,
	MapEntriesOption
} from './KeyValueData';
import { KeyValueInput } from './KeyValueInput';
import useDebouncedInputOnChange from '../useDebouncedInputOnChange';

type DataCallback = (data: Data) => void;

export interface Props {
	data: Data;
	onChange: DataCallback;
	onSubmit: DataCallback;
	keyPlaceholder?: string;
	valuePlaceholder?: string;
	submitLabel?: string;
	conflictsMessage?: string;
}

export default function KeyValueEditor({
	data,
	onChange,
	onSubmit,
	keyPlaceholder = 'Key',
	valuePlaceholder = 'Value',
	submitLabel = 'Review Changes',
	conflictsMessage = 'Some entries have conflicts'
}: Props) {
	const hasConflicts = React.useMemo(() => (data.conflicts || []).length > 0, [data.conflicts]);
	const [searchInputValue, searchInputHandler] = useDebouncedInputOnChange(
		'',
		(value: string) => {
			onChange(filterData(data, value));
		},
		300
	);

	function keyChangeHandler(index: number, key: string) {
		let nextData: Data;
		if (key.length > 0) {
			nextData = setKeyAtIndex(data, key, index);
		} else {
			nextData = removeEntryAtIndex(data, index);
		}
		onChange(nextData);
	}

	function valueChangeHandler(index: number, value: string) {
		onChange(setValueAtIndex(data, value, index));
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
									placeholder={keyPlaceholder}
									value={key}
									hasConflict={hasConflict}
									onChange={keyChangeHandler.bind(null, index)}
									onPaste={handlePaste}
								/>
								<KeyValueInput
									placeholder={valuePlaceholder}
									value={value}
									newValue={hasConflict ? originalValue : undefined}
									onChange={valueChangeHandler.bind(null, index)}
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
