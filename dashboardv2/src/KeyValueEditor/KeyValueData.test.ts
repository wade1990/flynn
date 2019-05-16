import * as jspb from 'google-protobuf';
import { KeyValueData } from './KeyValueData';

/*
	hasConflicts(): boolean {
	hasConflict(key: string): boolean {
 */

it('initializes with a protobuf string Map', () => {
	const map = new jspb.Map<string, string>([['one', '1']]);
	const data = new KeyValueData(map);
	expect(data.length).toEqual(1);
	expect(data.deletedLength).toEqual(0);
	expect(data.hasChanges).toEqual(false);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', '1']]));
});

it('gets value for key', () => {
	const map = new jspb.Map<string, string>([['one', '1']]);
	const data = new KeyValueData(map);
	expect(data.get('one')).toEqual('1');
	expect(data.get('does-not-exist')).toEqual(undefined);
});

it('sets key at index', () => {
	const map = new jspb.Map<string, string>([['one', '1']]);
	const data = new KeyValueData(map);

	data.setKeyAtIndex(1, 'two');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', '1'], ['two', '']]));

	data.setKeyAtIndex(0, 'one-edited');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one-edited', '1'], ['two', '']]));

	expect(data.hasChanges).toEqual(true);
	expect(data.deletedLength).toEqual(0);
	expect(data.length).toEqual(2);

	// TODO(jvatic): Support prepending using -1 index
	// data.setKeyAtIndex(-1, 'first');
	// expect(data.get('first')).toEqual('');
	// expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['first', ''], ['one-edited', '1'], ['two', '']]));
});

it('sets value at index', () => {
	const map = new jspb.Map<string, string>([['one', '1']]);
	const data = new KeyValueData(map);

	data.setValueAtIndex(1, '2');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', '1'], ['', '2']]));

	data.setValueAtIndex(0, 'ONE');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', 'ONE'], ['', '2']]));

	expect(data.hasChanges).toEqual(true);
	expect(data.deletedLength).toEqual(0);
	expect(data.length).toEqual(2);

	// TODO(jvatic): Support prepending using -1 index
});

it('sets removes entry at index', () => {
	const map = new jspb.Map<string, string>([['one', '1'], ['two', '2'], ['three', '3']]);
	const data = new KeyValueData(map);

	data.removeEntryAtIndex(1);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', '1'], ['three', '3']]));

	expect(data.hasChanges).toEqual(true);
	expect(data.deletedLength).toEqual(1);
	expect(data.length).toEqual(2);
});

it('iterates over deleted entries', () => {
	const map = new jspb.Map<string, string>([['one', '1'], ['two', '2'], ['three', '3']]);
	const data = new KeyValueData(map);

	data.removeEntryAtIndex(1);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', '1'], ['three', '3']]));

	expect(
		data.mapDeleted(([key, value]: [string, string], index: number) => {
			return { [key]: value, index };
		})
	).toEqual([{ two: '2', index: 1 }]);
});

it('iterates over non-deleted entries', () => {
	const map = new jspb.Map<string, string>([['one', '1'], ['two', '2'], ['three', '3']]);
	const data = new KeyValueData(map);

	data.removeEntryAtIndex(1);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', '1'], ['three', '3']]));

	expect(
		data.map(([key, value]: [string, string], index: number) => {
			return { [key]: value, index };
		}, false)
	).toEqual([{ one: '1', index: 0 }, { three: '3', index: 2 }]);
});

it('appends empty entry by default when iterating over non-deleted entries', () => {
	const map = new jspb.Map<string, string>([['one', '1'], ['two', '2'], ['three', '3']]);
	const data = new KeyValueData(map);

	data.removeEntryAtIndex(1);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', '1'], ['three', '3']]));

	expect(
		data.map(([key, value]: [string, string], index: number) => {
			return [[index, key, value]];
		})
	).toEqual([[0, 'one', '1'], [2, 'three', '3'], [3, '', '']]);
});

it('filters out entries with empty key or value by default when retrieving entries', () => {
	const map = new jspb.Map<string, string>([['one', '1'], ['', '2'], ['three', '']]);
	const data = new KeyValueData(map);

	expect(data.entries()).toEqual(new jspb.Map<string, string>([['one', '1']]));
});

it('gets original value for key', () => {
	const map = new jspb.Map<string, string>([['one', '1']]);
	const data = new KeyValueData(map);

	data.setValueAtIndex(0, 'ONE');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', 'ONE']]));
	expect(data.getOriginal('one')).toEqual('1');

	data.setKeyAtIndex(0, 'one-changed');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one-changed', 'ONE']]));
	expect(data.getOriginal('one')).toEqual('1');

	data.removeEntryAtIndex(0);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([]));
	expect(data.getOriginal('one')).toEqual('1');

	expect(data.getOriginal('does-not-exist')).toEqual(undefined);
});

it('returns diff of changes made', () => {
	const map = new jspb.Map<string, string>([['one', '1']]);
	const data = new KeyValueData(map);

	data.setValueAtIndex(0, 'ONE');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', 'ONE']]));
	expect(data.getDiff()).toEqual([{ op: 'remove', key: 'one' }, { op: 'add', key: 'one', value: 'ONE' }]);

	data.setKeyAtIndex(0, 'one-changed');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one-changed', 'ONE']]));
	expect(data.getDiff()).toEqual([{ op: 'remove', key: 'one' }, { op: 'add', key: 'one-changed', value: 'ONE' }]);

	data.setKeyAtIndex(1, 'two');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one-changed', 'ONE'], ['two', '']]));
	expect(data.getDiff()).toEqual([
		{ op: 'remove', key: 'one' },
		{ op: 'add', key: 'one-changed', value: 'ONE' },
		{ op: 'add', key: 'two', value: '' }
	]);

	data.setValueAtIndex(1, '2');
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one-changed', 'ONE'], ['two', '2']]));
	expect(data.getDiff()).toEqual([
		{ op: 'remove', key: 'one' },
		{ op: 'add', key: 'one-changed', value: 'ONE' },
		{ op: 'add', key: 'two', value: '2' }
	]);

	data.removeEntryAtIndex(0);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['two', '2']]));
	expect(data.getDiff()).toEqual([{ op: 'remove', key: 'one' }, { op: 'add', key: 'two', value: '2' }]);
	expect(data.deletedLength).toEqual(1);
	expect(data.length).toEqual(1);
});

it('applies diff', () => {
	const map = new jspb.Map<string, string>([['one', '1'], ['two', '2']]);
	const data = new KeyValueData(map);

	data.applyDiff([{ op: 'remove', key: 'one' }, { op: 'add', key: 'three', value: '3' }]);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['two', '2'], ['three', '3']]));
	expect(data.hasChanges).toEqual(true);
	expect(data.deletedLength).toEqual(1);
	expect(data.length).toEqual(2);
});

it('returns a version of itself with filtered iteration', () => {
	const map = new jspb.Map<string, string>([['one-two-three', '1-2-3'], ['one-two-four', '1-2-4'], ['three', '3']]);
	const data = new KeyValueData(map).filtered('three');

	expect(
		data.map(([key, value]: [string, string], index: number) => {
			return [[key, value, index]];
		}, false)
	).toEqual([['one-two-three', '1-2-3', 0], ['three', '3', 2]]);
	expect(data.hasChanges).toEqual(false);
	expect(data.deletedLength).toEqual(0);
	expect(data.length).toEqual(3);
});

it('returns duplicate of itself', () => {
	const map = new jspb.Map<string, string>([['one-two-three', '1-2-3'], ['one-two-four', '1-2-4'], ['three', '3']]);
	const data = new KeyValueData(map);

	const data2 = data.dup();
	expect(data2.entries(false)).toEqual(
		new jspb.Map<string, string>([['one-two-three', '1-2-3'], ['one-two-four', '1-2-4'], ['three', '3']])
	);
	expect(data2.hasChanges).toEqual(false);
	expect(data2.deletedLength).toEqual(0);
	expect(data2.length).toEqual(3);

	data.setKeyAtIndex(0, 'first');
	expect(data.hasChanges).toEqual(true);
	expect(data2.hasChanges).toEqual(false);
	expect(data2.entries(false)).toEqual(
		new jspb.Map<string, string>([['one-two-three', '1-2-3'], ['one-two-four', '1-2-4'], ['three', '3']])
	);
	expect(data.entries(false)).toEqual(
		new jspb.Map<string, string>([['first', '1-2-3'], ['one-two-four', '1-2-4'], ['three', '3']])
	);
});

it('returns a version of itself rebased with new protobuf string map', () => {
	const map = new jspb.Map<string, string>([['one-two-three', '1-2-3'], ['one-two-four', '1-2-4'], ['three', '3']]);
	const data = new KeyValueData(map);

	data.setKeyAtIndex(0, 'one');
	data.setValueAtIndex(0, '1');
	data.removeEntryAtIndex(1);
	expect(data.entries(false)).toEqual(new jspb.Map<string, string>([['one', '1'], ['three', '3']]));
	expect(data.hasChanges).toEqual(true);
	expect(data.deletedLength).toEqual(1);
	expect(data.length).toEqual(2);

	const data2 = data.rebase(
		new jspb.Map<string, string>([
			['very-first', 'HELLO'],
			['one-two-three', '1-2-3'],
			['one-two-two', '1-2-2'],
			['one-two-four', '1-2-4'],
			['three', '3']
		])
	);
	expect(data2.hasChanges).toEqual(true);
	// TODO(jvatic): assert proper ordering here (requires redesign of data
	// storage and diffing)
	expect(data2.entries(false).toArray()).toEqual([
		['one', '1'],
		['three', '3'],
		['one-two-two', '1-2-2'],
		['very-first', 'HELLO']
	]);
	expect(data2.deletedLength).toEqual(1);
	expect(data2.length).toEqual(4);
});
