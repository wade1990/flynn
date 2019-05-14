import * as React from 'react';
import { debounce, Cancelable } from 'lodash';
import * as jspb from 'google-protobuf';
import styled from 'styled-components';

import { Checkmark as CheckmarkIcon, Copy as CopyIcon, StatusWarning as WarningIcon } from 'grommet-icons';
import { Box, Button, TextInput } from 'grommet';
import Notification from '../Notification';
import protoMapDiff, { DiffOption } from '../util/protoMapDiff';
import copyToClipboard from '../util/copyToClipboard';
import { KeyValueData } from './KeyValueData';
import { KeyValueInput } from './KeyValueInput';

type DataCallback = (data: KeyValueData) => void;

export interface Props {
	data: KeyValueData;
	onChange: DataCallback;
	onSubmit: DataCallback;
	keyPlaceholder: string;
	valuePlaceholder: string;
	submitLabel: string;
	conflictsMessage: string;
}

interface State {}

export default class KeyValueEditor extends React.Component<Props, State> {
	public static defaultProps = {
		keyPlaceholder: 'Key',
		valuePlaceholder: 'Value',
		submitLabel: 'Review Changes',
		conflictsMessage: 'Some entries have conflicts'
	};

	private _onChange: DataCallback & Cancelable;

	constructor(props: Props) {
		super(props);
		this.state = {};
		this._searchInputHandler = this._searchInputHandler.bind(this);
		this._submitHandler = this._submitHandler.bind(this);
		this._handlePaste = this._handlePaste.bind(this);
		this._handleCopyButtonClick = this._handleCopyButtonClick.bind(this);
		this._onChange = debounce(this.props.onChange, 200);
	}

	public componentWillUnmount() {
		this._onChange.cancel();
	}

	public render() {
		const { data, keyPlaceholder, valuePlaceholder, submitLabel, conflictsMessage } = this.props;
		const hasConflicts = data.hasConflicts();

		return (
			<form onSubmit={this._submitHandler}>
				<Box direction="column" gap="xsmall">
					{hasConflicts ? <Notification status="warning" message={conflictsMessage} /> : null}
					<TextInput type="search" onChange={this._searchInputHandler} />
					{data.map(([key, value]: [string, string], index: number) => {
						const hasConflict = data.hasConflict(key);
						return (
							<Box key={index} direction="row" gap="xsmall">
								<KeyValueInput
									placeholder={keyPlaceholder}
									value={key}
									hasConflict={hasConflict}
									onChange={this._keyChangeHandler.bind(this, index)}
									onPaste={this._handlePaste}
								/>
								<KeyValueInput
									placeholder={valuePlaceholder}
									value={value}
									newValue={hasConflict ? data.getOriginal(key) : undefined}
									onChange={this._valueChangeHandler.bind(this, index)}
									onPaste={this._handlePaste}
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
				<Button type="button" icon={<CopyIcon />} onClick={this._handleCopyButtonClick} />
			</form>
		);
	}

	private _keyChangeHandler(index: number, key: string) {
		let nextEntries = this.props.data.dup();
		if (key.length > 0) {
			nextEntries.setKeyAtIndex(index, key);
		} else {
			nextEntries.removeEntryAtIndex(index);
		}
		this.props.onChange(nextEntries);
	}

	private _valueChangeHandler(index: number, value: string) {
		let nextEntries = this.props.data.dup();
		nextEntries.setValueAtIndex(index, value);
		this._onChange(nextEntries);
	}

	private _handlePaste(event: React.ClipboardEvent) {
		// Detect key=value paste
		const text = event.clipboardData.getData('text/plain');
		if (text.match(/^(\S+=\S+\n?)+$/)) {
			const nextEntries = this.props.data.dup();
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
			this.props.onChange(nextEntries);
		}
	}

	private _handleCopyButtonClick(event: React.SyntheticEvent) {
		event.preventDefault();

		const text = this.props.data
			.entries()
			.toArray()
			.map(([key, val]: [string, string]) => {
				return `${key}=${val}`;
			})
			.join('\n');

		copyToClipboard(text);
	}

	private _searchInputHandler(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value || '';
		this.props.onChange(this.props.data.filtered(value));
	}

	private _submitHandler(e: React.SyntheticEvent) {
		e.preventDefault();
		this.props.onSubmit(this.props.data);
	}
}

type StringMap = jspb.Map<string, string>;

const changeOps = new Set(['add', 'remove']);
const opBackgroundColors = {
	remove: 'rgba(255, 0, 0, 0.075)',
	add: 'rgba(0, 255, 0, 0.075)'
} as { [key: string]: string };
interface DiffLineProps {
	op: string;
}
const DiffLine = styled(Box)<DiffLineProps>`
	white-space: pre-wrap;
	word-break: break-all;
	line-height: 1.2em;
	max-width: 40vw;
	font-weight: ${(props) => (changeOps.has(props.op) ? 'bold' : 'normal')};
	background-color: ${(props) => opBackgroundColors[props.op] || 'transparent'};
`;

export function renderKeyValueDiff(prev: StringMap, next: StringMap) {
	const diff = protoMapDiff(prev, next, DiffOption.INCLUDE_UNCHANGED).sort((a, b) => {
		return a.key.localeCompare(b.key);
	});

	return (
		<Box tag="pre">
			{diff.map((item) => {
				let value;
				let prefix = ' ';
				switch (item.op) {
					case 'keep':
						value = next.get(item.key);
						break;
					case 'remove':
						prefix = '-';
						value = prev.get(item.key);
						break;
					case 'add':
						prefix = '+';
						value = next.get(item.key);
						break;
					default:
						break;
				}
				return (
					<DiffLine as="span" key={item.op + item.key} op={item.op}>
						{prefix} {item.key} = {value}
					</DiffLine>
				);
			})}
		</Box>
	);
}
