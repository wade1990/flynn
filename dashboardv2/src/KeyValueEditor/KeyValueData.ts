import * as jspb from 'google-protobuf';
import fz from 'fz';
import protoMapDiff, { mergeProtoMapDiff, Diff, DiffOp, DiffConflict } from '../util/protoMapDiff';

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
