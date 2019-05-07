import * as React from 'react';
import * as jspb from 'google-protobuf';
import styled from 'styled-components';
import fz from 'fz';

import { Checkmark as CheckmarkIcon, Copy as CopyIcon } from 'grommet-icons';
import { Box, Button, TextInput, TextArea } from 'grommet';
import protoMapDiff, { Diff, DiffOp, DiffOption } from './util/protoMapDiff';
import copyToClipboard from './util/copyToClipboard';

export type Entries = jspb.Map<string, string>;

function entriesEqual(a: [string, string], b: [string, string]): boolean {
	return a && b && a[0] === b[0] && a[1] === b[1];
}

interface KeyValueDataInternalState {
	originalEntries: Entries;
	uniqueKeyMap: { [key: string]: number };
	filterText: string;
	deletedIndices: { [key: number]: boolean };
	changedIndices: { [key: number]: boolean };
}

export class KeyValueData {
	public length: number;
	public deletedLength: number;
	public hasChanges: boolean;
	private _entries: Entries;
	private _state: KeyValueDataInternalState;
	constructor(entries: Entries, state: KeyValueDataInternalState | null = null) {
		this._entries = entries;
		this._state = state
			? state
			: {
					originalEntries: entries,
					changedIndices: {},
					deletedIndices: {},
					uniqueKeyMap: entries
						.toArray()
						.reduce((m: { [key: string]: number }, [key, value]: [string, string], index: number) => {
							m[key] = index;
							return m;
						}, {}),
					filterText: ''
			  };
		this.length = entries.getLength();
		this.deletedLength = 0;
		this.hasChanges = false;
		this._setDeletedLength();
	}

	public dup(): KeyValueData {
		return new KeyValueData(this._entries, Object.assign({}, this._state));
	}

	public filtered(filterText: string): KeyValueData {
		return new KeyValueData(this._entries, Object.assign({}, this._state, { filterText }));
	}

	public get(key: string): string | undefined {
		return this._entries.get(key);
	}

	public entries(): Entries {
		return new jspb.Map(
			this._entries.toArray().filter(
				(entry: [string, string], index: number): boolean => {
					return this._state.deletedIndices[index] !== true && entry[0] !== '' && entry[1] !== '';
				}
			)
		);
	}

	public map<T>(fn: (entry: [string, string], index: number) => T): T[] {
		const filterText = this._state.filterText;
		return (
			this._entries
				.toArray()
				.reduce<T[]>(
					(prev: T[], entry: [string, string], index: number): T[] => {
						if (this._state.deletedIndices[index] === true) {
							return prev;
						}
						if (filterText && !fz(entry[0], filterText)) {
							return prev;
						}
						return prev.concat(fn(entry, index));
					},
					[] as Array<T>
				)
				// there's always an empty entry at the end for adding new env
				.concat(fn(['', ''], this.length))
		);
	}

	public mapDeleted<T>(fn: (entry: [string, string], index: number) => T): T[] {
		return this._entries.toArray().reduce<T[]>(
			(prev: T[], entry: [string, string], index: number): T[] => {
				if (this._state.deletedIndices[index] !== true) {
					return prev;
				}
				return prev.concat(fn(entry, index));
			},
			[] as Array<T>
		);
	}

	public applyDiff(diff: Diff<string, string>) {
		diff.forEach((op: DiffOp<string, string>) => {
			let index = this._entries.toArray().findIndex(([key, value]: [string, string]) => {
				return key === op.key;
			});
			switch (op.op) {
				case 'add':
					if (op.value) {
						if (index === -1) {
							index = this._entries.toArray().length;
						}
						this.setKeyAtIndex(index, op.key);
						this.setValueAtIndex(index, op.value);
					}
					break;
				case 'remove':
					if (index !== -1) {
						this.removeEntryAtIndex(index);
					}
					break;
				default:
					break;
			}
		});
	}

	public setKeyAtIndex(index: number, key: string) {
		delete this._state.deletedIndices[index]; // allow restoring an item
		this._setDeletedLength();
		const entries = this._entries.toArray().slice(); // don't modify old map
		entries[index] = [key, (entries[index] || [])[1] || ''];
		this.length = entries.length;
		this._entries = new jspb.Map(entries);
		this._trackChanges(index);
		if (this._state.uniqueKeyMap[key] > -1 && this._state.uniqueKeyMap[key] !== index && index < entries.length) {
			// duplicate key, remove old one
			this.removeEntryAtIndex(this._state.uniqueKeyMap[key]);
			this._state.uniqueKeyMap[key] = index;
		}
	}

	public setValueAtIndex(index: number, val: string) {
		const entries = this._entries.toArray().slice(); // don't modify old map
		entries[index] = [(entries[index] || [])[0] || '', val];
		this.length = entries.length;
		this._entries = new jspb.Map(entries);
		if (val === '' && (entries[index] || [])[0] === '') {
			// if there's no key or value, remove it
			this.removeEntryAtIndex(index);
		} else {
			this._trackChanges(index);
		}
	}

	public removeEntryAtIndex(index: number) {
		this._state.deletedIndices[index] = true;
		this._setDeletedLength();
		this._trackChanges(index);
	}

	private _trackChanges(index: number) {
		const { deletedIndices, changedIndices, originalEntries } = this._state;
		if (deletedIndices[index] === true) {
			if (index < originalEntries.getLength()) {
				changedIndices[index] = true;
			} else {
				delete changedIndices[index];
			}
		} else if (entriesEqual(originalEntries.toArray()[index], this._entries.toArray()[index])) {
			delete changedIndices[index];
		} else {
			changedIndices[index] = true;
		}
		this.hasChanges = Object.keys(changedIndices).length > 0;
	}

	private _setDeletedLength() {
		this.deletedLength = Object.keys(this._state.deletedIndices).length;
	}
}

interface KeyValueInputProps {
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;

	onPaste?: React.ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

interface KeyValueInputState {
	expanded: boolean;
	multiline: boolean;
}

class KeyValueInput extends React.Component<KeyValueInputProps, KeyValueInputState> {
	private _textarea: React.RefObject<any>;

	constructor(props: KeyValueInputProps) {
		super(props);
		this.state = {
			expanded: false,
			multiline: props.value.indexOf('\n') >= 0
		};
		this._inputChangeHandler = this._inputChangeHandler.bind(this);
		this._inputFocusHandler = this._inputFocusHandler.bind(this);
		this._textareaBlurHandler = this._textareaBlurHandler.bind(this);
		this._textareaChangeHandler = this._textareaChangeHandler.bind(this);
		this._textarea = React.createRef();
	}

	public componentDidUpdate(prevProps: KeyValueInputProps, prevState: KeyValueInputState) {
		if (!prevState.expanded && this.state.expanded && this._textarea.current) {
			(this._textarea.current as HTMLTextAreaElement).focus();
		}
	}

	public render() {
		const { placeholder, value, disabled, onChange, ...rest } = this.props;
		const { expanded } = this.state;
		if (expanded) {
			return (
				<TextArea
					value={value}
					onChange={this._textareaChangeHandler}
					onBlur={this._textareaBlurHandler}
					resize="vertical"
					style={{ height: 500 }}
					ref={this._textarea}
					{...rest}
				/>
			);
		}
		return (
			<TextInput
				type="text"
				disabled={disabled}
				placeholder={placeholder}
				value={value}
				onChange={this._inputChangeHandler}
				onFocus={this._inputFocusHandler}
				{...rest}
			/>
		);
	}

	private _inputChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value || '';
		this.props.onChange(value);
	}

	private _textareaChangeHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
		const value = e.target.value || '';
		this.props.onChange(value);
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

export interface Props {
	data: KeyValueData;
	onChange: (data: KeyValueData) => void;
	onSubmit: (data: KeyValueData) => void;
	keyPlaceholder: string;
	valuePlaceholder: string;
	submitLabel: string;
}

interface State {}

export default class KeyValueEditor extends React.Component<Props, State> {
	public static defaultProps = {
		keyPlaceholder: 'Key',
		valuePlaceholder: 'Value',
		submitLabel: 'Review Changes'
	};

	constructor(props: Props) {
		super(props);
		this.state = {};
		this._searchInputHandler = this._searchInputHandler.bind(this);
		this._submitHandler = this._submitHandler.bind(this);
		this._handlePaste = this._handlePaste.bind(this);
		this._handleCopyButtonClick = this._handleCopyButtonClick.bind(this);
	}

	public render() {
		const { data, keyPlaceholder, valuePlaceholder, submitLabel } = this.props;

		return (
			<form onSubmit={this._submitHandler}>
				<Box direction="column" gap="xsmall">
					<TextInput type="search" onChange={this._searchInputHandler} />
					{data.map(([key, value]: [string, string], index: number) => {
						return (
							<Box key={index} direction="row" gap="xsmall">
								<KeyValueInput
									placeholder={keyPlaceholder}
									value={key}
									onChange={this._keyChangeHandler.bind(this, index)}
									onPaste={this._handlePaste}
								/>
								<KeyValueInput
									placeholder={valuePlaceholder}
									value={value}
									onChange={this._valueChangeHandler.bind(this, index)}
									onPaste={this._handlePaste}
								/>
							</Box>
						);
					})}
				</Box>
				<Button disabled={!data.hasChanges} type="submit" primary icon={<CheckmarkIcon />} label={submitLabel} />
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
		this.props.onChange(nextEntries);
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
