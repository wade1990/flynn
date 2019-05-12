// package: controller
// file: controller.proto

import * as controller_pb from "./controller_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ControllerListAppsStream = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.ListAppsRequest;
  readonly responseType: typeof controller_pb.ListAppsResponse;
};

type ControllerStreamApp = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.GetAppRequest;
  readonly responseType: typeof controller_pb.App;
};

type ControllerUpdateAppMeta = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.UpdateAppRequest;
  readonly responseType: typeof controller_pb.App;
};

type ControllerStreamAppRelease = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.GetAppReleaseRequest;
  readonly responseType: typeof controller_pb.Release;
};

type ControllerCreateScale = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.CreateScaleRequest;
  readonly responseType: typeof controller_pb.ScaleRequest;
};

type ControllerListScaleRequestsStream = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.ListScaleRequestsRequest;
  readonly responseType: typeof controller_pb.ListScaleRequestsResponse;
};

type ControllerStreamAppFormation = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.GetAppFormationRequest;
  readonly responseType: typeof controller_pb.Formation;
};

type ControllerGetRelease = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.GetReleaseRequest;
  readonly responseType: typeof controller_pb.Release;
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

type ControllerStreamDeployments = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.ListDeploymentsRequest;
  readonly responseType: typeof controller_pb.ListDeploymentsResponse;
};

type ControllerCreateDeployment = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof controller_pb.CreateDeploymentRequest;
  readonly responseType: typeof controller_pb.Event;
};

export class Controller {
  static readonly serviceName: string;
  static readonly ListAppsStream: ControllerListAppsStream;
  static readonly StreamApp: ControllerStreamApp;
  static readonly UpdateAppMeta: ControllerUpdateAppMeta;
  static readonly StreamAppRelease: ControllerStreamAppRelease;
  static readonly CreateScale: ControllerCreateScale;
  static readonly ListScaleRequestsStream: ControllerListScaleRequestsStream;
  static readonly StreamAppFormation: ControllerStreamAppFormation;
  static readonly GetRelease: ControllerGetRelease;
  static readonly StreamAppLog: ControllerStreamAppLog;
  static readonly CreateRelease: ControllerCreateRelease;
  static readonly StreamDeployments: ControllerStreamDeployments;
  static readonly CreateDeployment: ControllerCreateDeployment;
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
  listAppsStream(requestMessage: controller_pb.ListAppsRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.ListAppsResponse>;
  streamApp(requestMessage: controller_pb.GetAppRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.App>;
  updateAppMeta(
    requestMessage: controller_pb.UpdateAppRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.App|null) => void
  ): UnaryResponse;
  updateAppMeta(
    requestMessage: controller_pb.UpdateAppRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.App|null) => void
  ): UnaryResponse;
  streamAppRelease(requestMessage: controller_pb.GetAppReleaseRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.Release>;
  createScale(
    requestMessage: controller_pb.CreateScaleRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.ScaleRequest|null) => void
  ): UnaryResponse;
  createScale(
    requestMessage: controller_pb.CreateScaleRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.ScaleRequest|null) => void
  ): UnaryResponse;
  listScaleRequestsStream(requestMessage: controller_pb.ListScaleRequestsRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.ListScaleRequestsResponse>;
  streamAppFormation(requestMessage: controller_pb.GetAppFormationRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.Formation>;
  getRelease(
    requestMessage: controller_pb.GetReleaseRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: controller_pb.Release|null) => void
  ): UnaryResponse;
  getRelease(
    requestMessage: controller_pb.GetReleaseRequest,
    callback: (error: ServiceError|null, responseMessage: controller_pb.Release|null) => void
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
  streamDeployments(requestMessage: controller_pb.ListDeploymentsRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.ListDeploymentsResponse>;
  createDeployment(requestMessage: controller_pb.CreateDeploymentRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.Event>;
}

