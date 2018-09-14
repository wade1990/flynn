import * as React from 'react';

import Button from 'grommet/components/Button';
import { CheckmarkIcon } from 'grommet';

export type Entries = Array<[string, string]>;

export interface Props {
	entries: Entries;
	persist: (next: Entries) => void;
}

interface State {
	entries: EnvState;
}

class EnvState {
	private _entries: Entries;
	private _deletedIndices: { [key: number]: boolean };
	constructor(entries: Entries, deletedIndices: { [key: number]: boolean } = {}) {
		this._entries = entries;
		this._deletedIndices = deletedIndices;
	}

	public dup(): EnvState {
		return new EnvState(this._entries, this._deletedIndices);
	}

	public entries(): Entries {
		return this._entries.filter(
			(entry: [string, string], index: number): boolean => {
				return this._deletedIndices[index] !== true;
			}
		);
	}

	public map<T>(fn: (entry: [string, string], index: number) => T): T[] {
		return this._entries.reduce<T[]>(
			(prev: T[], entry: [string, string], index: number): T[] => {
				if (this._deletedIndices[index] === true) {
					return prev;
				}
				return prev.concat(fn(entry, index));
			},
			[] as Array<T>
		);
	}

	public setKeyAtIndex(index: number, key: string) {
		delete this._deletedIndices[index]; // allow restoring an item
		this._entries = this._entries.slice(); // don't modify old array
		this._entries[index] = [key, this._entries[index][1]];
	}

	public setValueAtIndex(index: number, val: string) {
		this._entries = this._entries.slice(); // don't modify old array
		this._entries[index] = [this._entries[index][0], val];
	}

	public removeEntryAtIndex(index: number) {
		this._deletedIndices[index] = true;
	}
}

export default class EnvEditor extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			entries: new EnvState(props.entries)
		};
		this._saveButtonHandler = this._saveButtonHandler.bind(this);
	}

	public render() {
		const { entries } = this.state;
		return (
			<div>
				{entries.map(([key, value]: [string, string], index: number) => {
					return (
						<div key={index}>
							<input type="text" value={key} onChange={this._keyChangeHandler.bind(this, index)} />:{' '}
							<input type="text" value={value} onChange={this._valueChangeHandler.bind(this, index)} />
						</div>
					);
				})}
				<Button type="button" primary icon={<CheckmarkIcon />} label="Save" onClick={this._saveButtonHandler} />
			</div>
		);
	}

	private _keyChangeHandler(index: number, e: React.ChangeEvent<HTMLInputElement>) {
		const key = e.target.value || '';
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

	private _valueChangeHandler(index: number, e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value || '';
		let nextEntries = this.state.entries.dup();
		nextEntries.setValueAtIndex(index, value);
		this.setState({
			entries: nextEntries
		});
	}

	private _saveButtonHandler() {
		this.props.persist(this.state.entries.entries());
	}
}
