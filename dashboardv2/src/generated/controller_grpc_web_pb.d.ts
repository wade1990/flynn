import * as grpcWeb from 'grpc-web';

import * as google_api_annotations_pb from './google/api/annotations_pb';
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as google_protobuf_duration_pb from 'google-protobuf/google/protobuf/duration_pb';
import * as google_protobuf_field_mask_pb from 'google-protobuf/google/protobuf/field_mask_pb';

import {
  App,
  CreateDeploymentRequest,
  CreateReleaseRequest,
  CreateScaleRequest,
  Event,
  Formation,
  GetAppFormationRequest,
  GetAppReleaseRequest,
  GetAppRequest,
  GetReleaseRequest,
  ListAppsRequest,
  ListAppsResponse,
  ListDeploymentsRequest,
  ListDeploymentsResponse,
  ListReleasesRequest,
  ListReleasesResponse,
  ListScaleRequestsRequest,
  ListScaleRequestsResponse,
  LogChunk,
  Release,
  ScaleRequest,
  StreamAppLogRequest,
  StreamEventsRequest,
  UpdateAppRequest} from './controller_pb';

export class ControllerClient {
  constructor (hostname: string,
               credentials: null | { [index: string]: string; },
               options: null | { [index: string]: string; });

  listApps(
    request: ListAppsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: ListAppsResponse) => void
  ): grpcWeb.ClientReadableStream<ListAppsResponse>;

  listAppsStream(
    request: ListAppsRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<ListAppsResponse>;

  getApp(
    request: GetAppRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: App) => void
  ): grpcWeb.ClientReadableStream<App>;

  streamApp(
    request: GetAppRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<App>;

  updateApp(
    request: UpdateAppRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: App) => void
  ): grpcWeb.ClientReadableStream<App>;

  updateAppMeta(
    request: UpdateAppRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: App) => void
  ): grpcWeb.ClientReadableStream<App>;

  getAppRelease(
    request: GetAppReleaseRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: Release) => void
  ): grpcWeb.ClientReadableStream<Release>;

  streamAppRelease(
    request: GetAppReleaseRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<Release>;

  createScale(
    request: CreateScaleRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: ScaleRequest) => void
  ): grpcWeb.ClientReadableStream<ScaleRequest>;

  listScaleRequestsStream(
    request: ListScaleRequestsRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<ListScaleRequestsResponse>;

  streamAppFormation(
    request: GetAppFormationRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<Formation>;

  getRelease(
    request: GetReleaseRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: Release) => void
  ): grpcWeb.ClientReadableStream<Release>;

  listReleases(
    request: ListReleasesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: ListReleasesResponse) => void
  ): grpcWeb.ClientReadableStream<ListReleasesResponse>;

  listReleasesStream(
    request: ListReleasesRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<ListReleasesResponse>;

  streamAppLog(
    request: StreamAppLogRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<LogChunk>;

  createRelease(
    request: CreateReleaseRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: Release) => void
  ): grpcWeb.ClientReadableStream<Release>;

  streamDeployments(
    request: ListDeploymentsRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<ListDeploymentsResponse>;

  createDeployment(
    request: CreateDeploymentRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<Event>;

  streamEvents(
    request: StreamEventsRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<Event>;

}

export class ControllerPromiseClient {
  constructor (hostname: string,
               credentials: null | { [index: string]: string; },
               options: null | { [index: string]: string; });

  listApps(
    request: ListAppsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<ListAppsResponse>;

  listAppsStream(
    request: ListAppsRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<ListAppsResponse>;

  getApp(
    request: GetAppRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<App>;

  streamApp(
    request: GetAppRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<App>;

  updateApp(
    request: UpdateAppRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<App>;

  updateAppMeta(
    request: UpdateAppRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<App>;

  getAppRelease(
    request: GetAppReleaseRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<Release>;

  streamAppRelease(
    request: GetAppReleaseRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<Release>;

  createScale(
    request: CreateScaleRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<ScaleRequest>;

  listScaleRequestsStream(
    request: ListScaleRequestsRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<ListScaleRequestsResponse>;

  streamAppFormation(
    request: GetAppFormationRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<Formation>;

  getRelease(
    request: GetReleaseRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<Release>;

  listReleases(
    request: ListReleasesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<ListReleasesResponse>;

  listReleasesStream(
    request: ListReleasesRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<ListReleasesResponse>;

  streamAppLog(
    request: StreamAppLogRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<LogChunk>;

  createRelease(
    request: CreateReleaseRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<Release>;

  streamDeployments(
    request: ListDeploymentsRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<ListDeploymentsResponse>;

  createDeployment(
    request: CreateDeploymentRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<Event>;

  streamEvents(
    request: StreamEventsRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<Event>;

}

