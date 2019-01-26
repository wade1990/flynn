// package: controller
// file: controller.proto

import * as controller_pb from "./controller_pb";
import {grpc} from "grpc-web-client";

type ControllerListApps = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.ListAppsRequest;
  readonly responseType: typeof controller_pb.ListAppsResponse;
};

type ControllerListAppsStream = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.ListAppsRequest;
  readonly responseType: typeof controller_pb.ListAppsResponse;
};

type ControllerGetApp = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.GetAppRequest;
  readonly responseType: typeof controller_pb.App;
};

type ControllerUpdateApp = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.UpdateAppRequest;
  readonly responseType: typeof controller_pb.App;
};

type ControllerGetAppRelease = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.GetAppReleaseRequest;
  readonly responseType: typeof controller_pb.Release;
};

type ControllerGetRelease = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.GetReleaseRequest;
  readonly responseType: typeof controller_pb.Release;
};

type ControllerListReleases = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.ListReleasesRequest;
  readonly responseType: typeof controller_pb.ListReleasesResponse;
};

type ControllerStreamAppLog = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.StreamAppLogRequest;
  readonly responseType: typeof controller_pb.LogChunk;
};

type ControllerCreateRelease = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.CreateReleaseRequest;
  readonly responseType: typeof controller_pb.Release;
};

type ControllerCreateDeployment = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.CreateDeploymentRequest;
  readonly responseType: typeof controller_pb.Event;
};

type ControllerStreamEvents = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.StreamEventsRequest;
  readonly responseType: typeof controller_pb.Event;
};

export class Controller {
  static readonly serviceName: string;
  static readonly ListApps: ControllerListApps;
  static readonly ListAppsStream: ControllerListAppsStream;
  static readonly GetApp: ControllerGetApp;
  static readonly UpdateApp: ControllerUpdateApp;
  static readonly GetAppRelease: ControllerGetAppRelease;
  static readonly GetRelease: ControllerGetRelease;
  static readonly ListReleases: ControllerListReleases;
  static readonly StreamAppLog: ControllerStreamAppLog;
  static readonly CreateRelease: ControllerCreateRelease;
  static readonly CreateDeployment: ControllerCreateDeployment;
  static readonly StreamEvents: ControllerStreamEvents;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: () => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: () => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: () => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class ControllerClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  listApps(
    requestMessage: controller_pb.ListAppsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.ListAppsResponse|null) => void
  ): UnaryResponse;
  listApps(
    requestMessage: controller_pb.ListAppsRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.ListAppsResponse|null) => void
  ): UnaryResponse;
  listAppsStream(metadata?: grpc.Metadata): BidirectionalStream<controller_pb.ListAppsRequest, controller_pb.ListAppsResponse>;
  getApp(
    requestMessage: controller_pb.GetAppRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.App|null) => void
  ): UnaryResponse;
  getApp(
    requestMessage: controller_pb.GetAppRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.App|null) => void
  ): UnaryResponse;
  updateApp(
    requestMessage: controller_pb.UpdateAppRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.App|null) => void
  ): UnaryResponse;
  updateApp(
    requestMessage: controller_pb.UpdateAppRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.App|null) => void
  ): UnaryResponse;
  getAppRelease(
    requestMessage: controller_pb.GetAppReleaseRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.Release|null) => void
  ): UnaryResponse;
  getAppRelease(
    requestMessage: controller_pb.GetAppReleaseRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.Release|null) => void
  ): UnaryResponse;
  getRelease(
    requestMessage: controller_pb.GetReleaseRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.Release|null) => void
  ): UnaryResponse;
  getRelease(
    requestMessage: controller_pb.GetReleaseRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.Release|null) => void
  ): UnaryResponse;
  listReleases(
    requestMessage: controller_pb.ListReleasesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.ListReleasesResponse|null) => void
  ): UnaryResponse;
  listReleases(
    requestMessage: controller_pb.ListReleasesRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.ListReleasesResponse|null) => void
  ): UnaryResponse;
  streamAppLog(requestMessage: controller_pb.StreamAppLogRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.LogChunk>;
  createRelease(
    requestMessage: controller_pb.CreateReleaseRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.Release|null) => void
  ): UnaryResponse;
  createRelease(
    requestMessage: controller_pb.CreateReleaseRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.Release|null) => void
  ): UnaryResponse;
  createDeployment(requestMessage: controller_pb.CreateDeploymentRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.Event>;
  streamEvents(requestMessage: controller_pb.StreamEventsRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.Event>;
}

