import { grpc } from '@improbable-eng/grpc-web';

import Config from './config';
import { ControllerClient, ServiceError, Status, ResponseStream } from './generated/controller_pb_service';
import {
	StreamAppsRequest,
	StreamAppsResponse,
	UpdateAppRequest,
	App,
	StreamReleasesRequest,
	StreamReleasesResponse,
	CreateReleaseRequest,
	Release,
	ReleaseTypeMap,
	StreamFormationsRequest,
	StreamFormationsResponse,
	Formation,
	ScaleRequest,
	StreamScalesRequest,
	StreamScalesResponse,
	CreateScaleRequest,
	CreateDeploymentRequest,
	Deployment,
	ExpandedDeployment,
	StreamDeploymentsRequest,
	StreamDeploymentsResponse,
	DeploymentEvent,
	LabelFilter
} from './generated/controller_pb';

export interface Client {
	streamApps: (cb: AppsCallback, ...reqModifiers: RequestModifier<StreamAppsRequest>[]) => CancelFunc;
	streamApp: (name: string, cb: AppCallback) => CancelFunc;
	updateApp: (app: App, cb: AppCallback) => CancelFunc;
	streamReleases: (cb: ReleasesCallback, ...reqModifiers: RequestModifier<StreamReleasesRequest>[]) => CancelFunc;
	streamAppRelease: (appName: string, cb: ReleaseCallback) => CancelFunc;
	streamFormations: (cb: FormationsCallback, ...reqModifiers: RequestModifier<StreamFormationsRequest>[]) => CancelFunc;
	streamAppFormation: (appName: string, cb: FormationCallback) => CancelFunc;
	createScale: (req: CreateScaleRequest, cb: CreateScaleCallback) => CancelFunc;
	streamScales: (cb: ScaleRequestsCallback, ...reqModifiers: RequestModifier<StreamScalesRequest>[]) => CancelFunc;
	streamAppScales: (
		appName: string,
		cb: ScaleRequestsCallback,
		...reqModifiers: RequestModifier<StreamScalesRequest>[]
	) => CancelFunc;
	getRelease: (name: string, cb: ReleaseCallback) => CancelFunc;
	createRelease: (parentName: string, release: Release, cb: ReleaseCallback) => CancelFunc;
	streamDeployments: (
		cb: DeploymentsCallback,
		...reqModifiers: RequestModifier<StreamDeploymentsRequest>[]
	) => CancelFunc;
	streamAppDeployments: (
		appName: string,
		cb: DeploymentsCallback,
		...reqModifiers: RequestModifier<StreamDeploymentsRequest>[]
	) => CancelFunc;
	createDeployment: (parentName: string, releaseName: string, cb: DeploymentCallback) => CancelFunc;
	createDeploymentWithScale: (
		parentName: string,
		releaseName: string,
		sr: CreateScaleRequest,
		cb: DeploymentCallback
	) => CancelFunc;
}

export type ErrorWithCode = Error & ServiceError;
export type CancelFunc = () => void;
export type AppsCallback = (apps: App[], error: ErrorWithCode | null) => void;
export type AppCallback = (app: App, error: ErrorWithCode | null) => void;
export type ReleasesCallback = (releases: Release[], error: ErrorWithCode | null) => void;
export type FormationsCallback = (formations: Formation[], error: ErrorWithCode | null) => void;
export type CreateScaleCallback = (sr: ScaleRequest, error: ErrorWithCode | null) => void;
export type ReleaseCallback = (release: Release, error: ErrorWithCode | null) => void;
export type DeploymentCallback = (deployment: Deployment, error: ErrorWithCode | null) => void;
export type FormationCallback = (formation: Formation, error: ErrorWithCode | null) => void;
export type ScaleRequestsCallback = (scaleRequests: ScaleRequest[], error: ErrorWithCode | null) => void;
export type DeploymentsCallback = (deployments: ExpandedDeployment[], error: ErrorWithCode | null) => void;

export type RequestModifier<T> = {
	(req: T): void;
	key: string;
};

export interface PaginatableRequest {
	getPageSize(): number;
	setPageSize(value: number): void;

	getPageToken(): string;
	setPageToken(value: string): void;
}

export function setRequestPageSize(pageSize: number): RequestModifier<PaginatableRequest> {
	return Object.assign(
		(req: PaginatableRequest) => {
			req.setPageSize(pageSize);
		},
		{ key: `pageSize--${pageSize}` }
	);
}

export interface NameFilterable {
	clearNameFiltersList(): void;
	getNameFiltersList(): Array<string>;
	setNameFiltersList(value: Array<string>): void;
	addNameFilters(value: string, index?: number): string;
}

export function filterRequestByName(...filterNames: string[]): RequestModifier<NameFilterable> {
	return Object.assign(
		(req: NameFilterable) => {
			req.setNameFiltersList(filterNames);
		},
		{ key: `nameFilters--${filterNames.join('|')}` }
	);
}

export function listDeploymentsRequestFilterType(
	...filterTypes: Array<ReleaseTypeMap[keyof ReleaseTypeMap]>
): RequestModifier<StreamDeploymentsRequest> {
	return Object.assign(
		(req: StreamDeploymentsRequest) => {
			req.setTypeFiltersList(filterTypes);
		},
		{ key: `filterTypes--${filterTypes.join('|')}` }
	);
}

export function excludeAppsWithLabels(labels: [string, string][]): RequestModifier<StreamAppsRequest> {
	return Object.assign(
		(req: StreamAppsRequest) => {
			labels.forEach(([key, val]: [string, string]) => {
				const f = new LabelFilter();
				const e = new LabelFilter.Expression();
				e.setKey(key);
				e.addValues(val);
				e.setOp(LabelFilter.Expression.Operator.OP_NOT_IN);
				f.addExpressions(e);
				req.addLabelFilters(f);
			});
		},
		{ key: `excludeAppsWithLabels--${JSON.stringify(labels)}` }
	);
}

const UnknownError: ErrorWithCode = Object.assign(new Error('Unknown error'), {
	code: grpc.Code.Unknown,
	metadata: new grpc.Metadata()
});

export function isNotFoundError(error: Error): boolean {
	return (error as ErrorWithCode).code === grpc.Code.NotFound;
}

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

function convertServiceError(error: ServiceError): ErrorWithCode {
	return Object.assign(new Error(error.message), error);
}

function buildStatusError(s: Status): ErrorWithCode {
	return Object.assign(new Error(s.details), s);
}

function buildStreamErrorHandler<T>(stream: ResponseStream<T>, cb: (error: ErrorWithCode) => void) {
	stream.on('status', (s: Status) => {
		if (s.code !== grpc.Code.OK) {
			cb(buildStatusError(s));
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
	function cleanup(streamEnded = false) {
		const n = (__memoizedStreamUsers[key] = (__memoizedStreamUsers[key] || 0) - 1);
		if (n === 0 || streamEnded) {
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
	let cancel = stream.cancel;
	stream.on('end', () => {
		cleanup(true);
		cancel = () => {};
	});
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

	public streamApps(cb: AppsCallback, ...reqModifiers: RequestModifier<StreamAppsRequest>[]): CancelFunc {
		const streamKey = reqModifiers.map((m) => m.key).join(':');
		const [stream, lastResponse] = memoizedStream('streamApps', streamKey, () => {
			const req = new StreamReleasesRequest();
			reqModifiers.forEach((m) => m(req));
			return this._cc.streamApps(req);
		});
		stream.on('data', (response: StreamAppsResponse) => {
			cb(response.getAppsList(), null);
		});
		if (lastResponse) {
			cb(lastResponse.getAppsList(), null);
		}
		buildStreamErrorHandler(stream, (error: ErrorWithCode) => {
			cb([], error);
		});
		return buildCancelFunc(stream);
	}

	public streamApp(name: string, cb: AppCallback): CancelFunc {
		return this.streamApps(
			(apps: App[], error: ErrorWithCode | null) => {
				cb(apps[0] || new App(), error);
			},
			filterRequestByName(name),
			setRequestPageSize(1)
		);
	}

	public updateApp(app: App, cb: AppCallback): CancelFunc {
		// TODO(jvatic): implement update_mask to include only changed fields
		const req = new UpdateAppRequest();
		req.setApp(app);
		return buildCancelFunc(
			this._cc.updateApp(req, (error: ServiceError | null, response: App | null) => {
				if (response && error === null) {
					cb(response, null);
				} else if (error) {
					cb(new App(), convertServiceError(error));
				} else {
					cb(new App(), UnknownError);
				}
			})
		);
	}

	public streamReleases(cb: ReleasesCallback, ...reqModifiers: RequestModifier<StreamReleasesRequest>[]): CancelFunc {
		const streamKey = reqModifiers.map((m) => m.key).join(':');
		const [stream, lastResponse] = memoizedStream('streamReleases', streamKey, () => {
			const req = new StreamReleasesRequest();
			reqModifiers.forEach((m) => m(req));
			return this._cc.streamReleases(req);
		});
		stream.on('data', (response: StreamReleasesResponse) => {
			cb(response.getReleasesList(), null);
		});
		if (lastResponse) {
			cb(lastResponse.getReleasesList(), null);
		}
		buildStreamErrorHandler(stream, (error: ErrorWithCode) => {
			cb([], error);
		});
		return buildCancelFunc(stream);
	}

	public streamAppRelease(appName: string, cb: ReleaseCallback): CancelFunc {
		return this.streamReleases(
			(releases: Release[], error: ErrorWithCode | null) => {
				cb(releases[0] || new Release(), error);
			},
			filterRequestByName(appName),
			setRequestPageSize(1)
		);
	}

	public streamFormations(
		cb: FormationsCallback,
		...reqModifiers: RequestModifier<StreamFormationsRequest>[]
	): CancelFunc {
		const streamKey = reqModifiers.map((m) => m.key).join(':');
		const [stream, lastResponse] = memoizedStream('streamFormations', streamKey, () => {
			const req = new StreamFormationsRequest();
			reqModifiers.forEach((m) => m(req));
			return this._cc.streamFormations(req);
		});
		stream.on('data', (response: StreamFormationsResponse) => {
			cb(response.getFormationsList(), null);
		});
		if (lastResponse) {
			cb(lastResponse.getFormationsList(), null);
		}
		buildStreamErrorHandler(stream, (error: ErrorWithCode) => {
			cb([], error);
		});
		return buildCancelFunc(stream);
	}

	public streamAppFormation(appName: string, cb: FormationCallback): CancelFunc {
		return this.streamFormations(
			(formations: Formation[], error: ErrorWithCode | null) => {
				cb(formations[0] || new Formation(), error);
			},
			filterRequestByName(appName),
			setRequestPageSize(1)
		);
	}

	public createScale(req: CreateScaleRequest, cb: CreateScaleCallback): CancelFunc {
		return buildCancelFunc(
			this._cc.createScale(req, (error: ServiceError | null, response: ScaleRequest | null) => {
				if (response && error === null) {
					cb(response, null);
				} else if (error) {
					cb(new ScaleRequest(), convertServiceError(error));
				} else {
					cb(new ScaleRequest(), UnknownError);
				}
			})
		);
	}

	public streamScales(cb: ScaleRequestsCallback, ...reqModifiers: RequestModifier<StreamScalesRequest>[]): CancelFunc {
		const streamKey = reqModifiers.map((m) => m.key).join(':');
		const [stream, lastResponse] = memoizedStream('streamScales', streamKey, () => {
			const req = new StreamScalesRequest();
			reqModifiers.forEach((m) => m(req));
			return this._cc.streamScales(req);
		});
		stream.on('data', (response: StreamScalesResponse) => {
			cb(response.getScaleRequestsList(), null);
		});
		if (lastResponse) {
			cb(lastResponse.getScaleRequestsList(), null);
		}
		buildStreamErrorHandler(stream, (error: ErrorWithCode) => {
			cb([], error);
		});
		return buildCancelFunc(stream);
	}

	public streamAppScales(
		appName: string,
		cb: ScaleRequestsCallback,
		...reqModifiers: RequestModifier<StreamScalesRequest>[]
	): CancelFunc {
		return this.streamScales(cb, filterRequestByName(appName));
	}

	public getRelease(name: string, cb: ReleaseCallback): CancelFunc {
		const cancel = this.streamReleases(
			(releases: Release[], error: ErrorWithCode | null) => {
				const release = releases[0];
				if (release) {
					cancel();
					cb(release, error);
				} else {
					cb(new Release(), error);
				}
			},
			filterRequestByName(name),
			setRequestPageSize(1)
		);
		return cancel;
	}

	public createRelease(parentName: string, release: Release, cb: ReleaseCallback): CancelFunc {
		const req = new CreateReleaseRequest();
		req.setParent(parentName);
		req.setRelease(release);
		return buildCancelFunc(
			this._cc.createRelease(req, (error: ServiceError | null, response: Release | null) => {
				if (response && error === null) {
					cb(response, null);
				} else if (error) {
					cb(new Release(), convertServiceError(error));
				} else {
					cb(new Release(), UnknownError);
				}
			})
		);
	}

	public streamDeployments(
		cb: DeploymentsCallback,
		...reqModifiers: RequestModifier<StreamDeploymentsRequest>[]
	): CancelFunc {
		const streamKey = reqModifiers.map((m) => m.key).join(':');
		const [stream, lastResponse] = memoizedStream('streamDeployments', streamKey, () => {
			const req = new StreamDeploymentsRequest();
			reqModifiers.forEach((m) => m(req));
			return this._cc.streamDeployments(req);
		});
		stream.on('data', (response: StreamDeploymentsResponse) => {
			cb(response.getDeploymentsList(), null);
		});
		if (lastResponse) {
			cb(lastResponse.getDeploymentsList(), null);
		}
		buildStreamErrorHandler(stream, (error: ErrorWithCode) => {
			cb([], error);
		});
		return buildCancelFunc(stream);
	}

	public streamAppDeployments(
		appName: string,
		cb: DeploymentsCallback,
		...reqModifiers: RequestModifier<StreamDeploymentsRequest>[]
	): CancelFunc {
		return this.streamDeployments(cb, filterRequestByName(appName));
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
		stream.on('data', (event: DeploymentEvent) => {
			const d = event.getDeployment();
			if (d) {
				deployment = d;
			}
		});
		stream.on('status', (s: Status) => {
			if (s.code === grpc.Code.OK && deployment) {
				cb(deployment, null);
			} else {
				cb(new Deployment(), buildStatusError(s));
			}
		});
		stream.on('end', () => {});
		return buildCancelFunc(stream);
	}
}

const cc = new ControllerClient(Config.CONTROLLER_HOST, {});

export default new _Client(cc);
