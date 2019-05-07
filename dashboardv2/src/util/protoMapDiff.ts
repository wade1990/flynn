import * as jspb from 'google-protobuf';

export interface DiffOp<K, V> {
	key: K;
	op: 'add' | 'remove' | 'keep';
	value?: V;
}

export type Diff<K, V> = Array<DiffOp<K, V>>;

export enum DiffOption {
	INCLUDE_UNCHANGED
}

export default function protoMapDiff<K, V>(a: jspb.Map<K, V>, b: jspb.Map<K, V>, ...opts: DiffOption[]): Diff<K, V> {
	let _opts = new Set(opts);
	let diff: Diff<K, V> = [];
	a.forEach((av: V, ak: K) => {
		const bv = b.get(ak);
		if (bv === av) {
			if (_opts.has(DiffOption.INCLUDE_UNCHANGED)) {
				diff.push({
					op: 'keep',
					key: ak
				});
			}
			return;
		}
		if (bv === undefined) {
			diff.push({
				op: 'remove',
				key: ak
			});
			return;
		}
		diff.push({ op: 'remove', key: ak }, { op: 'add', key: ak, value: bv });
	});
	b.forEach((bv: V, bk: K) => {
		const av = a.get(bk);
		if (av === undefined) {
			diff.push({
				op: 'add',
				key: bk,
				value: bv
			});
			return;
		}
	});
	return diff;
}

export function applyProtoMapDiff<K, V>(m: jspb.Map<K, V>, diff: Diff<K, V>, mutate: boolean = false): jspb.Map<K, V> {
	let newMap = new jspb.Map<K, V>(m.toArray());
	if (mutate) {
		newMap = m;
	}
	diff.forEach((op: DiffOp<K, V>) => {
		switch (op.op) {
			case 'add':
				if (op.value) {
					newMap.set(op.key, op.value);
				}
				break;
			case 'remove':
				newMap.del(op.key);
				break;
			default:
				break;
		}
	});
	return newMap;
}
