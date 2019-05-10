import * as React from 'react';
import { debounce, Cancelable } from 'lodash';
import * as jspb from 'google-protobuf';
import styled from 'styled-components';
import fz from 'fz';

import {
	Checkmark as CheckmarkIcon,
	Copy as CopyIcon,
	StatusWarning as WarningIcon,
	Update as UpdateIcon
} from 'grommet-icons';
import { Stack, Box, Button, TextInput, TextArea } from 'grommet';
import Notification from './Notification';
import protoMapDiff, { mergeProtoMapDiff, Diff, DiffOp, DiffOption, DiffConflict } from './util/protoMapDiff';
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
	conflicts: DiffConflict<string, string>[];
	conflictKeys: Set<string>;
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
					filterText: '',
					conflicts: [],
					conflictKeys: new Set<string>([])
			  };
		this.length = entries.getLength();
		this.deletedLength = 0;
		this.hasChanges = false;
		this._setDeletedLength();
	}

	public rebase(entries: Entries): KeyValueData {
		const [diff, conflicts, conflictKeys] = mergeProtoMapDiff(
			protoMapDiff(this._state.originalEntries, entries),
			this.getDiff()
		);
		const data = new KeyValueData(
			this._entries,
			Object.assign({}, this._state, { originalEntries: entries, conflicts, conflictKeys })
		);
		data.applyDiff(diff);
		return data;
	}

	public hasConflicts(): boolean {
		return this._state.conflicts.length > 0;
	}

	public hasConflict(key: string): boolean {
		return this._state.conflictKeys.has(key);
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

	public getOriginal(key: string): string | undefined {
		return this._state.originalEntries.get(key);
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

	public getDiff(): Diff<string, string> {
		return protoMapDiff(this._state.originalEntries, this._entries);
	}

	public applyDiff(diff: Diff<string, string>) {
		diff.forEach((op: DiffOp<string, string>) => {
			let index = this._entries.toArray().findIndex(([key, value]: [string, string]) => {
				return key === op.key;
			});
			switch (op.op) {
				case 'add':
					if (index === -1) {
						index = this._entries.toArray().length;
					}
					this.setKeyAtIndex(index, op.key);
					if (op.value) {
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
		const key = (entries[index] || [])[0];
		entries[index] = [(entries[index] || [])[0] || '', val];
		this.length = entries.length;
		this._entries = new jspb.Map(entries);
		if (this.hasConflict(key) && val === this.getOriginal(key)) {
			// if value is being set to the original and there was a conflict,
			// remove the conflict (resolved)
			this._state.conflictKeys.delete(key);
			this._state.conflicts = this._state.conflicts.filter((c) => c[0].key !== key);
		}
		if (val === '' && key === '') {
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

class KeyValueInput extends React.Component<KeyValueInputProps, KeyValueInputState> {
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
