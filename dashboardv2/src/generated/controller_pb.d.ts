import * as jspb from "google-protobuf"

import * as google_api_annotations_pb from './google/api/annotations_pb';
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as google_protobuf_duration_pb from 'google-protobuf/google/protobuf/duration_pb';
import * as google_protobuf_field_mask_pb from 'google-protobuf/google/protobuf/field_mask_pb';

export class ListAppsRequest extends jspb.Message {
  getPageSize(): number;
  setPageSize(value: number): void;

  getPageToken(): string;
  setPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAppsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListAppsRequest): ListAppsRequest.AsObject;
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
  getAppsList(): Array<App>;
  setAppsList(value: Array<App>): void;
  clearAppsList(): void;
  addApps(value?: App, index?: number): App;

  getNextPageToken(): string;
  setNextPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAppsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListAppsResponse): ListAppsResponse.AsObject;
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
  getApp(): App | undefined;
  setApp(value?: App): void;
  hasApp(): boolean;
  clearApp(): void;

  getUpdateMask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setUpdateMask(value?: google_protobuf_field_mask_pb.FieldMask): void;
  hasUpdateMask(): boolean;
  clearUpdateMask(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateAppRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateAppRequest): UpdateAppRequest.AsObject;
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

export class ListDeploymentsRequest extends jspb.Message {
  getPageSize(): number;
  setPageSize(value: number): void;

  getPageToken(): string;
  setPageToken(value: string): void;

  getParent(): string;
  setParent(value: string): void;

  getFilterType(): ReleaseType;
  setFilterType(value: ReleaseType): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListDeploymentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListDeploymentsRequest): ListDeploymentsRequest.AsObject;
  static serializeBinaryToWriter(message: ListDeploymentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListDeploymentsRequest;
  static deserializeBinaryFromReader(message: ListDeploymentsRequest, reader: jspb.BinaryReader): ListDeploymentsRequest;
}

export namespace ListDeploymentsRequest {
  export type AsObject = {
    pageSize: number,
    pageToken: string,
    parent: string,
    filterType: ReleaseType,
  }
}

export class ListDeploymentsResponse extends jspb.Message {
  getDeploymentsList(): Array<ExpandedDeployment>;
  setDeploymentsList(value: Array<ExpandedDeployment>): void;
  clearDeploymentsList(): void;
  addDeployments(value?: ExpandedDeployment, index?: number): ExpandedDeployment;

  getNextPageToken(): string;
  setNextPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListDeploymentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListDeploymentsResponse): ListDeploymentsResponse.AsObject;
  static serializeBinaryToWriter(message: ListDeploymentsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListDeploymentsResponse;
  static deserializeBinaryFromReader(message: ListDeploymentsResponse, reader: jspb.BinaryReader): ListDeploymentsResponse;
}

export namespace ListDeploymentsResponse {
  export type AsObject = {
    deploymentsList: Array<ExpandedDeployment.AsObject>,
    nextPageToken: string,
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

  getFilterType(): ReleaseType;
  setFilterType(value: ReleaseType): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListReleasesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListReleasesRequest): ListReleasesRequest.AsObject;
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
    filterType: ReleaseType,
  }
}

export class ListReleasesResponse extends jspb.Message {
  getReleasesList(): Array<Release>;
  setReleasesList(value: Array<Release>): void;
  clearReleasesList(): void;
  addReleases(value?: Release, index?: number): Release;

  getNextPageToken(): string;
  setNextPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListReleasesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListReleasesResponse): ListReleasesResponse.AsObject;
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

export class GetAppReleaseRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAppReleaseRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAppReleaseRequest): GetAppReleaseRequest.AsObject;
  static serializeBinaryToWriter(message: GetAppReleaseRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAppReleaseRequest;
  static deserializeBinaryFromReader(message: GetAppReleaseRequest, reader: jspb.BinaryReader): GetAppReleaseRequest;
}

export namespace GetAppReleaseRequest {
  export type AsObject = {
    parent: string,
  }
}

export class CreateScaleRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  getProcessesMap(): jspb.Map<string, number>;
  clearProcessesMap(): void;

  getTagsMap(): jspb.Map<string, DeploymentProcessTags>;
  clearTagsMap(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateScaleRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateScaleRequest): CreateScaleRequest.AsObject;
  static serializeBinaryToWriter(message: CreateScaleRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateScaleRequest;
  static deserializeBinaryFromReader(message: CreateScaleRequest, reader: jspb.BinaryReader): CreateScaleRequest;
}

export namespace CreateScaleRequest {
  export type AsObject = {
    parent: string,
    processesMap: Array<[string, number]>,
    tagsMap: Array<[string, DeploymentProcessTags.AsObject]>,
  }
}

export class ListScaleRequestsRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListScaleRequestsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListScaleRequestsRequest): ListScaleRequestsRequest.AsObject;
  static serializeBinaryToWriter(message: ListScaleRequestsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListScaleRequestsRequest;
  static deserializeBinaryFromReader(message: ListScaleRequestsRequest, reader: jspb.BinaryReader): ListScaleRequestsRequest;
}

export namespace ListScaleRequestsRequest {
  export type AsObject = {
    parent: string,
  }
}

export class ListScaleRequestsResponse extends jspb.Message {
  getScaleRequestsList(): Array<ScaleRequest>;
  setScaleRequestsList(value: Array<ScaleRequest>): void;
  clearScaleRequestsList(): void;
  addScaleRequests(value?: ScaleRequest, index?: number): ScaleRequest;

  getNextPageToken(): string;
  setNextPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListScaleRequestsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListScaleRequestsResponse): ListScaleRequestsResponse.AsObject;
  static serializeBinaryToWriter(message: ListScaleRequestsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListScaleRequestsResponse;
  static deserializeBinaryFromReader(message: ListScaleRequestsResponse, reader: jspb.BinaryReader): ListScaleRequestsResponse;
}

export namespace ListScaleRequestsResponse {
  export type AsObject = {
    scaleRequestsList: Array<ScaleRequest.AsObject>,
    nextPageToken: string,
  }
}

export class ScaleRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  getName(): string;
  setName(value: string): void;

  getState(): ScaleRequestState;
  setState(value: ScaleRequestState): void;

  getOldProcessesMap(): jspb.Map<string, number>;
  clearOldProcessesMap(): void;

  getNewProcessesMap(): jspb.Map<string, number>;
  clearNewProcessesMap(): void;

  getOldTagsMap(): jspb.Map<string, DeploymentProcessTags>;
  clearOldTagsMap(): void;

  getNewTagsMap(): jspb.Map<string, DeploymentProcessTags>;
  clearNewTagsMap(): void;

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasUpdateTime(): boolean;
  clearUpdateTime(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ScaleRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ScaleRequest): ScaleRequest.AsObject;
  static serializeBinaryToWriter(message: ScaleRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ScaleRequest;
  static deserializeBinaryFromReader(message: ScaleRequest, reader: jspb.BinaryReader): ScaleRequest;
}

export namespace ScaleRequest {
  export type AsObject = {
    parent: string,
    name: string,
    state: ScaleRequestState,
    oldProcessesMap: Array<[string, number]>,
    newProcessesMap: Array<[string, number]>,
    oldTagsMap: Array<[string, DeploymentProcessTags.AsObject]>,
    newTagsMap: Array<[string, DeploymentProcessTags.AsObject]>,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    updateTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class Formation extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  getState(): ScaleRequestState;
  setState(value: ScaleRequestState): void;

  getProcessesMap(): jspb.Map<string, number>;
  clearProcessesMap(): void;

  getTagsMap(): jspb.Map<string, DeploymentProcessTags>;
  clearTagsMap(): void;

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasUpdateTime(): boolean;
  clearUpdateTime(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Formation.AsObject;
  static toObject(includeInstance: boolean, msg: Formation): Formation.AsObject;
  static serializeBinaryToWriter(message: Formation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Formation;
  static deserializeBinaryFromReader(message: Formation, reader: jspb.BinaryReader): Formation;
}

export namespace Formation {
  export type AsObject = {
    parent: string,
    state: ScaleRequestState,
    processesMap: Array<[string, number]>,
    tagsMap: Array<[string, DeploymentProcessTags.AsObject]>,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    updateTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class GetAppFormationRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAppFormationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAppFormationRequest): GetAppFormationRequest.AsObject;
  static serializeBinaryToWriter(message: GetAppFormationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAppFormationRequest;
  static deserializeBinaryFromReader(message: GetAppFormationRequest, reader: jspb.BinaryReader): GetAppFormationRequest;
}

export namespace GetAppFormationRequest {
  export type AsObject = {
    parent: string,
  }
}

export class GetReleaseRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetReleaseRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetReleaseRequest): GetReleaseRequest.AsObject;
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

  getOpts(): LogAggregatorLogOpts | undefined;
  setOpts(value?: LogAggregatorLogOpts): void;
  hasOpts(): boolean;
  clearOpts(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamAppLogRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamAppLogRequest): StreamAppLogRequest.AsObject;
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

  getRelease(): Release | undefined;
  setRelease(value?: Release): void;
  hasRelease(): boolean;
  clearRelease(): void;

  getRequestId(): string;
  setRequestId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateReleaseRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateReleaseRequest): CreateReleaseRequest.AsObject;
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

  getScaleRequest(): CreateScaleRequest | undefined;
  setScaleRequest(value?: CreateScaleRequest): void;
  hasScaleRequest(): boolean;
  clearScaleRequest(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateDeploymentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateDeploymentRequest): CreateDeploymentRequest.AsObject;
  static serializeBinaryToWriter(message: CreateDeploymentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateDeploymentRequest;
  static deserializeBinaryFromReader(message: CreateDeploymentRequest, reader: jspb.BinaryReader): CreateDeploymentRequest;
}

export namespace CreateDeploymentRequest {
  export type AsObject = {
    parent: string,
    release: string,
    requestId: string,
    scaleRequest?: CreateScaleRequest.AsObject,
  }
}

export class StreamEventsRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  getObjectTypesList(): Array<string>;
  setObjectTypesList(value: Array<string>): void;
  clearObjectTypesList(): void;
  addObjectTypes(value: string, index?: number): void;

  getName(): string;
  setName(value: string): void;

  getPast(): boolean;
  setPast(value: boolean): void;

  getCount(): number;
  setCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamEventsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamEventsRequest): StreamEventsRequest.AsObject;
  static serializeBinaryToWriter(message: StreamEventsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamEventsRequest;
  static deserializeBinaryFromReader(message: StreamEventsRequest, reader: jspb.BinaryReader): StreamEventsRequest;
}

export namespace StreamEventsRequest {
  export type AsObject = {
    parent: string,
    objectTypesList: Array<string>,
    name: string,
    past: boolean,
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

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasUpdateTime(): boolean;
  clearUpdateTime(): void;

  getDeployTimeout(): number;
  setDeployTimeout(value: number): void;

  getStrategy(): string;
  setStrategy(value: string): void;

  getRelease(): string;
  setRelease(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): App.AsObject;
  static toObject(includeInstance: boolean, msg: App): App.AsObject;
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

  getArtifactsList(): Array<string>;
  setArtifactsList(value: Array<string>): void;
  clearArtifactsList(): void;
  addArtifacts(value: string, index?: number): void;

  getEnvMap(): jspb.Map<string, string>;
  clearEnvMap(): void;

  getLabelsMap(): jspb.Map<string, string>;
  clearLabelsMap(): void;

  getProcessesMap(): jspb.Map<string, ProcessType>;
  clearProcessesMap(): void;

  getType(): ReleaseType;
  setType(value: ReleaseType): void;

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Release.AsObject;
  static toObject(includeInstance: boolean, msg: Release): Release.AsObject;
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
    type: ReleaseType,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class AppRelease extends jspb.Message {
  getPrevRelease(): Release | undefined;
  setPrevRelease(value?: Release): void;
  hasPrevRelease(): boolean;
  clearPrevRelease(): void;

  getRelease(): Release | undefined;
  setRelease(value?: Release): void;
  hasRelease(): boolean;
  clearRelease(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppRelease.AsObject;
  static toObject(includeInstance: boolean, msg: AppRelease): AppRelease.AsObject;
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

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  getExpireTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpireTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasExpireTime(): boolean;
  clearExpireTime(): void;

  getEndTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setEndTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasEndTime(): boolean;
  clearEndTime(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Deployment.AsObject;
  static toObject(includeInstance: boolean, msg: Deployment): Deployment.AsObject;
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

export class ExpandedDeployment extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getOldRelease(): Release | undefined;
  setOldRelease(value?: Release): void;
  hasOldRelease(): boolean;
  clearOldRelease(): void;

  getNewRelease(): Release | undefined;
  setNewRelease(value?: Release): void;
  hasNewRelease(): boolean;
  clearNewRelease(): void;

  getType(): ReleaseType;
  setType(value: ReleaseType): void;

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

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  getExpireTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpireTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasExpireTime(): boolean;
  clearExpireTime(): void;

  getEndTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setEndTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasEndTime(): boolean;
  clearEndTime(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExpandedDeployment.AsObject;
  static toObject(includeInstance: boolean, msg: ExpandedDeployment): ExpandedDeployment.AsObject;
  static serializeBinaryToWriter(message: ExpandedDeployment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExpandedDeployment;
  static deserializeBinaryFromReader(message: ExpandedDeployment, reader: jspb.BinaryReader): ExpandedDeployment;
}

export namespace ExpandedDeployment {
  export type AsObject = {
    name: string,
    oldRelease?: Release.AsObject,
    newRelease?: Release.AsObject,
    type: ReleaseType,
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

  getRoutesList(): Array<string>;
  setRoutesList(value: Array<string>): void;
  clearRoutesList(): void;
  addRoutes(value: string, index?: number): void;

  getCert(): string;
  setCert(value: string): void;

  getKey(): string;
  setKey(value: string): void;

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasUpdateTime(): boolean;
  clearUpdateTime(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Certificate.AsObject;
  static toObject(includeInstance: boolean, msg: Certificate): Certificate.AsObject;
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

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasUpdateTime(): boolean;
  clearUpdateTime(): void;

  getDomain(): string;
  setDomain(value: string): void;

  getCertificate(): Certificate | undefined;
  setCertificate(value?: Certificate): void;
  hasCertificate(): boolean;
  clearCertificate(): void;

  getSticky(): boolean;
  setSticky(value: boolean): void;

  getPath(): string;
  setPath(value: string): void;

  getDrainBackends(): boolean;
  setDrainBackends(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Route.AsObject;
  static toObject(includeInstance: boolean, msg: Route): Route.AsObject;
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

  getAppsList(): Array<string>;
  setAppsList(value: Array<string>): void;
  clearAppsList(): void;
  addApps(value: string, index?: number): void;

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Resource.AsObject;
  static toObject(includeInstance: boolean, msg: Resource): Resource.AsObject;
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

  getType(): string;
  setType(value: string): void;

  getError(): string;
  setError(value: string): void;

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  getApp(): App | undefined;
  setApp(value?: App): void;
  hasApp(): boolean;
  clearApp(): void;

  getAppDeletion(): AppDeletion | undefined;
  setAppDeletion(value?: AppDeletion): void;
  hasAppDeletion(): boolean;
  clearAppDeletion(): void;

  getAppRelease(): AppRelease | undefined;
  setAppRelease(value?: AppRelease): void;
  hasAppRelease(): boolean;
  clearAppRelease(): void;

  getDeploymentEvent(): DeploymentEvent | undefined;
  setDeploymentEvent(value?: DeploymentEvent): void;
  hasDeploymentEvent(): boolean;
  clearDeploymentEvent(): void;

  getJob(): Job | undefined;
  setJob(value?: Job): void;
  hasJob(): boolean;
  clearJob(): void;

  getScaleRequest(): ScaleRequest | undefined;
  setScaleRequest(value?: ScaleRequest): void;
  hasScaleRequest(): boolean;
  clearScaleRequest(): void;

  getRelease(): Release | undefined;
  setRelease(value?: Release): void;
  hasRelease(): boolean;
  clearRelease(): void;

  getReleaseDeletion(): ReleaseDeletion | undefined;
  setReleaseDeletion(value?: ReleaseDeletion): void;
  hasReleaseDeletion(): boolean;
  clearReleaseDeletion(): void;

  getArtifact(): Artifact | undefined;
  setArtifact(value?: Artifact): void;
  hasArtifact(): boolean;
  clearArtifact(): void;

  getProvider(): Provider | undefined;
  setProvider(value?: Provider): void;
  hasProvider(): boolean;
  clearProvider(): void;

  getResource(): Resource | undefined;
  setResource(value?: Resource): void;
  hasResource(): boolean;
  clearResource(): void;

  getResourceDeletion(): ResourceDeletion | undefined;
  setResourceDeletion(value?: ResourceDeletion): void;
  hasResourceDeletion(): boolean;
  clearResourceDeletion(): void;

  getResourceAppDeletion(): ResourceAppDeletion | undefined;
  setResourceAppDeletion(value?: ResourceAppDeletion): void;
  hasResourceAppDeletion(): boolean;
  clearResourceAppDeletion(): void;

  getRoute(): Route | undefined;
  setRoute(value?: Route): void;
  hasRoute(): boolean;
  clearRoute(): void;

  getRouteDeletion(): RouteDeletion | undefined;
  setRouteDeletion(value?: RouteDeletion): void;
  hasRouteDeletion(): boolean;
  clearRouteDeletion(): void;

  getDomainMigration(): DomainMigration | undefined;
  setDomainMigration(value?: DomainMigration): void;
  hasDomainMigration(): boolean;
  clearDomainMigration(): void;

  getClusterBackup(): ClusterBackup | undefined;
  setClusterBackup(value?: ClusterBackup): void;
  hasClusterBackup(): boolean;
  clearClusterBackup(): void;

  getAppGarbageCollection(): AppGarbageCollection | undefined;
  setAppGarbageCollection(value?: AppGarbageCollection): void;
  hasAppGarbageCollection(): boolean;
  clearAppGarbageCollection(): void;

  getSink(): Sink | undefined;
  setSink(value?: Sink): void;
  hasSink(): boolean;
  clearSink(): void;

  getSinkDeletion(): SinkDeletion | undefined;
  setSinkDeletion(value?: SinkDeletion): void;
  hasSinkDeletion(): boolean;
  clearSinkDeletion(): void;

  getVolume(): Volume | undefined;
  setVolume(value?: Volume): void;
  hasVolume(): boolean;
  clearVolume(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Event.AsObject;
  static toObject(includeInstance: boolean, msg: Event): Event.AsObject;
  static serializeBinaryToWriter(message: Event, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Event;
  static deserializeBinaryFromReader(message: Event, reader: jspb.BinaryReader): Event;
}

export namespace Event {
  export type AsObject = {
    name: string,
    parent: string,
    type: string,
    error: string,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    app?: App.AsObject,
    appDeletion?: AppDeletion.AsObject,
    appRelease?: AppRelease.AsObject,
    deploymentEvent?: DeploymentEvent.AsObject,
    job?: Job.AsObject,
    scaleRequest?: ScaleRequest.AsObject,
    release?: Release.AsObject,
    releaseDeletion?: ReleaseDeletion.AsObject,
    artifact?: Artifact.AsObject,
    provider?: Provider.AsObject,
    resource?: Resource.AsObject,
    resourceDeletion?: ResourceDeletion.AsObject,
    resourceAppDeletion?: ResourceAppDeletion.AsObject,
    route?: Route.AsObject,
    routeDeletion?: RouteDeletion.AsObject,
    domainMigration?: DomainMigration.AsObject,
    clusterBackup?: ClusterBackup.AsObject,
    appGarbageCollection?: AppGarbageCollection.AsObject,
    sink?: Sink.AsObject,
    sinkDeletion?: SinkDeletion.AsObject,
    volume?: Volume.AsObject,
  }
}

export class AppDeletion extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getDeletedRoutesList(): Array<Route>;
  setDeletedRoutesList(value: Array<Route>): void;
  clearDeletedRoutesList(): void;
  addDeletedRoutes(value?: Route, index?: number): Route;

  getDeletedResourcesList(): Array<Resource>;
  setDeletedResourcesList(value: Array<Resource>): void;
  clearDeletedResourcesList(): void;
  addDeletedResources(value?: Resource, index?: number): Resource;

  getDeletedReleasesList(): Array<Release>;
  setDeletedReleasesList(value: Array<Release>): void;
  clearDeletedReleasesList(): void;
  addDeletedReleases(value?: Release, index?: number): Release;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppDeletion.AsObject;
  static toObject(includeInstance: boolean, msg: AppDeletion): AppDeletion.AsObject;
  static serializeBinaryToWriter(message: AppDeletion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppDeletion;
  static deserializeBinaryFromReader(message: AppDeletion, reader: jspb.BinaryReader): AppDeletion;
}

export namespace AppDeletion {
  export type AsObject = {
    name: string,
    deletedRoutesList: Array<Route.AsObject>,
    deletedResourcesList: Array<Resource.AsObject>,
    deletedReleasesList: Array<Release.AsObject>,
  }
}

export class DeploymentEvent extends jspb.Message {
  getDeployment(): Deployment | undefined;
  setDeployment(value?: Deployment): void;
  hasDeployment(): boolean;
  clearDeployment(): void;

  getJobType(): string;
  setJobType(value: string): void;

  getJobState(): DeploymentEvent.JobState;
  setJobState(value: DeploymentEvent.JobState): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeploymentEvent.AsObject;
  static toObject(includeInstance: boolean, msg: DeploymentEvent): DeploymentEvent.AsObject;
  static serializeBinaryToWriter(message: DeploymentEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeploymentEvent;
  static deserializeBinaryFromReader(message: DeploymentEvent, reader: jspb.BinaryReader): DeploymentEvent;
}

export namespace DeploymentEvent {
  export type AsObject = {
    deployment?: Deployment.AsObject,
    jobType: string,
    jobState: DeploymentEvent.JobState,
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

export class ReleaseDeletion extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReleaseDeletion.AsObject;
  static toObject(includeInstance: boolean, msg: ReleaseDeletion): ReleaseDeletion.AsObject;
  static serializeBinaryToWriter(message: ReleaseDeletion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReleaseDeletion;
  static deserializeBinaryFromReader(message: ReleaseDeletion, reader: jspb.BinaryReader): ReleaseDeletion;
}

export namespace ReleaseDeletion {
  export type AsObject = {
  }
}

export class Artifact extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Artifact.AsObject;
  static toObject(includeInstance: boolean, msg: Artifact): Artifact.AsObject;
  static serializeBinaryToWriter(message: Artifact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Artifact;
  static deserializeBinaryFromReader(message: Artifact, reader: jspb.BinaryReader): Artifact;
}

export namespace Artifact {
  export type AsObject = {
  }
}

export class Provider extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Provider.AsObject;
  static toObject(includeInstance: boolean, msg: Provider): Provider.AsObject;
  static serializeBinaryToWriter(message: Provider, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Provider;
  static deserializeBinaryFromReader(message: Provider, reader: jspb.BinaryReader): Provider;
}

export namespace Provider {
  export type AsObject = {
  }
}

export class ResourceDeletion extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResourceDeletion.AsObject;
  static toObject(includeInstance: boolean, msg: ResourceDeletion): ResourceDeletion.AsObject;
  static serializeBinaryToWriter(message: ResourceDeletion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResourceDeletion;
  static deserializeBinaryFromReader(message: ResourceDeletion, reader: jspb.BinaryReader): ResourceDeletion;
}

export namespace ResourceDeletion {
  export type AsObject = {
  }
}

export class ResourceAppDeletion extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResourceAppDeletion.AsObject;
  static toObject(includeInstance: boolean, msg: ResourceAppDeletion): ResourceAppDeletion.AsObject;
  static serializeBinaryToWriter(message: ResourceAppDeletion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResourceAppDeletion;
  static deserializeBinaryFromReader(message: ResourceAppDeletion, reader: jspb.BinaryReader): ResourceAppDeletion;
}

export namespace ResourceAppDeletion {
  export type AsObject = {
  }
}

export class RouteDeletion extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RouteDeletion.AsObject;
  static toObject(includeInstance: boolean, msg: RouteDeletion): RouteDeletion.AsObject;
  static serializeBinaryToWriter(message: RouteDeletion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RouteDeletion;
  static deserializeBinaryFromReader(message: RouteDeletion, reader: jspb.BinaryReader): RouteDeletion;
}

export namespace RouteDeletion {
  export type AsObject = {
  }
}

export class DomainMigration extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DomainMigration.AsObject;
  static toObject(includeInstance: boolean, msg: DomainMigration): DomainMigration.AsObject;
  static serializeBinaryToWriter(message: DomainMigration, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DomainMigration;
  static deserializeBinaryFromReader(message: DomainMigration, reader: jspb.BinaryReader): DomainMigration;
}

export namespace DomainMigration {
  export type AsObject = {
  }
}

export class ClusterBackup extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClusterBackup.AsObject;
  static toObject(includeInstance: boolean, msg: ClusterBackup): ClusterBackup.AsObject;
  static serializeBinaryToWriter(message: ClusterBackup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClusterBackup;
  static deserializeBinaryFromReader(message: ClusterBackup, reader: jspb.BinaryReader): ClusterBackup;
}

export namespace ClusterBackup {
  export type AsObject = {
  }
}

export class AppGarbageCollection extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppGarbageCollection.AsObject;
  static toObject(includeInstance: boolean, msg: AppGarbageCollection): AppGarbageCollection.AsObject;
  static serializeBinaryToWriter(message: AppGarbageCollection, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppGarbageCollection;
  static deserializeBinaryFromReader(message: AppGarbageCollection, reader: jspb.BinaryReader): AppGarbageCollection;
}

export namespace AppGarbageCollection {
  export type AsObject = {
  }
}

export class SinkDeletion extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SinkDeletion.AsObject;
  static toObject(includeInstance: boolean, msg: SinkDeletion): SinkDeletion.AsObject;
  static serializeBinaryToWriter(message: SinkDeletion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SinkDeletion;
  static deserializeBinaryFromReader(message: SinkDeletion, reader: jspb.BinaryReader): SinkDeletion;
}

export namespace SinkDeletion {
  export type AsObject = {
  }
}

export class Sink extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Sink.AsObject;
  static toObject(includeInstance: boolean, msg: Sink): Sink.AsObject;
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
  static serializeBinaryToWriter(message: Volume, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Volume;
  static deserializeBinaryFromReader(message: Volume, reader: jspb.BinaryReader): Volume;
}

export namespace Volume {
  export type AsObject = {
  }
}

export class ProcessType extends jspb.Message {
  getArgsList(): Array<string>;
  setArgsList(value: Array<string>): void;
  clearArgsList(): void;
  addArgs(value: string, index?: number): void;

  getEnvMap(): jspb.Map<string, string>;
  clearEnvMap(): void;

  getPortsList(): Array<Port>;
  setPortsList(value: Array<Port>): void;
  clearPortsList(): void;
  addPorts(value?: Port, index?: number): Port;

  getVolumesList(): Array<VolumeReq>;
  setVolumesList(value: Array<VolumeReq>): void;
  clearVolumesList(): void;
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

  getMountsList(): Array<HostMount>;
  setMountsList(value: Array<HostMount>): void;
  clearMountsList(): void;
  addMounts(value?: HostMount, index?: number): HostMount;

  getLinuxCapabilitiesList(): Array<string>;
  setLinuxCapabilitiesList(value: Array<string>): void;
  clearLinuxCapabilitiesList(): void;
  addLinuxCapabilities(value: string, index?: number): void;

  getAllowedDevicesList(): Array<LibContainerDevice>;
  setAllowedDevicesList(value: Array<LibContainerDevice>): void;
  clearAllowedDevicesList(): void;
  addAllowedDevices(value?: LibContainerDevice, index?: number): LibContainerDevice;

  getWriteableCgroups(): boolean;
  setWriteableCgroups(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProcessType.AsObject;
  static toObject(includeInstance: boolean, msg: ProcessType): ProcessType.AsObject;
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

  getService(): HostService | undefined;
  setService(value?: HostService): void;
  hasService(): boolean;
  clearService(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Port.AsObject;
  static toObject(includeInstance: boolean, msg: Port): Port.AsObject;
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

  getCheck(): HostHealthCheck | undefined;
  setCheck(value?: HostHealthCheck): void;
  hasCheck(): boolean;
  clearCheck(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostService.AsObject;
  static toObject(includeInstance: boolean, msg: HostService): HostService.AsObject;
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

  getInterval(): google_protobuf_duration_pb.Duration | undefined;
  setInterval(value?: google_protobuf_duration_pb.Duration): void;
  hasInterval(): boolean;
  clearInterval(): void;

  getThreshold(): number;
  setThreshold(value: number): void;

  getKillDown(): boolean;
  setKillDown(value: boolean): void;

  getStartTimeout(): google_protobuf_duration_pb.Duration | undefined;
  setStartTimeout(value?: google_protobuf_duration_pb.Duration): void;
  hasStartTimeout(): boolean;
  clearStartTimeout(): void;

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

  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogChunk.AsObject;
  static toObject(includeInstance: boolean, msg: LogChunk): LogChunk.AsObject;
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

  getStreamTypesList(): Array<LogAggregatorStreamType>;
  setStreamTypesList(value: Array<LogAggregatorStreamType>): void;
  clearStreamTypesList(): void;
  addStreamTypes(value: LogAggregatorStreamType, index?: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogAggregatorLogOpts.AsObject;
  static toObject(includeInstance: boolean, msg: LogAggregatorLogOpts): LogAggregatorLogOpts.AsObject;
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

export enum ScaleRequestState { 
  SCALE_PENDING = 0,
  SCALE_CANCELLED = 1,
  SCALE_COMPLETE = 2,
}
export enum ReleaseType { 
  ANY = 0,
  CODE = 1,
  CONFIG = 2,
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
