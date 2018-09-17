import { grpc } from 'grpc-web-client';

import Config from './config';
import { ControllerClient, ServiceError } from './generated/controller_pb_service';
import {
	ListAppsRequest,
	ListAppsResponse,
	GetAppRequest,
	App,
	GetReleaseRequest,
	Release
} from './generated/controller_pb';

export interface Client {
	listApps: () => Promise<App[]>;
	getApp: (name: string) => Promise<App>;
	getRelease: (name: string) => Promise<Release>;
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
}

let transport = grpc.DefaultTransportFactory;
const cc = new ControllerClient(Config.CONTROLLER_HOST, {
	transport
});

export default new _Client(cc);
