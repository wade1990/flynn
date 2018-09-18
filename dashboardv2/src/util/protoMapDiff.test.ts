import * as jspb from 'google-protobuf';
import protoMapDiff, { Diff, applyProtoMapDiff } from './protoMapDiff';
import protoMapToObject from './protoMapToObject';

it('generates diff', () => {
	const a = new jspb.Map([['first', 'first-value'], ['third', 'third-value-1']]);
	const b = new jspb.Map([['second', 'second-value'], ['third', 'third-value-2']]);
	const diff = protoMapDiff(a, b);
	expect(diff).toEqual([
		{ op: 'remove', key: 'first' },
		{ op: 'replace', key: 'third', value: 'third-value-2' },
		{ op: 'add', key: 'second', value: 'second-value' }
	]);
});

it('applies diff', () => {
	const a = new jspb.Map([['first', 'first-value'], ['third', 'third-value-1'], ['fourth', 'fourth-value']]);
	const diff = [
		{ op: 'add', key: 'second', value: 'second-value' },
		{ op: 'remove', key: 'first' },
		{ op: 'replace', key: 'third', value: 'third-value-2' }
	] as Diff<string, string>;
	const b = applyProtoMapDiff(a, diff);
	expect(protoMapToObject(b)).toEqual({ second: 'second-value', third: 'third-value-2', fourth: 'fourth-value' });
	expect(protoMapToObject(a)).toEqual({
		first: 'first-value',
		third: 'third-value-1',
		fourth: 'fourth-value'
	});
});

it('applies diff via mutation', () => {
	const a = new jspb.Map([['first', 'first-value'], ['third', 'third-value-1'], ['fourth', 'fourth-value']]);
	const diff = [
		{ op: 'add', key: 'second', value: 'second-value' },
		{ op: 'remove', key: 'first' },
		{ op: 'replace', key: 'third', value: 'third-value-2' }
	] as Diff<string, string>;
	const b = applyProtoMapDiff(a, diff, true);
	expect(protoMapToObject(b)).toEqual({
		second: 'second-value',
		third: 'third-value-2',
		fourth: 'fourth-value'
	});
	expect(protoMapToObject(a)).toEqual({
		second: 'second-value',
		third: 'third-value-2',
		fourth: 'fourth-value'
	});
});
