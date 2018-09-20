import { DataStore } from './dataStore';

class FakeResource {
	private _name: string;
	private _props: any;
	constructor(name: string, props?: any) {
		this._name = name;
		this._props = props;
	}

	public getName() {
		return this._name;
	}

	public toObject() {
		return { name: this._name, props: this._props };
	}

	public getProps() {
		return this._props;
	}
}

it('can add and get values', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);
	const appName2 = 'apps/APP_ID_2';
	const app2 = new FakeResource(appName2);
	const releaseName1_1 = 'apps/APP_ID_1/releases/RELEASE_ID_1_1';
	const release1_1 = new FakeResource(releaseName1_1);
	const releaseName1_2 = 'apps/APP_ID_1/releases/RELEASE_ID_1_2';
	const release1_2 = new FakeResource(releaseName1_2);
	const releaseName2_1 = 'apps/APP_ID_1/releases/RELEASE_ID_2_1';
	const release2_1 = new FakeResource(releaseName2_1);
	ds.add(app1);
	ds.add(app2);
	ds.add(release1_1);
	ds.add(release1_2);
	ds.add(release2_1);

	expect(ds.get(appName1)).toEqual(app1);
	expect(ds.get(appName2)).toEqual(app2);
	expect(ds.get(releaseName1_1)).toEqual(release1_1);
	expect(ds.get(releaseName1_2)).toEqual(release1_2);
	expect(ds.get(releaseName2_1)).toEqual(release2_1);
});

it('only stores one value per key', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);
	const app1_dup = new FakeResource(appName1, { _dup: true });
	ds.add(app1);
	ds.add(app1_dup);

	expect(ds.get(appName1)).toBe(app1_dup);
});

it('only stores value if different from existing', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);
	const app1_dup1 = new FakeResource(appName1);
	const app1_dup2 = new FakeResource(appName1, { _dup: 2 });

	ds.add(app1);
	ds.add(app1_dup1);
	expect(ds.get(appName1)).toBe(app1);

	ds.add(app1_dup2);
	expect(ds.get(appName1)).toBe(app1_dup2);
});

it('can del values', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);
	const appName2 = 'apps/APP_ID_2';
	const app2 = new FakeResource(appName2);
	const releaseName1_1 = 'apps/APP_ID_1/releases/RELEASE_ID_1_1';
	const release1_1 = new FakeResource(releaseName1_1);
	const releaseName1_2 = 'apps/APP_ID_1/releases/RELEASE_ID_1_2';
	const release1_2 = new FakeResource(releaseName1_2);
	const releaseName2_1 = 'apps/APP_ID_1/releases/RELEASE_ID_2_1';
	const release2_1 = new FakeResource(releaseName2_1);
	ds.add(app1);
	ds.add(app2);
	ds.add(release1_1);
	ds.add(release1_2);
	ds.add(release2_1);

	expect(ds.get(appName1)).toEqual(app1);
	expect(ds.get(appName2)).toEqual(app2);
	expect(ds.get(releaseName1_1)).toEqual(release1_1);
	expect(ds.get(releaseName1_2)).toEqual(release1_2);
	expect(ds.get(releaseName2_1)).toEqual(release2_1);

	ds.del(appName2);
	expect(ds.get(appName2)).toEqual(undefined);
	expect(ds.get(releaseName2_1)).toEqual(release2_1);
	expect(ds.get(appName1)).toEqual(app1);
	expect(ds.get(releaseName1_1)).toEqual(release1_1);
	expect(ds.get(releaseName1_2)).toEqual(release1_2);
});

it('can add array of items', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);
	const releaseName1_1 = 'apps/APP_ID_1/releases/RELEASE_ID_1_1';
	const release1_1 = new FakeResource(releaseName1_1);
	ds.add(app1, release1_1);

	expect(ds.get(appName1)).toEqual(app1);
	expect(ds.get(releaseName1_1)).toEqual(release1_1);
});

it('watches for changes', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);

	const watchFn = ds.add(app1);

	expect(ds.get(appName1)).toEqual(app1);

	let app1_dup = new FakeResource(appName1, { _dup: true });

	let watchFnCalled = 0;
	watchFn((name, newApp1) => {
		watchFnCalled++;
		expect(name).toEqual(appName1);
		expect(newApp1).toEqual(app1_dup);
		expect(newApp1).not.toEqual(app1);
	});

	ds.add(app1_dup);
	expect(watchFnCalled).toBe(1);

	app1_dup = new FakeResource(appName1, { _dup: 1 });
	ds.add(app1_dup);
	expect(watchFnCalled).toBe(2);

	watchFn.unsubscribe();
	app1_dup = new FakeResource(appName1, { _dup: 2 });
	ds.add(app1_dup);
	expect(watchFnCalled).toBe(2);
});

it('watches for changes on all added items', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);
	const appName2 = 'apps/APP_ID_2';
	const app2 = new FakeResource(appName2);

	const watchFn = ds.add(app1, app2);

	expect(ds.get(appName1)).toEqual(app1);
	expect(ds.get(appName2)).toEqual(app2);

	const app1_dup = new FakeResource(appName1, { _dup: 1 });
	const app2_dup = new FakeResource(appName1, { _dup: 2 });

	let watchFnCalled = 0;
	watchFn((name, newApp) => {
		watchFnCalled++;
		expect(name).toEqual(appName1);
		if (watchFnCalled === 1) {
			expect(newApp).toEqual(app1_dup);
			expect(newApp).not.toEqual(app1);
		} else {
			expect(newApp).toEqual(app2_dup);
			expect(newApp).not.toEqual(app1);
		}
	});

	ds.add(app1_dup);
	expect(watchFnCalled).toBe(1);
	ds.add(app2_dup);
	expect(watchFnCalled).toBe(2);
});

it('watches for changes in an array', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);
	const appName2 = 'apps/APP_ID_2';
	const app2 = new FakeResource(appName2);

	const watchFn = ds.add(app1, app2);

	expect(ds.get(appName1)).toEqual(app1);

	let app1_dup = new FakeResource(appName1, { _dup: 1 });

	let watchFnCalled = 0;
	watchFn.arrayWatcher((arr, name, newApp1) => {
		watchFnCalled++;
		expect(arr).toEqual([app1_dup, app2]);
		expect(name).toEqual(appName1);
		expect(newApp1).toEqual(app1_dup);
		expect(newApp1).not.toEqual(app1);
	});

	ds.add(app1_dup);
	expect(watchFnCalled).toBe(1);

	app1_dup = new FakeResource(appName1, { _dup: 2 });
	ds.add(app1_dup);
	expect(watchFnCalled).toBe(2);

	watchFn.unsubscribe();
	app1_dup = new FakeResource(appName1, { _dup: 3 });
	ds.add(app1_dup);
	expect(watchFnCalled).toBe(2);
});

it('only calls watcher when resource changes', () => {
	const ds = new DataStore();

	const appName1 = 'apps/APP_ID_1';
	const app1 = new FakeResource(appName1);
	const app1_dup1 = new FakeResource(appName1);
	const app1_dup2 = new FakeResource(appName1, { _dup: 2 });

	let watcherCalled = 0;
	ds.watch(appName1)((name, resource) => {
		watcherCalled++;
	});

	ds.add(app1);
	expect(ds.get(appName1)).toBe(app1);
	expect(watcherCalled).toEqual(1);

	ds.add(app1_dup1);
	expect(ds.get(appName1)).toBe(app1);
	expect(watcherCalled).toEqual(1);

	ds.add(app1_dup2);
	expect(ds.get(appName1)).toBe(app1_dup2);
	expect(watcherCalled).toEqual(2);
});
