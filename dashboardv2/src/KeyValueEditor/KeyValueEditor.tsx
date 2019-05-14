import * as React from 'react';

import { Checkmark as CheckmarkIcon, Copy as CopyIcon, StatusWarning as WarningIcon } from 'grommet-icons';
import { Box, Button, TextInput } from 'grommet';
import Notification from '../Notification';
import copyToClipboard from '../util/copyToClipboard';
import { KeyValueData } from './KeyValueData';
import { KeyValueInput } from './KeyValueInput';

type DataCallback = (data: KeyValueData) => void;

export interface Props {
	data: KeyValueData;
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
	const hasConflicts = React.useMemo(() => data.hasConflicts(), [data]);

	function keyChangeHandler(index: number, key: string) {
		let nextEntries = data.dup();
		if (key.length > 0) {
			nextEntries.setKeyAtIndex(index, key);
		} else {
			nextEntries.removeEntryAtIndex(index);
		}
		onChange(nextEntries);
	}

	function valueChangeHandler(index: number, value: string) {
		let nextEntries = data.dup();
		nextEntries.setValueAtIndex(index, value);
		onChange(nextEntries);
	}

	function handlePaste(event: React.ClipboardEvent) {
		// Detect key=value paste
		const text = event.clipboardData.getData('text/plain');
		if (text.match(/^(\S+=\S+\n?)+$/)) {
			const nextEntries = data.dup();
			event.preventDefault();
			text
				.trim()
				.split('\n')
				.forEach((line) => {
					const [key, val] = line.split('=');
					const index = nextEntries.length;
					nextEntries.setKeyAtIndex(index, key);
					nextEntries.setValueAtIndex(index, val);
				});
			onChange(nextEntries);
		}
	}

	function handleCopyButtonClick(event: React.SyntheticEvent) {
		event.preventDefault();

		const text = data
			.entries()
			.toArray()
			.map(([key, val]: [string, string]) => {
				return `${key}=${val}`;
			})
			.join('\n');

		copyToClipboard(text);
	}

	function searchInputHandler(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value || '';
		onChange(data.filtered(value));
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
				<TextInput type="search" onChange={searchInputHandler} />
				{data.map(([key, value]: [string, string], index: number) => {
					const hasConflict = data.hasConflict(key);
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
								newValue={hasConflict ? data.getOriginal(key) : undefined}
								onChange={valueChangeHandler.bind(null, index)}
								onPaste={handlePaste}
							/>
						</Box>
					);
				})}
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
