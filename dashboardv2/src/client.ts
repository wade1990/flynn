import { grpc } from 'grpc-web-client';

import Config from './config';
import { ControllerClient, ServiceError, Status } from './generated/controller_pb_service';
import {
	ListAppsRequest,
	ListAppsResponse,
	GetAppRequest,
	App,
	GetReleaseRequest,
	CreateReleaseRequest,
	Release,
	CreateDeploymentRequest,
	Deployment,
	Event
} from './generated/controller_pb';

export interface Client {
	listApps: () => Promise<App[]>;
	getApp: (name: string) => Promise<App>;
	getRelease: (name: string) => Promise<Release>;
	createRelease: (parentName: string, release: Release) => Promise<Release>;
	createDeployment: (parentName: string, releaseName: string) => Promise<Deployment>;
}

class _Client implements Client {
	private _cc: ControllerClient;
	constructor(cc: ControllerClient) {
		this._cc = cc;
	}

	public listApps(): Promise<App[]> {
		return new Promise<App[]>((resolve, reject) => {
			this._cc.listApps(new ListAppsRequest(), (error: ServiceError, response: ListAppsResponse | null) => {
				if (error === null) {
					resolve(response ? response.getAppsList() : []);
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
					resolve(response);
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
				const p = event.getParent();
				const data = event.getData();
				if (isDeploymentEvent(parentName, p, data)) {
					console.log('isDeploymentEvent', data);
					deployment = data;
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
			stream.on('end', () => {
				console.log('end');
			});
		});
	}
}

function isDeploymentEvent(parentName: string, eventParent: string, data: any): data is Deployment {
	if (eventParent.startsWith(parentName + '/deployments/')) {
		return true;
	} else {
		return false;
	}
}

let transport = grpc.DefaultTransportFactory;
const cc = new ControllerClient(Config.CONTROLLER_HOST, {
	transport
});

export default new _Client(cc);
