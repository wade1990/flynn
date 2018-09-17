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

type ControllerGetApp = {
  readonly methodName: string;
  readonly service: typeof Controller;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof controller_pb.GetAppRequest;
  readonly responseType: typeof controller_pb.App;
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
  static readonly GetApp: ControllerGetApp;
  static readonly GetRelease: ControllerGetRelease;
  static readonly StreamAppLog: ControllerStreamAppLog;
  static readonly CreateRelease: ControllerCreateRelease;
  static readonly CreateDeployment: ControllerCreateDeployment;
  static readonly StreamEvents: ControllerStreamEvents;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }
export type ServiceClientOptions = { transport: grpc.TransportConstructor; debug?: boolean }

interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: () => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}

export class ControllerClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: ServiceClientOptions);
  listApps(
    requestMessage: controller_pb.ListAppsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError, responseMessage: controller_pb.ListAppsResponse|null) => void
  ): void;
  listApps(
    requestMessage: controller_pb.ListAppsRequest,
    callback: (error: ServiceError, responseMessage: controller_pb.ListAppsResponse|null) => void
  ): void;
  getApp(
    requestMessage: controller_pb.GetAppRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError, responseMessage: controller_pb.App|null) => void
  ): void;
  getApp(
    requestMessage: controller_pb.GetAppRequest,
    callback: (error: ServiceError, responseMessage: controller_pb.App|null) => void
  ): void;
  getRelease(
    requestMessage: controller_pb.GetReleaseRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError, responseMessage: controller_pb.Release|null) => void
  ): void;
  getRelease(
    requestMessage: controller_pb.GetReleaseRequest,
    callback: (error: ServiceError, responseMessage: controller_pb.Release|null) => void
  ): void;
  streamAppLog(requestMessage: controller_pb.StreamAppLogRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.LogChunk>;
  createRelease(
    requestMessage: controller_pb.CreateReleaseRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError, responseMessage: controller_pb.Release|null) => void
  ): void;
  createRelease(
    requestMessage: controller_pb.CreateReleaseRequest,
    callback: (error: ServiceError, responseMessage: controller_pb.Release|null) => void
  ): void;
  createDeployment(requestMessage: controller_pb.CreateDeploymentRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.Event>;
  streamEvents(requestMessage: controller_pb.StreamEventsRequest, metadata?: grpc.Metadata): ResponseStream<controller_pb.Event>;
}

