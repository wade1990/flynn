// package: controller
// file: controller.proto

import * as jspb from "google-protobuf";
import * as google_api_annotations_pb from "./google/api/annotations_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_duration_pb from "google-protobuf/google/protobuf/duration_pb";
import * as google_protobuf_field_mask_pb from "google-protobuf/google/protobuf/field_mask_pb";

export class ListAppsRequest extends jspb.Message {
  getPageSize(): number;
  setPageSize(value: number): void;

  getPageToken(): string;
  setPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAppsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListAppsRequest): ListAppsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAppsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAppsRequest;
  static deserializeBinaryFromReader(message: ListAppsRequest, reader: jspb.BinaryReader): ListAppsRequest;
}

export namespace ListAppsRequest {
  export type AsObject = {
    pageSize: number,
    pageToken: string,
  }
}

export class ListAppsResponse extends jspb.Message {
  clearAppsList(): void;
  getAppsList(): Array<App>;
  setAppsList(value: Array<App>): void;
  addApps(value?: App, index?: number): App;

  getNextPageToken(): string;
  setNextPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAppsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListAppsResponse): ListAppsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAppsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAppsResponse;
  static deserializeBinaryFromReader(message: ListAppsResponse, reader: jspb.BinaryReader): ListAppsResponse;
}

export namespace ListAppsResponse {
  export type AsObject = {
    appsList: Array<App.AsObject>,
    nextPageToken: string,
  }
}

export class GetAppRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAppRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAppRequest): GetAppRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetAppRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAppRequest;
  static deserializeBinaryFromReader(message: GetAppRequest, reader: jspb.BinaryReader): GetAppRequest;
}

export namespace GetAppRequest {
  export type AsObject = {
    name: string,
  }
}

export class UpdateAppRequest extends jspb.Message {
  hasApp(): boolean;
  clearApp(): void;
  getApp(): App | undefined;
  setApp(value?: App): void;

  hasUpdateMask(): boolean;
  clearUpdateMask(): void;
  getUpdateMask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setUpdateMask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateAppRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateAppRequest): UpdateAppRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateAppRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateAppRequest;
  static deserializeBinaryFromReader(message: UpdateAppRequest, reader: jspb.BinaryReader): UpdateAppRequest;
}

export namespace UpdateAppRequest {
  export type AsObject = {
    app?: App.AsObject,
    updateMask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
  }
}

export class ListReleasesRequest extends jspb.Message {
  getPageSize(): number;
  setPageSize(value: number): void;

  getPageToken(): string;
  setPageToken(value: string): void;

  getParent(): string;
  setParent(value: string): void;

  getFilterLabelsMap(): jspb.Map<string, string>;
  clearFilterLabelsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListReleasesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListReleasesRequest): ListReleasesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListReleasesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListReleasesRequest;
  static deserializeBinaryFromReader(message: ListReleasesRequest, reader: jspb.BinaryReader): ListReleasesRequest;
}

export namespace ListReleasesRequest {
  export type AsObject = {
    pageSize: number,
    pageToken: string,
    parent: string,
    filterLabelsMap: Array<[string, string]>,
  }
}

export class ListReleasesResponse extends jspb.Message {
  clearReleasesList(): void;
  getReleasesList(): Array<Release>;
  setReleasesList(value: Array<Release>): void;
  addReleases(value?: Release, index?: number): Release;

  getNextPageToken(): string;
  setNextPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListReleasesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListReleasesResponse): ListReleasesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListReleasesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListReleasesResponse;
  static deserializeBinaryFromReader(message: ListReleasesResponse, reader: jspb.BinaryReader): ListReleasesResponse;
}

export namespace ListReleasesResponse {
  export type AsObject = {
    releasesList: Array<Release.AsObject>,
    nextPageToken: string,
  }
}

export class GetReleaseRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetReleaseRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetReleaseRequest): GetReleaseRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetReleaseRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetReleaseRequest;
  static deserializeBinaryFromReader(message: GetReleaseRequest, reader: jspb.BinaryReader): GetReleaseRequest;
}

export namespace GetReleaseRequest {
  export type AsObject = {
    name: string,
  }
}

export class StreamAppLogRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  hasOpts(): boolean;
  clearOpts(): void;
  getOpts(): LogAggregatorLogOpts | undefined;
  setOpts(value?: LogAggregatorLogOpts): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamAppLogRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamAppLogRequest): StreamAppLogRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamAppLogRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamAppLogRequest;
  static deserializeBinaryFromReader(message: StreamAppLogRequest, reader: jspb.BinaryReader): StreamAppLogRequest;
}

export namespace StreamAppLogRequest {
  export type AsObject = {
    name: string,
    opts?: LogAggregatorLogOpts.AsObject,
  }
}

export class CreateReleaseRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  hasRelease(): boolean;
  clearRelease(): void;
  getRelease(): Release | undefined;
  setRelease(value?: Release): void;

  getRequestId(): string;
  setRequestId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateReleaseRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateReleaseRequest): CreateReleaseRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateReleaseRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateReleaseRequest;
  static deserializeBinaryFromReader(message: CreateReleaseRequest, reader: jspb.BinaryReader): CreateReleaseRequest;
}

export namespace CreateReleaseRequest {
  export type AsObject = {
    parent: string,
    release?: Release.AsObject,
    requestId: string,
  }
}

export class CreateDeploymentRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  getRelease(): string;
  setRelease(value: string): void;

  getRequestId(): string;
  setRequestId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateDeploymentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateDeploymentRequest): CreateDeploymentRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateDeploymentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateDeploymentRequest;
  static deserializeBinaryFromReader(message: CreateDeploymentRequest, reader: jspb.BinaryReader): CreateDeploymentRequest;
}

export namespace CreateDeploymentRequest {
  export type AsObject = {
    parent: string,
    release: string,
    requestId: string,
  }
}

export class StreamEventsRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  clearObjectTypesList(): void;
  getObjectTypesList(): Array<string>;
  setObjectTypesList(value: Array<string>): void;
  addObjectTypes(value: string, index?: number): string;

  getObjectId(): string;
  setObjectId(value: string): void;

  getPost(): boolean;
  setPost(value: boolean): void;

  getCount(): number;
  setCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamEventsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamEventsRequest): StreamEventsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamEventsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamEventsRequest;
  static deserializeBinaryFromReader(message: StreamEventsRequest, reader: jspb.BinaryReader): StreamEventsRequest;
}

export namespace StreamEventsRequest {
  export type AsObject = {
    parent: string,
    objectTypesList: Array<string>,
    objectId: string,
    post: boolean,
    count: number,
  }
}

export class App extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getDisplayName(): string;
  setDisplayName(value: string): void;

  getLabelsMap(): jspb.Map<string, string>;
  clearLabelsMap(): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasUpdateTime(): boolean;
  clearUpdateTime(): void;
  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  getDeployTimeout(): number;
  setDeployTimeout(value: number): void;

  getStrategy(): string;
  setStrategy(value: string): void;

  getRelease(): string;
  setRelease(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): App.AsObject;
  static toObject(includeInstance: boolean, msg: App): App.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: App, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): App;
  static deserializeBinaryFromReader(message: App, reader: jspb.BinaryReader): App;
}

export namespace App {
  export type AsObject = {
    name: string,
    displayName: string,
    labelsMap: Array<[string, string]>,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    updateTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    deployTimeout: number,
    strategy: string,
    release: string,
  }
}

export class Release extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  clearArtifactsList(): void;
  getArtifactsList(): Array<string>;
  setArtifactsList(value: Array<string>): void;
  addArtifacts(value: string, index?: number): string;

  getEnvMap(): jspb.Map<string, string>;
  clearEnvMap(): void;
  getLabelsMap(): jspb.Map<string, string>;
  clearLabelsMap(): void;
  getProcessesMap(): jspb.Map<string, ProcessType>;
  clearProcessesMap(): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Release.AsObject;
  static toObject(includeInstance: boolean, msg: Release): Release.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Release, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Release;
  static deserializeBinaryFromReader(message: Release, reader: jspb.BinaryReader): Release;
}

export namespace Release {
  export type AsObject = {
    name: string,
    artifactsList: Array<string>,
    envMap: Array<[string, string]>,
    labelsMap: Array<[string, string]>,
    processesMap: Array<[string, ProcessType.AsObject]>,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class AppRelease extends jspb.Message {
  hasPrevRelease(): boolean;
  clearPrevRelease(): void;
  getPrevRelease(): Release | undefined;
  setPrevRelease(value?: Release): void;

  hasRelease(): boolean;
  clearRelease(): void;
  getRelease(): Release | undefined;
  setRelease(value?: Release): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppRelease.AsObject;
  static toObject(includeInstance: boolean, msg: AppRelease): AppRelease.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppRelease, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppRelease;
  static deserializeBinaryFromReader(message: AppRelease, reader: jspb.BinaryReader): AppRelease;
}

export namespace AppRelease {
  export type AsObject = {
    prevRelease?: Release.AsObject,
    release?: Release.AsObject,
  }
}

export class Deployment extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getOldRelease(): string;
  setOldRelease(value: string): void;

  getNewRelease(): string;
  setNewRelease(value: string): void;

  getStrategy(): string;
  setStrategy(value: string): void;

  getStatus(): DeploymentStatus;
  setStatus(value: DeploymentStatus): void;

  getProcessesMap(): jspb.Map<string, number>;
  clearProcessesMap(): void;
  getTagsMap(): jspb.Map<string, DeploymentProcessTags>;
  clearTagsMap(): void;
  getDeployTimeout(): number;
  setDeployTimeout(value: number): void;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasExpireTime(): boolean;
  clearExpireTime(): void;
  getExpireTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpireTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasEndTime(): boolean;
  clearEndTime(): void;
  getEndTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setEndTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Deployment.AsObject;
  static toObject(includeInstance: boolean, msg: Deployment): Deployment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Deployment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Deployment;
  static deserializeBinaryFromReader(message: Deployment, reader: jspb.BinaryReader): Deployment;
}

export namespace Deployment {
  export type AsObject = {
    name: string,
    oldRelease: string,
    newRelease: string,
    strategy: string,
    status: DeploymentStatus,
    processesMap: Array<[string, number]>,
    tagsMap: Array<[string, DeploymentProcessTags.AsObject]>,
    deployTimeout: number,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    expireTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    endTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class DeploymentProcessTags extends jspb.Message {
  getTagsMap(): jspb.Map<string, string>;
  clearTagsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeploymentProcessTags.AsObject;
  static toObject(includeInstance: boolean, msg: DeploymentProcessTags): DeploymentProcessTags.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeploymentProcessTags, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeploymentProcessTags;
  static deserializeBinaryFromReader(message: DeploymentProcessTags, reader: jspb.BinaryReader): DeploymentProcessTags;
}

export namespace DeploymentProcessTags {
  export type AsObject = {
    tagsMap: Array<[string, string]>,
  }
}

export class Certificate extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  clearRoutesList(): void;
  getRoutesList(): Array<string>;
  setRoutesList(value: Array<string>): void;
  addRoutes(value: string, index?: number): string;

  getCert(): string;
  setCert(value: string): void;

  getKey(): string;
  setKey(value: string): void;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasUpdateTime(): boolean;
  clearUpdateTime(): void;
  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Certificate.AsObject;
  static toObject(includeInstance: boolean, msg: Certificate): Certificate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Certificate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Certificate;
  static deserializeBinaryFromReader(message: Certificate, reader: jspb.BinaryReader): Certificate;
}

export namespace Certificate {
  export type AsObject = {
    name: string,
    routesList: Array<string>,
    cert: string,
    key: string,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    updateTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class Route extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getParent(): string;
  setParent(value: string): void;

  getType(): Route.RouteType;
  setType(value: Route.RouteType): void;

  getServiceName(): string;
  setServiceName(value: string): void;

  getPort(): number;
  setPort(value: number): void;

  getLeader(): boolean;
  setLeader(value: boolean): void;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasUpdateTime(): boolean;
  clearUpdateTime(): void;
  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  getDomain(): string;
  setDomain(value: string): void;

  hasCertificate(): boolean;
  clearCertificate(): void;
  getCertificate(): Certificate | undefined;
  setCertificate(value?: Certificate): void;

  getSticky(): boolean;
  setSticky(value: boolean): void;

  getPath(): string;
  setPath(value: string): void;

  getDrainBackends(): boolean;
  setDrainBackends(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Route.AsObject;
  static toObject(includeInstance: boolean, msg: Route): Route.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Route, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Route;
  static deserializeBinaryFromReader(message: Route, reader: jspb.BinaryReader): Route;
}

export namespace Route {
  export type AsObject = {
    name: string,
    parent: string,
    type: Route.RouteType,
    serviceName: string,
    port: number,
    leader: boolean,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    updateTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    domain: string,
    certificate?: Certificate.AsObject,
    sticky: boolean,
    path: string,
    drainBackends: boolean,
  }

  export enum RouteType {
    HTTP = 0,
    TCP = 1,
  }
}

export class Resource extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getExternalId(): string;
  setExternalId(value: string): void;

  getEnvMap(): jspb.Map<string, string>;
  clearEnvMap(): void;
  clearAppsList(): void;
  getAppsList(): Array<string>;
  setAppsList(value: Array<string>): void;
  addApps(value: string, index?: number): string;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Resource.AsObject;
  static toObject(includeInstance: boolean, msg: Resource): Resource.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Resource, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Resource;
  static deserializeBinaryFromReader(message: Resource, reader: jspb.BinaryReader): Resource;
}

export namespace Resource {
  export type AsObject = {
    name: string,
    externalId: string,
    envMap: Array<[string, string]>,
    appsList: Array<string>,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class Job extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Job.AsObject;
  static toObject(includeInstance: boolean, msg: Job): Job.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Job, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Job;
  static deserializeBinaryFromReader(message: Job, reader: jspb.BinaryReader): Job;
}

export namespace Job {
  export type AsObject = {
  }
}

export class Event extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getParent(): string;
  setParent(value: string): void;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasApp(): boolean;
  clearApp(): void;
  getApp(): App | undefined;
  setApp(value?: App): void;

  hasAppDeletion(): boolean;
  clearAppDeletion(): void;
  getAppDeletion(): AppDeletionEvent | undefined;
  setAppDeletion(value?: AppDeletionEvent): void;

  hasAppRelease(): boolean;
  clearAppRelease(): void;
  getAppRelease(): AppReleaseEvent | undefined;
  setAppRelease(value?: AppReleaseEvent): void;

  hasDeployment(): boolean;
  clearDeployment(): void;
  getDeployment(): DeploymentEvent | undefined;
  setDeployment(value?: DeploymentEvent): void;

  hasJob(): boolean;
  clearJob(): void;
  getJob(): Job | undefined;
  setJob(value?: Job): void;

  hasScaleRequest(): boolean;
  clearScaleRequest(): void;
  getScaleRequest(): ScaleRequestEvent | undefined;
  setScaleRequest(value?: ScaleRequestEvent): void;

  hasRelease(): boolean;
  clearRelease(): void;
  getRelease(): Release | undefined;
  setRelease(value?: Release): void;

  hasReleaseDeletion(): boolean;
  clearReleaseDeletion(): void;
  getReleaseDeletion(): ReleaseDeletionEvent | undefined;
  setReleaseDeletion(value?: ReleaseDeletionEvent): void;

  hasArtifact(): boolean;
  clearArtifact(): void;
  getArtifact(): ArtifactEvent | undefined;
  setArtifact(value?: ArtifactEvent): void;

  hasProvider(): boolean;
  clearProvider(): void;
  getProvider(): ProviderEvent | undefined;
  setProvider(value?: ProviderEvent): void;

  hasResource(): boolean;
  clearResource(): void;
  getResource(): Resource | undefined;
  setResource(value?: Resource): void;

  hasResourceDeletion(): boolean;
  clearResourceDeletion(): void;
  getResourceDeletion(): ResourceDeletionEvent | undefined;
  setResourceDeletion(value?: ResourceDeletionEvent): void;

  hasResourceAppDeletion(): boolean;
  clearResourceAppDeletion(): void;
  getResourceAppDeletion(): ResourceAppDeletionEvent | undefined;
  setResourceAppDeletion(value?: ResourceAppDeletionEvent): void;

  hasRoute(): boolean;
  clearRoute(): void;
  getRoute(): Route | undefined;
  setRoute(value?: Route): void;

  hasRouteDeletion(): boolean;
  clearRouteDeletion(): void;
  getRouteDeletion(): RouteDeletionEvent | undefined;
  setRouteDeletion(value?: RouteDeletionEvent): void;

  hasDomainMigration(): boolean;
  clearDomainMigration(): void;
  getDomainMigration(): DomainMigrationEvent | undefined;
  setDomainMigration(value?: DomainMigrationEvent): void;

  hasClusterBackup(): boolean;
  clearClusterBackup(): void;
  getClusterBackup(): ClusterBackupEvent | undefined;
  setClusterBackup(value?: ClusterBackupEvent): void;

  hasAppGarbageCollection(): boolean;
  clearAppGarbageCollection(): void;
  getAppGarbageCollection(): AppGarbageCollectionEvent | undefined;
  setAppGarbageCollection(value?: AppGarbageCollectionEvent): void;

  hasSink(): boolean;
  clearSink(): void;
  getSink(): Sink | undefined;
  setSink(value?: Sink): void;

  hasSinkDeletion(): boolean;
  clearSinkDeletion(): void;
  getSinkDeletion(): SinkDeletionEvent | undefined;
  setSinkDeletion(value?: SinkDeletionEvent): void;

  hasVolume(): boolean;
  clearVolume(): void;
  getVolume(): Volume | undefined;
  setVolume(value?: Volume): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Event.AsObject;
  static toObject(includeInstance: boolean, msg: Event): Event.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Event, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Event;
  static deserializeBinaryFromReader(message: Event, reader: jspb.BinaryReader): Event;
}

export namespace Event {
  export type AsObject = {
    name: string,
    parent: string,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    app?: App.AsObject,
    appDeletion?: AppDeletionEvent.AsObject,
    appRelease?: AppReleaseEvent.AsObject,
    deployment?: DeploymentEvent.AsObject,
    job?: Job.AsObject,
    scaleRequest?: ScaleRequestEvent.AsObject,
    release?: Release.AsObject,
    releaseDeletion?: ReleaseDeletionEvent.AsObject,
    artifact?: ArtifactEvent.AsObject,
    provider?: ProviderEvent.AsObject,
    resource?: Resource.AsObject,
    resourceDeletion?: ResourceDeletionEvent.AsObject,
    resourceAppDeletion?: ResourceAppDeletionEvent.AsObject,
    route?: Route.AsObject,
    routeDeletion?: RouteDeletionEvent.AsObject,
    domainMigration?: DomainMigrationEvent.AsObject,
    clusterBackup?: ClusterBackupEvent.AsObject,
    appGarbageCollection?: AppGarbageCollectionEvent.AsObject,
    sink?: Sink.AsObject,
    sinkDeletion?: SinkDeletionEvent.AsObject,
    volume?: Volume.AsObject,
  }
}

export class AppDeletionEvent extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  clearDeletedRoutesList(): void;
  getDeletedRoutesList(): Array<Route>;
  setDeletedRoutesList(value: Array<Route>): void;
  addDeletedRoutes(value?: Route, index?: number): Route;

  clearDeletedResourcesList(): void;
  getDeletedResourcesList(): Array<Resource>;
  setDeletedResourcesList(value: Array<Resource>): void;
  addDeletedResources(value?: Resource, index?: number): Resource;

  clearDeletedReleasesList(): void;
  getDeletedReleasesList(): Array<Release>;
  setDeletedReleasesList(value: Array<Release>): void;
  addDeletedReleases(value?: Release, index?: number): Release;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppDeletionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: AppDeletionEvent): AppDeletionEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppDeletionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppDeletionEvent;
  static deserializeBinaryFromReader(message: AppDeletionEvent, reader: jspb.BinaryReader): AppDeletionEvent;
}

export namespace AppDeletionEvent {
  export type AsObject = {
    name: string,
    deletedRoutesList: Array<Route.AsObject>,
    deletedResourcesList: Array<Resource.AsObject>,
    deletedReleasesList: Array<Release.AsObject>,
  }
}

export class AppReleaseEvent extends jspb.Message {
  hasPrevRelease(): boolean;
  clearPrevRelease(): void;
  getPrevRelease(): Release | undefined;
  setPrevRelease(value?: Release): void;

  hasRelease(): boolean;
  clearRelease(): void;
  getRelease(): Release | undefined;
  setRelease(value?: Release): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppReleaseEvent.AsObject;
  static toObject(includeInstance: boolean, msg: AppReleaseEvent): AppReleaseEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppReleaseEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppReleaseEvent;
  static deserializeBinaryFromReader(message: AppReleaseEvent, reader: jspb.BinaryReader): AppReleaseEvent;
}

export namespace AppReleaseEvent {
  export type AsObject = {
    prevRelease?: Release.AsObject,
    release?: Release.AsObject,
  }
}

export class DeploymentEvent extends jspb.Message {
  hasDeployment(): boolean;
  clearDeployment(): void;
  getDeployment(): Deployment | undefined;
  setDeployment(value?: Deployment): void;

  getJobType(): string;
  setJobType(value: string): void;

  getJobState(): DeploymentEvent.JobState;
  setJobState(value: DeploymentEvent.JobState): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeploymentEvent.AsObject;
  static toObject(includeInstance: boolean, msg: DeploymentEvent): DeploymentEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeploymentEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeploymentEvent;
  static deserializeBinaryFromReader(message: DeploymentEvent, reader: jspb.BinaryReader): DeploymentEvent;
}

export namespace DeploymentEvent {
  export type AsObject = {
    deployment?: Deployment.AsObject,
    jobType: string,
    jobState: DeploymentEvent.JobState,
    error: string,
  }

  export enum JobState {
    PENDING = 0,
    BLOCKED = 1,
    STARTING = 2,
    UP = 3,
    STOPPING = 5,
    DOWN = 6,
    CRASHED = 7,
    FAILED = 8,
  }
}

export class ScaleRequestEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ScaleRequestEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ScaleRequestEvent): ScaleRequestEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ScaleRequestEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ScaleRequestEvent;
  static deserializeBinaryFromReader(message: ScaleRequestEvent, reader: jspb.BinaryReader): ScaleRequestEvent;
}

export namespace ScaleRequestEvent {
  export type AsObject = {
  }
}

export class ReleaseDeletionEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReleaseDeletionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ReleaseDeletionEvent): ReleaseDeletionEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReleaseDeletionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReleaseDeletionEvent;
  static deserializeBinaryFromReader(message: ReleaseDeletionEvent, reader: jspb.BinaryReader): ReleaseDeletionEvent;
}

export namespace ReleaseDeletionEvent {
  export type AsObject = {
  }
}

export class ArtifactEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ArtifactEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ArtifactEvent): ArtifactEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ArtifactEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ArtifactEvent;
  static deserializeBinaryFromReader(message: ArtifactEvent, reader: jspb.BinaryReader): ArtifactEvent;
}

export namespace ArtifactEvent {
  export type AsObject = {
  }
}

export class ProviderEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProviderEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ProviderEvent): ProviderEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProviderEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProviderEvent;
  static deserializeBinaryFromReader(message: ProviderEvent, reader: jspb.BinaryReader): ProviderEvent;
}

export namespace ProviderEvent {
  export type AsObject = {
  }
}

export class ResourceDeletionEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResourceDeletionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ResourceDeletionEvent): ResourceDeletionEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ResourceDeletionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResourceDeletionEvent;
  static deserializeBinaryFromReader(message: ResourceDeletionEvent, reader: jspb.BinaryReader): ResourceDeletionEvent;
}

export namespace ResourceDeletionEvent {
  export type AsObject = {
  }
}

export class ResourceAppDeletionEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResourceAppDeletionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ResourceAppDeletionEvent): ResourceAppDeletionEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ResourceAppDeletionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResourceAppDeletionEvent;
  static deserializeBinaryFromReader(message: ResourceAppDeletionEvent, reader: jspb.BinaryReader): ResourceAppDeletionEvent;
}

export namespace ResourceAppDeletionEvent {
  export type AsObject = {
  }
}

export class RouteDeletionEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RouteDeletionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: RouteDeletionEvent): RouteDeletionEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RouteDeletionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RouteDeletionEvent;
  static deserializeBinaryFromReader(message: RouteDeletionEvent, reader: jspb.BinaryReader): RouteDeletionEvent;
}

export namespace RouteDeletionEvent {
  export type AsObject = {
  }
}

export class DomainMigrationEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DomainMigrationEvent.AsObject;
  static toObject(includeInstance: boolean, msg: DomainMigrationEvent): DomainMigrationEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DomainMigrationEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DomainMigrationEvent;
  static deserializeBinaryFromReader(message: DomainMigrationEvent, reader: jspb.BinaryReader): DomainMigrationEvent;
}

export namespace DomainMigrationEvent {
  export type AsObject = {
  }
}

export class ClusterBackupEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClusterBackupEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ClusterBackupEvent): ClusterBackupEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClusterBackupEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClusterBackupEvent;
  static deserializeBinaryFromReader(message: ClusterBackupEvent, reader: jspb.BinaryReader): ClusterBackupEvent;
}

export namespace ClusterBackupEvent {
  export type AsObject = {
  }
}

export class AppGarbageCollectionEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppGarbageCollectionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: AppGarbageCollectionEvent): AppGarbageCollectionEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppGarbageCollectionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppGarbageCollectionEvent;
  static deserializeBinaryFromReader(message: AppGarbageCollectionEvent, reader: jspb.BinaryReader): AppGarbageCollectionEvent;
}

export namespace AppGarbageCollectionEvent {
  export type AsObject = {
  }
}

export class SinkDeletionEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SinkDeletionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: SinkDeletionEvent): SinkDeletionEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SinkDeletionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SinkDeletionEvent;
  static deserializeBinaryFromReader(message: SinkDeletionEvent, reader: jspb.BinaryReader): SinkDeletionEvent;
}

export namespace SinkDeletionEvent {
  export type AsObject = {
  }
}

export class Sink extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Sink.AsObject;
  static toObject(includeInstance: boolean, msg: Sink): Sink.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Sink, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Sink;
  static deserializeBinaryFromReader(message: Sink, reader: jspb.BinaryReader): Sink;
}

export namespace Sink {
  export type AsObject = {
  }
}

export class Volume extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Volume.AsObject;
  static toObject(includeInstance: boolean, msg: Volume): Volume.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Volume, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Volume;
  static deserializeBinaryFromReader(message: Volume, reader: jspb.BinaryReader): Volume;
}

export namespace Volume {
  export type AsObject = {
  }
}

export class ProcessType extends jspb.Message {
  clearArgsList(): void;
  getArgsList(): Array<string>;
  setArgsList(value: Array<string>): void;
  addArgs(value: string, index?: number): string;

  getEnvMap(): jspb.Map<string, string>;
  clearEnvMap(): void;
  clearPortsList(): void;
  getPortsList(): Array<Port>;
  setPortsList(value: Array<Port>): void;
  addPorts(value?: Port, index?: number): Port;

  clearVolumesList(): void;
  getVolumesList(): Array<VolumeReq>;
  setVolumesList(value: Array<VolumeReq>): void;
  addVolumes(value?: VolumeReq, index?: number): VolumeReq;

  getOmni(): boolean;
  setOmni(value: boolean): void;

  getHostNetwork(): boolean;
  setHostNetwork(value: boolean): void;

  getHostPidNamespace(): boolean;
  setHostPidNamespace(value: boolean): void;

  getService(): string;
  setService(value: string): void;

  getResurrect(): boolean;
  setResurrect(value: boolean): void;

  getResourcesMap(): jspb.Map<string, HostResourceSpec>;
  clearResourcesMap(): void;
  clearMountsList(): void;
  getMountsList(): Array<HostMount>;
  setMountsList(value: Array<HostMount>): void;
  addMounts(value?: HostMount, index?: number): HostMount;

  clearLinuxCapabilitiesList(): void;
  getLinuxCapabilitiesList(): Array<string>;
  setLinuxCapabilitiesList(value: Array<string>): void;
  addLinuxCapabilities(value: string, index?: number): string;

  clearAllowedDevicesList(): void;
  getAllowedDevicesList(): Array<LibContainerDevice>;
  setAllowedDevicesList(value: Array<LibContainerDevice>): void;
  addAllowedDevices(value?: LibContainerDevice, index?: number): LibContainerDevice;

  getWriteableCgroups(): boolean;
  setWriteableCgroups(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProcessType.AsObject;
  static toObject(includeInstance: boolean, msg: ProcessType): ProcessType.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProcessType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProcessType;
  static deserializeBinaryFromReader(message: ProcessType, reader: jspb.BinaryReader): ProcessType;
}

export namespace ProcessType {
  export type AsObject = {
    argsList: Array<string>,
    envMap: Array<[string, string]>,
    portsList: Array<Port.AsObject>,
    volumesList: Array<VolumeReq.AsObject>,
    omni: boolean,
    hostNetwork: boolean,
    hostPidNamespace: boolean,
    service: string,
    resurrect: boolean,
    resourcesMap: Array<[string, HostResourceSpec.AsObject]>,
    mountsList: Array<HostMount.AsObject>,
    linuxCapabilitiesList: Array<string>,
    allowedDevicesList: Array<LibContainerDevice.AsObject>,
    writeableCgroups: boolean,
  }
}

export class Port extends jspb.Message {
  getPort(): number;
  setPort(value: number): void;

  getProto(): string;
  setProto(value: string): void;

  hasService(): boolean;
  clearService(): void;
  getService(): HostService | undefined;
  setService(value?: HostService): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Port.AsObject;
  static toObject(includeInstance: boolean, msg: Port): Port.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Port, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Port;
  static deserializeBinaryFromReader(message: Port, reader: jspb.BinaryReader): Port;
}

export namespace Port {
  export type AsObject = {
    port: number,
    proto: string,
    service?: HostService.AsObject,
  }
}

export class VolumeReq extends jspb.Message {
  getPath(): string;
  setPath(value: string): void;

  getDeleteOnStop(): boolean;
  setDeleteOnStop(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VolumeReq.AsObject;
  static toObject(includeInstance: boolean, msg: VolumeReq): VolumeReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VolumeReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VolumeReq;
  static deserializeBinaryFromReader(message: VolumeReq, reader: jspb.BinaryReader): VolumeReq;
}

export namespace VolumeReq {
  export type AsObject = {
    path: string,
    deleteOnStop: boolean,
  }
}

export class HostService extends jspb.Message {
  getDisplayName(): string;
  setDisplayName(value: string): void;

  getCreate(): boolean;
  setCreate(value: boolean): void;

  hasCheck(): boolean;
  clearCheck(): void;
  getCheck(): HostHealthCheck | undefined;
  setCheck(value?: HostHealthCheck): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostService.AsObject;
  static toObject(includeInstance: boolean, msg: HostService): HostService.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HostService, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HostService;
  static deserializeBinaryFromReader(message: HostService, reader: jspb.BinaryReader): HostService;
}

export namespace HostService {
  export type AsObject = {
    displayName: string,
    create: boolean,
    check?: HostHealthCheck.AsObject,
  }
}

export class HostHealthCheck extends jspb.Message {
  getType(): string;
  setType(value: string): void;

  hasInterval(): boolean;
  clearInterval(): void;
  getInterval(): google_protobuf_duration_pb.Duration | undefined;
  setInterval(value?: google_protobuf_duration_pb.Duration): void;

  getThreshold(): number;
  setThreshold(value: number): void;

  getKillDown(): boolean;
  setKillDown(value: boolean): void;

  hasStartTimeout(): boolean;
  clearStartTimeout(): void;
  getStartTimeout(): google_protobuf_duration_pb.Duration | undefined;
  setStartTimeout(value?: google_protobuf_duration_pb.Duration): void;

  getPath(): string;
  setPath(value: string): void;

  getHost(): string;
  setHost(value: string): void;

  getMatch(): string;
  setMatch(value: string): void;

  getStatus(): number;
  setStatus(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostHealthCheck.AsObject;
  static toObject(includeInstance: boolean, msg: HostHealthCheck): HostHealthCheck.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HostHealthCheck, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HostHealthCheck;
  static deserializeBinaryFromReader(message: HostHealthCheck, reader: jspb.BinaryReader): HostHealthCheck;
}

export namespace HostHealthCheck {
  export type AsObject = {
    type: string,
    interval?: google_protobuf_duration_pb.Duration.AsObject,
    threshold: number,
    killDown: boolean,
    startTimeout?: google_protobuf_duration_pb.Duration.AsObject,
    path: string,
    host: string,
    match: string,
    status: number,
  }
}

export class HostResourceSpec extends jspb.Message {
  getRequest(): number;
  setRequest(value: number): void;

  getLimit(): number;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostResourceSpec.AsObject;
  static toObject(includeInstance: boolean, msg: HostResourceSpec): HostResourceSpec.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HostResourceSpec, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HostResourceSpec;
  static deserializeBinaryFromReader(message: HostResourceSpec, reader: jspb.BinaryReader): HostResourceSpec;
}

export namespace HostResourceSpec {
  export type AsObject = {
    request: number,
    limit: number,
  }
}

export class HostMount extends jspb.Message {
  getLocation(): string;
  setLocation(value: string): void;

  getTarget(): string;
  setTarget(value: string): void;

  getWritable(): boolean;
  setWritable(value: boolean): void;

  getDevice(): string;
  setDevice(value: string): void;

  getData(): string;
  setData(value: string): void;

  getFlags(): number;
  setFlags(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostMount.AsObject;
  static toObject(includeInstance: boolean, msg: HostMount): HostMount.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HostMount, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HostMount;
  static deserializeBinaryFromReader(message: HostMount, reader: jspb.BinaryReader): HostMount;
}

export namespace HostMount {
  export type AsObject = {
    location: string,
    target: string,
    writable: boolean,
    device: string,
    data: string,
    flags: number,
  }
}

export class LibContainerDevice extends jspb.Message {
  getType(): number;
  setType(value: number): void;

  getPath(): string;
  setPath(value: string): void;

  getMajor(): number;
  setMajor(value: number): void;

  getMinor(): number;
  setMinor(value: number): void;

  getPermissions(): string;
  setPermissions(value: string): void;

  getFileMode(): number;
  setFileMode(value: number): void;

  getUid(): number;
  setUid(value: number): void;

  getGid(): number;
  setGid(value: number): void;

  getAllow(): boolean;
  setAllow(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LibContainerDevice.AsObject;
  static toObject(includeInstance: boolean, msg: LibContainerDevice): LibContainerDevice.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LibContainerDevice, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LibContainerDevice;
  static deserializeBinaryFromReader(message: LibContainerDevice, reader: jspb.BinaryReader): LibContainerDevice;
}

export namespace LibContainerDevice {
  export type AsObject = {
    type: number,
    path: string,
    major: number,
    minor: number,
    permissions: string,
    fileMode: number,
    uid: number,
    gid: number,
    allow: boolean,
  }
}

export class LogChunk extends jspb.Message {
  getHost(): string;
  setHost(value: string): void;

  getJob(): string;
  setJob(value: string): void;

  getMsg(): string;
  setMsg(value: string): void;

  getProcessType(): string;
  setProcessType(value: string): void;

  getSource(): LogAggregatorStreamSource;
  setSource(value: LogAggregatorStreamSource): void;

  getStream(): LogAggregatorStreamType;
  setStream(value: LogAggregatorStreamType): void;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogChunk.AsObject;
  static toObject(includeInstance: boolean, msg: LogChunk): LogChunk.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LogChunk, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogChunk;
  static deserializeBinaryFromReader(message: LogChunk, reader: jspb.BinaryReader): LogChunk;
}

export namespace LogChunk {
  export type AsObject = {
    host: string,
    job: string,
    msg: string,
    processType: string,
    source: LogAggregatorStreamSource,
    stream: LogAggregatorStreamType,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class LogAggregatorLogOpts extends jspb.Message {
  getFollow(): boolean;
  setFollow(value: boolean): void;

  getJob(): string;
  setJob(value: string): void;

  getLines(): number;
  setLines(value: number): void;

  getProcessType(): string;
  setProcessType(value: string): void;

  clearStreamTypesList(): void;
  getStreamTypesList(): Array<LogAggregatorStreamType>;
  setStreamTypesList(value: Array<LogAggregatorStreamType>): void;
  addStreamTypes(value: LogAggregatorStreamType, index?: number): LogAggregatorStreamType;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogAggregatorLogOpts.AsObject;
  static toObject(includeInstance: boolean, msg: LogAggregatorLogOpts): LogAggregatorLogOpts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LogAggregatorLogOpts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogAggregatorLogOpts;
  static deserializeBinaryFromReader(message: LogAggregatorLogOpts, reader: jspb.BinaryReader): LogAggregatorLogOpts;
}

export namespace LogAggregatorLogOpts {
  export type AsObject = {
    follow: boolean,
    job: string,
    lines: number,
    processType: string,
    streamTypesList: Array<LogAggregatorStreamType>,
  }
}

export enum DeploymentStatus {
  PENDING = 0,
  FAILED = 1,
  RUNNING = 2,
  COMPLETE = 3,
}

export enum LogAggregatorStreamType {
  STDOUT = 0,
  STDERR = 1,
  INIT = 2,
  UNKNOWN = 3,
}

export enum LogAggregatorStreamSource {
  APP = 0,
}

