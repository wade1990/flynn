import * as React from 'react';
import fz from 'fz';

import Button from 'grommet/components/Button';
import { CheckmarkIcon, SearchInput } from 'grommet';

import './EnvEditor.scss';

export type Entries = Array<[string, string]>;

function entriesEqual(a: [string, string], b: [string, string]): boolean {
	return a && b && a[0] === b[0] && a[1] === b[1];
}

export interface Props {
	entries: Entries;
	persist: (next: Entries) => void;
	persisting: boolean;
}

interface State {
	entries: EnvState;
}

interface EnvStateInternalState {
	originalEntries: Entries;
	uniqueKeyMap: { [key: string]: number };
	filterText: string;
	deletedIndices: { [key: number]: boolean };
	changedIndices: { [key: number]: boolean };
}

class EnvState {
	public deletedLength: number;
	public hasChanges: boolean;
	private _entries: Entries;
	private _state: EnvStateInternalState;
	constructor(entries: Entries, state: EnvStateInternalState | null = null) {
		this._entries = entries;
		this._state = state
			? state
			: {
					originalEntries: entries,
					changedIndices: {},
					deletedIndices: {},
					uniqueKeyMap: entries.reduce(
						(m: { [key: string]: number }, [key, value]: [string, string], index: number) => {
							m[key] = index;
							return m;
						},
						{}
					),
					filterText: ''
			  };
		this._setDeletedLength();
	}

	public dup(): EnvState {
		return new EnvState(this._entries, Object.assign({}, this._state));
	}

	public filtered(filterText: string): EnvState {
		return new EnvState(this._entries, Object.assign({}, this._state, { filterText }));
	}

	public entries(): Entries {
		return this._entries.filter(
			(entry: [string, string], index: number): boolean => {
				return this._state.deletedIndices[index] !== true;
			}
		);
	}

	public map<T>(fn: (entry: [string, string], index: number) => T): T[] {
		const filterText = this._state.filterText;
		return (
			this._entries
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
				.concat(fn(['', ''], this._entries.length))
		);
	}

	public mapDeleted<T>(fn: (entry: [string, string], index: number) => T): T[] {
		return this._entries.reduce<T[]>(
			(prev: T[], entry: [string, string], index: number): T[] => {
				if (this._state.deletedIndices[index] !== true) {
					return prev;
				}
				return prev.concat(fn(entry, index));
			},
			[] as Array<T>
		);
	}

	public setKeyAtIndex(index: number, key: string) {
		delete this._state.deletedIndices[index]; // allow restoring an item
		this._setDeletedLength();
		this._entries = this._entries.slice(); // don't modify old array
		this._entries[index] = [key, (this._entries[index] || [])[1] || ''];
		this._trackChanges(index);
		if (this._state.uniqueKeyMap[key] > -1 && this._state.uniqueKeyMap[key] !== index) {
			// duplicate key, remove old one
			this.removeEntryAtIndex(this._state.uniqueKeyMap[key]);
			this._state.uniqueKeyMap[key] = index;
		}
	}

	public setValueAtIndex(index: number, val: string) {
		this._entries = this._entries.slice(); // don't modify old array
		this._entries[index] = [(this._entries[index] || [])[0] || '', val];
		this._trackChanges(index);
	}

	public removeEntryAtIndex(index: number) {
		this._state.deletedIndices[index] = true;
		this._setDeletedLength();
		this._trackChanges(index);
	}

	private _trackChanges(index: number) {
		const { deletedIndices, changedIndices, originalEntries } = this._state;
		if (deletedIndices[index] === true) {
			if (index < originalEntries.length) {
				changedIndices[index] = true;
			} else {
				delete changedIndices[index];
			}
		} else if (entriesEqual(originalEntries[index], this._entries[index])) {
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

interface EnvInputProps {
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

interface EnvInputState {
	expanded: boolean;
	multiline: boolean;
}

class EnvInput extends React.Component<EnvInputProps, EnvInputState> {
	private _textarea: HTMLTextAreaElement | null;

	constructor(props: EnvInputProps) {
		super(props);
		this.state = {
			expanded: false,
			multiline: props.value.indexOf('\n') >= 0
		};
		this._inputChangeHandler = this._inputChangeHandler.bind(this);
		this._inputFocusHandler = this._inputFocusHandler.bind(this);
		this._textareaBlurHandler = this._textareaBlurHandler.bind(this);
		this._textareaChangeHandler = this._textareaChangeHandler.bind(this);
		this._textarea = null;
	}

	public componentDidUpdate(prevProps: EnvInputProps, prevState: EnvInputState) {
		if (!prevState.expanded && this.state.expanded && this._textarea) {
			this._textarea.focus();
		}
	}

	public render() {
		const { placeholder, value, disabled } = this.props;
		const { expanded } = this.state;
		if (expanded) {
			return (
				<textarea
					value={value}
					onChange={this._textareaChangeHandler}
					onBlur={this._textareaBlurHandler}
					ref={(el) => {
						this._textarea = el;
					}}
				/>
			);
		}
		return (
			<input
				type="text"
				disabled={disabled}
				placeholder={placeholder}
				value={value}
				onChange={this._inputChangeHandler}
				onFocus={this._inputFocusHandler}
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

export default class EnvEditor extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			entries: new EnvState(props.entries)
		};
		this._searchInputHandler = this._searchInputHandler.bind(this);
		this._submitHandler = this._submitHandler.bind(this);
	}

	public render() {
		const { persisting } = this.props;
		const { entries } = this.state;
		return (
			<form onSubmit={this._submitHandler} className="env-editor">
				<SearchInput onDOMChange={this._searchInputHandler} />
				{entries.map(([key, value]: [string, string], index: number) => {
					return (
						<div key={index} className="env-row">
							<EnvInput
								placeholder="ENV key"
								value={key}
								onChange={this._keyChangeHandler.bind(this, index)}
								disabled={persisting}
							/>
							<EnvInput
								placeholder="ENV value"
								value={value}
								onChange={this._valueChangeHandler.bind(this, index)}
								disabled={persisting}
							/>
						</div>
					);
				})}
				{entries.deletedLength ? <p>Deleted:</p> : null}
				{entries.mapDeleted(([key, value]: [string, string], index: number) => {
					return (
						<div key={index} className="env-row">
							<EnvInput
								placeholder=""
								value={key}
								disabled={true}
								onChange={this._keyChangeHandler.bind(this, index)}
							/>
							<EnvInput
								placeholder=""
								value={value}
								disabled={true}
								onChange={this._valueChangeHandler.bind(this, index)}
							/>
							&nbsp;
							<Button
								type="button"
								label="Restore"
								hoverIndicator="background"
								onClick={
									persisting
										? undefined
										: () => {
												this._keyChangeHandler(index, key);
										  }
								}
							/>
						</div>
					);
				})}
				{persisting ? (
					// Disable save button with saving indicator
					<Button type="button" primary icon={<CheckmarkIcon />} label="Saving..." />
				) : entries.hasChanges ? (
					// Enable save button
					<Button type="submit" primary icon={<CheckmarkIcon />} label="Save" />
				) : (
					// Disable save button
					<Button type="button" primary icon={<CheckmarkIcon />} label="Save" />
				)}
			</form>
		);
	}

	private _keyChangeHandler(index: number, key: string) {
		let nextEntries = this.state.entries.dup();
		if (key.length > 0) {
			nextEntries.setKeyAtIndex(index, key);
		} else {
			nextEntries.removeEntryAtIndex(index);
		}
		this.setState({
			entries: nextEntries
		});
	}

	private _valueChangeHandler(index: number, value: string) {
		let nextEntries = this.state.entries.dup();
		nextEntries.setValueAtIndex(index, value);
		this.setState({
			entries: nextEntries
		});
	}

	private _searchInputHandler(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value || '';
		this.setState({
			entries: this.state.entries.filtered(value)
		});
	}

	private _submitHandler(e: React.SyntheticEvent) {
		e.preventDefault();
		this.props.persist(this.state.entries.entries());
	}
}
