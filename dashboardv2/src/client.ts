import { grpc } from '@improbable-eng/grpc-web';

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
	ReleaseType,
	GetAppFormationRequest,
	Formation,
	ScaleRequest,
	ListScaleRequestsRequest,
	ListScaleRequestsResponse,
	CreateScaleRequest,
	CreateDeploymentRequest,
	Deployment,
	Event
} from './generated/controller_pb';

export interface Client {
	listAppsStream: (cb: ListAppsStreamCallback) => CancelFunc;
	streamApp: (name: string, cb: StreamAppCallback) => CancelFunc;
	updateAppMeta: (app: App, cb: UpdateAppCallback) => CancelFunc;
	streamAppRelease: (appName: string, cb: ReleaseCallback) => CancelFunc;
	streamAppFormation: (appName: string, cb: FormationCallback) => CancelFunc;
	createScale: (req: CreateScaleRequest, cb: CreateScaleCallback) => CancelFunc;
	listScaleRequestsStream: (appName: string, cb: ScaleRequestListCallback) => CancelFunc;
	getRelease: (name: string, cb: ReleaseCallback) => CancelFunc;
	listReleasesStream: (
		parentName: string,
		cb: ReleaseListCallback,
		...reqModifiers: ListReleasesRequestModifier[]
	) => CancelFunc;
	createRelease: (parentName: string, release: Release, cb: ReleaseCallback) => CancelFunc;
	createDeployment: (parentName: string, releaseName: string, cb: DeploymentCallback) => CancelFunc;
	createDeploymentWithScale: (
		parentName: string,
		releaseName: string,
		sr: CreateScaleRequest,
		cb: DeploymentCallback
	) => CancelFunc;
}

export type CancelFunc = () => void;
export type ListAppsStreamCallback = (apps: App[], error: Error | null) => void;
export type StreamAppCallback = (app: App, error: Error | null) => void;
export type UpdateAppCallback = (app: App, error: Error | null) => void;
export type CreateScaleCallback = (sr: ScaleRequest, error: Error | null) => void;
export type ReleaseCallback = (release: Release, error: Error | null) => void;
export type DeploymentCallback = (deployment: Deployment, error: Error | null) => void;
export type FormationCallback = (formation: Formation, error: Error | null) => void;
export type ReleaseListCallback = (releases: Release[], error: Error | null) => void;
export type ScaleRequestListCallback = (scaleRequests: ScaleRequest[], error: Error | null) => void;

export type ListReleasesRequestModifier = (req: ListReleasesRequest) => void;

const UnknownError = new Error('Unknown error');

export function listReleasesRequestFilterLabels(filterLabels: { [key: string]: string }): ListReleasesRequestModifier {
	return (req: ListReleasesRequest) => {
		const fl = req.getFilterLabelsMap();
		for (const [k, v] of Object.entries(filterLabels)) {
			fl.set(k, v);
		}
	};
}

export function listReleasesRequestFilterType(filterType: ReleaseType): ListReleasesRequestModifier {
	return (req: ListReleasesRequest) => {
		req.setFilterType(filterType);
	};
}

export interface StreamEventsOptions {}

interface Cancellable {
	cancel(): void;
}

function buildCancelFunc(req: Cancellable): CancelFunc {
	let cancelled = false;
	return () => {
		if (cancelled) return;
		cancelled = true;
		req.cancel();
	};
}

function buildStreamErrorHandler<T>(stream: ResponseStream<T>, cb: (error: Error) => void) {
	stream.on('status', (s: Status) => {
		if (s.code !== grpc.Code.OK) {
			cb(new Error(s.details));
		}
	});
}

const __memoizedStreams = {} as { [key: string]: ResponseStream<any> };
const __memoizedStreamUsers = {} as { [key: string]: number };
const __memoizedStreamResponses = {} as { [key: string]: any };
function memoizedStream<T>(
	contextKey: string,
	streamKey: string,
	initStream: () => ResponseStream<T>
): [ResponseStream<T>, T | undefined] {
	const key = contextKey + streamKey;
	function cleanup() {
		const n = (__memoizedStreamUsers[key] = (__memoizedStreamUsers[key] || 0) - 1);
		if (n === 0) {
			delete __memoizedStreams[key];
			delete __memoizedStreamUsers[key];
			delete __memoizedStreamResponses[key];
		}
		return n;
	}

	__memoizedStreamUsers[key] = (__memoizedStreamUsers[key] || 0) + 1;

	let stream = __memoizedStreams[key];
	if (stream) {
		return [stream as ResponseStream<T>, __memoizedStreamResponses[key] as T | undefined];
	}
	stream = initStream();
	stream.on('data', (data: T) => {
		__memoizedStreamResponses[key] = data;
	});
	stream.on('end', cleanup);
	const cancel = stream.cancel;
	stream.cancel = () => {
		if (cleanup() === 0) {
			cancel();
		}
	};
	__memoizedStreams[key] = stream;
	return [stream, undefined];
}

class _Client implements Client {
	private _cc: ControllerClient;
	constructor(cc: ControllerClient) {
		this._cc = cc;
	}

	public listAppsStream(cb: ListAppsStreamCallback): CancelFunc {
		const stream = this._cc.listAppsStream();
		stream.write(new ListAppsRequest());
		stream.on('data', (response: ListAppsResponse) => {
			cb(response.getAppsList(), null);
		});
		buildStreamErrorHandler(stream, (error: Error) => {
			cb([], error);
		});
		return buildCancelFunc(stream);
	}

	public streamApp(name: string, cb: StreamAppCallback): CancelFunc {
		const [stream, lastResponse] = memoizedStream('streamApp', name, () => {
			const getAppRequest = new GetAppRequest();
			getAppRequest.setName(name);
			const stream = this._cc.streamApp(getAppRequest);
			return stream;
		});
		stream.on('data', (response: App) => {
			cb(response, null);
		});
		buildStreamErrorHandler(stream, (error: Error) => {
			cb(new App(), error);
		});
		if (lastResponse) {
			cb(lastResponse, null);
		}
		return buildCancelFunc(stream);
	}

	public updateAppMeta(app: App, cb: UpdateAppCallback): CancelFunc {
		const req = new UpdateAppRequest();
		req.setApp(app);
		return buildCancelFunc(
			this._cc.updateAppMeta(req, (error: ServiceError, response: App | null) => {
				if (response && error === null) {
					cb(response, null);
				} else if (error) {
					cb(new App(), new Error(error.message));
				} else {
					cb(new App(), UnknownError);
				}
			})
		);
	}

	public streamAppRelease(appName: string, cb: ReleaseCallback): CancelFunc {
		const req = new GetAppReleaseRequest();
		req.setParent(appName);
		const stream = this._cc.streamAppRelease(req);
		stream.on('data', (response: Release) => {
			cb(response, null);
		});
		buildStreamErrorHandler(stream, (error: Error) => {
			cb(new Release(), error);
		});
		return buildCancelFunc(stream);
	}

	public streamAppFormation(appName: string, cb: FormationCallback): CancelFunc {
		const [stream, lastResponse] = memoizedStream('streamAppFormation', appName, () => {
			const req = new GetAppFormationRequest();
			req.setParent(appName);
			return this._cc.streamAppFormation(req);
		});
		stream.on('data', (response: Formation) => {
			cb(response, null);
		});
		if (lastResponse) {
			cb(lastResponse, null);
		}
		buildStreamErrorHandler(stream, (error: Error) => {
			cb(new Formation(), error);
		});
		return buildCancelFunc(stream);
	}

	public createScale(req: CreateScaleRequest, cb: CreateScaleCallback): CancelFunc {
		return buildCancelFunc(
			this._cc.createScale(req, (error: ServiceError, response: ScaleRequest | null) => {
				if (response && error === null) {
					cb(response, null);
				} else if (error) {
					cb(new ScaleRequest(), new Error(error.message));
				} else {
					cb(new ScaleRequest(), UnknownError);
				}
			})
		);
	}

	public listScaleRequestsStream(appName: string, cb: ScaleRequestListCallback): CancelFunc {
		const req = new ListScaleRequestsRequest();
		req.setParent(appName);
		const stream = this._cc.listScaleRequestsStream(req);
		stream.on('data', (response: ListScaleRequestsResponse) => {
			cb(response.getScaleRequestsList(), null);
		});
		buildStreamErrorHandler(stream, (error: Error) => {
			cb([], error);
		});
		return buildCancelFunc(stream);
	}

	public getRelease(name: string, cb: ReleaseCallback): CancelFunc {
		const getReleaseRequest = new GetReleaseRequest();
		getReleaseRequest.setName(name);
		return buildCancelFunc(
			this._cc.getRelease(getReleaseRequest, (error: ServiceError, response: Release | null) => {
				if (response && error === null) {
					cb(response, null);
				} else if (error) {
					cb(new Release(), new Error(error.message));
				} else {
					cb(new Release(), UnknownError);
				}
			})
		);
	}

	public listReleasesStream(
		parentName: string,
		cb: ReleaseListCallback,
		...reqModifiers: ListReleasesRequestModifier[]
	): CancelFunc {
		const stream = this._cc.listReleasesStream();
		const req = new ListReleasesRequest();
		req.setParent(parentName);
		reqModifiers.forEach((m) => m(req));
		stream.write(req);
		stream.on('data', (response: ListReleasesResponse) => {
			cb(response.getReleasesList(), null);
		});
		buildStreamErrorHandler(stream, (error: Error) => {
			cb([], error);
		});
		return buildCancelFunc(stream);
	}

	public createRelease(parentName: string, release: Release, cb: ReleaseCallback): CancelFunc {
		const req = new CreateReleaseRequest();
		req.setParent(parentName);
		req.setRelease(release);
		return buildCancelFunc(
			this._cc.createRelease(req, (error: ServiceError, response: Release | null) => {
				if (response && error === null) {
					cb(response, null);
				} else if (error) {
					cb(new Release(), new Error(error.message));
				} else {
					cb(new Release(), UnknownError);
				}
			})
		);
	}

	public createDeployment(parentName: string, releaseName: string, cb: DeploymentCallback): CancelFunc {
		const req = new CreateDeploymentRequest();
		req.setParent(parentName);
		req.setRelease(releaseName);
		return this._createDeployment(req, cb);
	}

	public createDeploymentWithScale(
		parentName: string,
		releaseName: string,
		sr: CreateScaleRequest,
		cb: DeploymentCallback
	): CancelFunc {
		const req = new CreateDeploymentRequest();
		req.setParent(parentName);
		req.setRelease(releaseName);
		req.setScaleRequest(sr);
		return this._createDeployment(req, cb);
	}

	private _createDeployment(req: CreateDeploymentRequest, cb: DeploymentCallback): CancelFunc {
		let deployment = null as Deployment | null;
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
				cb(deployment, null);
			} else {
				cb(new Deployment(), new Error(s.details));
			}
		});
		stream.on('end', () => {});
		return buildCancelFunc(stream);
	}
}

const cc = new ControllerClient(Config.CONTROLLER_HOST, {});

export default new _Client(cc);
