import { grpc } from 'grpc-web-client';

import Config from './config';
import { ControllerClient, ServiceError, Status, ResponseStream } from './generated/controller_pb_service';
import {
	ListAppsRequest,
	ListAppsResponse,
	GetAppRequest,
	UpdateAppRequest,
	App,
	GetReleaseRequest,
	CreateReleaseRequest,
	ListReleasesRequest,
	ListReleasesResponse,
	Release,
	CreateDeploymentRequest,
	Deployment,
	Event,
	StreamEventsRequest
} from './generated/controller_pb';
import dataStore from './dataStore';

export interface Client {
	listApps: () => Promise<App[]>;
	getApp: (name: string) => Promise<App>;
	updateApp: (app: App) => Promise<App>;
	getRelease: (name: string) => Promise<Release>;
	listReleases: (parentName: string, filterLabels?: { [key: string]: string }) => Promise<Release[]>;
	createRelease: (parentName: string, release: Release) => Promise<Release>;
	createDeployment: (parentName: string, releaseName: string) => Promise<Deployment>;
	streamEvents: (options: StreamEventsOptions, callback: StreamEventsCallback) => ResponseStream<Event>;
}

export type StreamEventsCallback = (event: Event | null, error: Error | null) => void;

export interface StreamEventsOptions {}

class _Client implements Client {
	private _cc: ControllerClient;
	constructor(cc: ControllerClient) {
		this._cc = cc;
	}

	public listApps(): Promise<App[]> {
		return new Promise<App[]>((resolve, reject) => {
			this._cc.listApps(new ListAppsRequest(), (error: ServiceError, response: ListAppsResponse | null) => {
				if (error === null) {
					const apps = response ? response.getAppsList() : [];
					dataStore.add(...apps);
					resolve(apps);
				} else {
					reject(error);
				}
			});
		});
	}

	public getApp(name: string): Promise<App> {
		const getAppRequest = new GetAppRequest();
		getAppRequest.setName(name);
		return new Promise<App>((resolve, reject) => {
			this._cc.getApp(getAppRequest, (error: ServiceError, response: App | null) => {
				if (response && error === null) {
					dataStore.add(response);
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	public updateApp(app: App): Promise<App> {
		return new Promise<App>((resolve, reject) => {
			const req = new UpdateAppRequest();
			req.setApp(app);
			this._cc.updateApp(req, (error: ServiceError, response: App | null) => {
				if (response && error === null) {
					dataStore.add(response);
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	public getRelease(name: string): Promise<Release> {
		const getReleaseRequest = new GetReleaseRequest();
		getReleaseRequest.setName(name);
		return new Promise<Release>((resolve, reject) => {
			this._cc.getRelease(getReleaseRequest, (error: ServiceError, response: Release | null) => {
				if (response && error === null) {
					dataStore.add(response);
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	public listReleases(parentName: string, filterLabels?: { [key: string]: string }): Promise<Release[]> {
		return new Promise<Release[]>((resolve, reject) => {
			const req = new ListReleasesRequest();
			req.setParent(parentName);
			if (filterLabels) {
				const fl = req.getFilterLabelsMap();
				for (const [k, v] of Object.entries(filterLabels)) {
					fl.set(k, v);
				}
			}
			this._cc.listReleases(req, (error: ServiceError, response: ListReleasesResponse) => {
				if (response && error === null) {
					const releases = response.getReleasesList();
					dataStore.add(...releases);
					resolve(releases);
				} else {
					reject(error);
				}
			});
		});
	}

	public createRelease(parentName: string, release: Release): Promise<Release> {
		const req = new CreateReleaseRequest();
		req.setParent(parentName);
		req.setRelease(release);
		return new Promise<Release>((resolve, reject) => {
			this._cc.createRelease(req, (error: ServiceError, response: Release | null) => {
				if (response && error === null) {
					dataStore.add(response);
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	public createDeployment(parentName: string, releaseName: string): Promise<Deployment> {
		const req = new CreateDeploymentRequest();
		req.setParent(parentName);
		req.setRelease(releaseName);
		let deployment = null as Deployment | null;
		return new Promise<Deployment>((resolve, reject) => {
			const stream = this._cc.createDeployment(req);
			stream.on('data', (event: Event) => {
				if (event.hasDeploymentEvent()) {
					const de = event.getDeploymentEvent();
					const d = de && de.getDeployment();
					if (d) {
						deployment = d;
						dataStore.add(deployment);
					}
				}
			});
			stream.on('status', (s: Status) => {
				console.log('status', s);
				if (s.code === grpc.Code.OK && deployment) {
					resolve(deployment);
				} else {
					reject(new Error(s.details));
				}
			});
			stream.on('end', () => {});
		});
	}

	public streamEvents(options: StreamEventsOptions, callback: StreamEventsCallback): ResponseStream<Event> {
		const req = new StreamEventsRequest();
		const stream = this._cc.streamEvents(req);
		stream.on('data', (event: Event) => {
			console.log('streamEvents data: ', event);
		});
		// TODO(jvatic): Handle stream error
		return stream;
	}
}

let transport = grpc.DefaultTransportFactory;
const cc = new ControllerClient(Config.CONTROLLER_HOST, {
	transport
});

export default new _Client(cc);
