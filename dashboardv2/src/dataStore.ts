interface Named {
	getName: () => string;
}

interface WatchFuncCallback {
	(name: string, data: Named | undefined): void;
}

interface WatchFuncArrayCallback {
	(arr: Named[], name: string, data: Named | undefined): void;
}

interface WatchFunc {
	(cb: WatchFuncCallback): WatchFunc;
	arrayWatcher: (cb: WatchFuncArrayCallback) => WatchFunc;
	unsubscribe: () => void;
}

export interface DataStoreInterface {
	add: (...items: Named[]) => WatchFunc;
	get: (name: string) => Named | undefined;
	del: (name: string) => void;
	watch: (...names: string[]) => WatchFunc;
}

export class DataStore implements DataStoreInterface {
	private _cbs: Set<WatchFuncCallback>;
	private _d: { [k: string]: Named };
	constructor() {
		this._d = {};
		this._cbs = new Set<WatchFuncCallback>();
	}

	public add(...items: Named[]): WatchFunc {
		const names = [] as string[];
		items.forEach((item) => {
			const name = item.getName();
			names.push(name);
			this._d[name] = item;

			this._publish(name, item);
		});

		return this.watch(...names);
	}

	public get(name: string): Named | undefined {
		return this._d[name];
	}

	public del(name: string) {
		delete this._d[name];
		this._publish(name, undefined);
	}

	public watch(...namesArr: string[]): WatchFunc {
		const names = new Set(namesArr);
		const cbs = new Set<WatchFuncCallback>();
		const watchFunc = Object.assign(
			(cb: WatchFuncCallback) => {
				const filteredCb = (name: string, data: Named) => {
					if (names.has(name)) {
						cb(name, data);
					}
				};
				cbs.add(filteredCb);
				this._cbs.add(filteredCb);
				return watchFunc;
			},
			{
				arrayWatcher: (cb: WatchFuncArrayCallback) => {
					const filteredCb = (name: string, data: Named) => {
						if (names.has(name)) {
							const arr = namesArr.reduce(
								(arr, name) => {
									const _data = this.get(name);
									if (_data !== undefined) {
										arr.push(_data);
									}
									return arr;
								},
								[] as Named[]
							);
							cb(arr, name, data);
						}
					};
					cbs.add(filteredCb);
					this._cbs.add(filteredCb);
					return watchFunc;
				},
				unsubscribe: () => {
					cbs.forEach((cb) => {
						cbs.delete(cb);
						this._cbs.delete(cb);
					});
				}
			}
		);
		return watchFunc;
	}

	private _publish(name: string, data: Named | undefined) {
		this._cbs.forEach((cb: WatchFuncCallback) => {
			cb(name, data);
		});
	}
}

export default new DataStore();
