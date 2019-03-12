import { grpc } from 'grpc-web-client';

import Config from './config';
import { ControllerClient, ServiceError, Status, ResponseStream } from './generated/controller_pb_service';
import {
	ListAppsRequest,
	ListAppsResponse,
	GetAppRequest,
	UpdateAppRequest,
	App,
	GetAppReleaseRequest,
	GetReleaseRequest,
	CreateReleaseRequest,
	ListReleasesRequest,
	ListReleasesResponse,
	Release,
	GetAppFormationRequest,
	Formation,
	ScaleRequest,
	ListScaleRequestsRequest,
	ListScaleRequestsResponse,
	CreateScaleRequest,
	CreateDeploymentRequest,
	Deployment,
	Event,
	StreamEventsRequest
} from './generated/controller_pb';

export interface Client {
	listApps: () => Promise<App[]>;
	listAppsStream: (cb: ListAppsStreamCallback) => () => void;
	getApp: (name: string) => Promise<App>;
	streamApp: (name: string, cb: StreamAppCallback) => () => void;
	updateApp: (app: App) => Promise<App>;
	getAppRelease: (appName: string) => Promise<Release>;
	streamAppRelease: (appName: string, cb: StreamAppReleaseCallback) => () => void;
	streamAppFormation: (appName: string, cb: StreamAppFormationCallback) => () => void;
	createScale: (req: CreateScaleRequest) => Promise<ScaleRequest>;
	listScaleRequestsStream: (appName: string, cb: ListScaleRequestsStreamCallback) => () => void;
	getRelease: (name: string) => Promise<Release>;
	listReleases: (parentName: string, filterLabels?: { [key: string]: string }) => Promise<Release[]>;
	listReleasesStream: (
		parentName: string,
		cb: ListReleasesStreamCallback,
		filterLabels?: { [key: string]: string }
	) => () => void;
	createRelease: (parentName: string, release: Release) => Promise<Release>;
	createDeployment: (parentName: string, releaseName: string) => Promise<Deployment>;
	streamEvents: (options: StreamEventsOptions, callback: StreamEventsCallback) => ResponseStream<Event>;
}

export type StreamEventsCallback = (event: Event | null, error: Error | null) => void;
export type ListAppsStreamCallback = (apps: App[], error: Error | null) => void;
export type StreamAppCallback = (app: App, error: Error | null) => void;
export type StreamAppReleaseCallback = (release: Release, error: Error | null) => void;
export type StreamAppFormationCallback = (formation: Formation, error: Error | null) => void;
export type ListReleasesStreamCallback = (releases: Release[], error: Error | null) => void;
export type ListScaleRequestsStreamCallback = (scaleRequests: ScaleRequest[], error: Error | null) => void;

export interface StreamEventsOptions {}

interface Cancellable {
	cancel(): void;
}

function buildCancelFunc(stream: Cancellable): () => void {
	let cancelled = false;
	return () => {
		if (cancelled) return;
		cancelled = true;
		stream.cancel();
	};
}

class _Client implements Client {
	private _cc: ControllerClient;
	private __streamAppFormationRequests: { [appName: string]: Set<StreamAppFormationCallback> };
	private __streamAppFormationResponses: { [appName: string]: Formation };
	private __streamAppFormationRequestCancellers: { [appName: string]: () => void };
	constructor(cc: ControllerClient) {
		this._cc = cc;
		this.__streamAppFormationRequests = {};
		this.__streamAppFormationResponses = {};
		this.__streamAppFormationRequestCancellers = {};
	}

	public listApps(): Promise<App[]> {
		return new Promise<App[]>((resolve, reject) => {
			this._cc.listApps(new ListAppsRequest(), (error: ServiceError, response: ListAppsResponse | null) => {
				if (error === null) {
					const apps = response ? response.getAppsList() : [];
					resolve(apps);
				} else {
					reject(error);
				}
			});
		});
	}

	public listAppsStream(cb: ListAppsStreamCallback): () => void {
		const stream = this._cc.listAppsStream();
		stream.write(new ListAppsRequest());
		stream.on('data', (response: ListAppsResponse) => {
			cb(response.getAppsList(), null);
		});
		// TODO(jvatic): Handle stream error
		return buildCancelFunc(stream);
	}

	public getApp(name: string): Promise<App> {
		const getAppRequest = new GetAppRequest();
		getAppRequest.setName(name);
		return new Promise<App>((resolve, reject) => {
			this._cc.getApp(getAppRequest, (error: ServiceError, response: App | null) => {
				if (response && error === null) {
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	public streamApp(name: string, cb: StreamAppCallback): () => void {
		const getAppRequest = new GetAppRequest();
		getAppRequest.setName(name);
		const stream = this._cc.streamApp(getAppRequest);
		stream.on('data', (response: App) => {
			cb(response, null);
		});
		// TODO(jvatic): Handle stream error
		return buildCancelFunc(stream);
	}

	public updateApp(app: App): Promise<App> {
		return new Promise<App>((resolve, reject) => {
			const req = new UpdateAppRequest();
			req.setApp(app);
			this._cc.updateApp(req, (error: ServiceError, response: App | null) => {
				if (response && error === null) {
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	public getAppRelease(appName: string): Promise<Release> {
		const req = new GetAppReleaseRequest();
		req.setParent(appName);
		return new Promise<Release>((resolve, reject) => {
			this._cc.getAppRelease(req, (error: ServiceError, response: Release | null) => {
				if (response && error === null) {
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	public streamAppRelease(appName: string, cb: StreamAppReleaseCallback): () => void {
		const req = new GetAppReleaseRequest();
		req.setParent(appName);
		const stream = this._cc.streamAppRelease(req);
		stream.on('data', (response: Release) => {
			cb(response, null);
		});
		// TODO(jvatic): Handle stream error
		return buildCancelFunc(stream);
	}

	public streamAppFormation(appName: string, cb: StreamAppFormationCallback): () => void {
		let cbs = this.__streamAppFormationRequests[appName];
		let formation = this.__streamAppFormationResponses[appName];
		const cancelFn = () => {
			cbs.delete(cb);
			if (cbs.size === 0) {
				const cancel = this.__streamAppFormationRequestCancellers[appName];
				if (cancel) {
					cancel();
				}
				delete this.__streamAppFormationRequests[appName];
				delete this.__streamAppFormationResponses[appName];
				delete this.__streamAppFormationRequestCancellers[appName];
			}
		};

		if (cbs && cbs.size) {
			cbs.add(cb);
			if (formation) {
				cb(formation, null);
			}
			return cancelFn;
		}
		cbs = this.__streamAppFormationRequests[appName] = new Set([cb]);

		const req = new GetAppFormationRequest();
		req.setParent(appName);
		const stream = this._cc.streamAppFormation(req);
		this.__streamAppFormationRequestCancellers[appName] = buildCancelFunc(stream);
		stream.on('data', (response: Formation) => {
			this.__streamAppFormationResponses[appName] = response;
			for (let fn of cbs.values()) {
				fn(response, null);
			}
		});
		// TODO(jvatic): Handle stream error
		return cancelFn;
	}

	public createScale(req: CreateScaleRequest): Promise<ScaleRequest> {
		return new Promise<ScaleRequest>((resolve, reject) => {
			this._cc.createScale(req, (error: ServiceError, response: ScaleRequest | null) => {
				if (response && error === null) {
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	public listScaleRequestsStream(appName: string, cb: ListScaleRequestsStreamCallback): () => void {
		const req = new ListScaleRequestsRequest();
		req.setParent(appName);
		const stream = this._cc.listScaleRequestsStream(req);
		stream.on('data', (response: ListScaleRequestsResponse) => {
			cb(response.getScaleRequestsList(), null);
		});
		// TODO(jvatic): Handle stream error
		return buildCancelFunc(stream);
	}

	public getRelease(name: string): Promise<Release> {
		const getReleaseRequest = new GetReleaseRequest();
		getReleaseRequest.setName(name);
		return new Promise<Release>((resolve, reject) => {
			this._cc.getRelease(getReleaseRequest, (error: ServiceError, response: Release | null) => {
				if (response && error === null) {
					resolve(response);
				} else {
					reject(error);
				}
			});
		});
	}

	private _buildReleasesReqest(parentName: string, filterLabels?: { [key: string]: string }): ListReleasesRequest {
		const req = new ListReleasesRequest();
		req.setParent(parentName);
		if (filterLabels) {
			const fl = req.getFilterLabelsMap();
			for (const [k, v] of Object.entries(filterLabels)) {
				fl.set(k, v);
			}
		}
		return req;
	}

	public listReleases(parentName: string, filterLabels?: { [key: string]: string }): Promise<Release[]> {
		return new Promise<Release[]>((resolve, reject) => {
			const req = this._buildReleasesReqest(parentName, filterLabels);
			this._cc.listReleases(req, (error: ServiceError, response: ListReleasesResponse) => {
				if (response && error === null) {
					const releases = response.getReleasesList();
					resolve(releases);
				} else {
					reject(error);
				}
			});
		});
	}

	public listReleasesStream(
		parentName: string,
		cb: ListReleasesStreamCallback,
		filterLabels?: { [key: string]: string }
	): () => void {
		const stream = this._cc.listReleasesStream();
		const req = this._buildReleasesReqest(parentName, filterLabels);
		stream.write(req);
		stream.on('data', (response: ListReleasesResponse) => {
			cb(response.getReleasesList(), null);
		});
		// TODO(jvatic): Handle stream error
		return buildCancelFunc(stream);
	}

	public createRelease(parentName: string, release: Release): Promise<Release> {
		const req = new CreateReleaseRequest();
		req.setParent(parentName);
		req.setRelease(release);
		return new Promise<Release>((resolve, reject) => {
			this._cc.createRelease(req, (error: ServiceError, response: Release | null) => {
				if (response && error === null) {
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

const cc = new ControllerClient(Config.CONTROLLER_HOST, {});

export default new _Client(cc);
