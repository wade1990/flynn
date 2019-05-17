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

export class GetAppReleaseRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAppReleaseRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAppReleaseRequest): GetAppReleaseRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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
  clearScaleRequestsList(): void;
  getScaleRequestsList(): Array<ScaleRequest>;
  setScaleRequestsList(value: Array<ScaleRequest>): void;
  addScaleRequests(value?: ScaleRequest, index?: number): ScaleRequest;

  getNextPageToken(): string;
  setNextPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListScaleRequestsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListScaleRequestsResponse): ListScaleRequestsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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

export class GetAppFormationRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAppFormationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAppFormationRequest): GetAppFormationRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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
  clearDeploymentsList(): void;
  getDeploymentsList(): Array<ExpandedDeployment>;
  setDeploymentsList(value: Array<ExpandedDeployment>): void;
  addDeployments(value?: ExpandedDeployment, index?: number): ExpandedDeployment;

  getNextPageToken(): string;
  setNextPageToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListDeploymentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListDeploymentsResponse): ListDeploymentsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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

export class CreateDeploymentRequest extends jspb.Message {
  getParent(): string;
  setParent(value: string): void;

  getRelease(): string;
  setRelease(value: string): void;

  getRequestId(): string;
  setRequestId(value: string): void;

  hasScaleRequest(): boolean;
  clearScaleRequest(): void;
  getScaleRequest(): CreateScaleRequest | undefined;
  setScaleRequest(value?: CreateScaleRequest): void;

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
    scaleRequest?: CreateScaleRequest.AsObject,
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
  getType(): ReleaseType;
  setType(value: ReleaseType): void;

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
    type: ReleaseType,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
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
  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasUpdateTime(): boolean;
  clearUpdateTime(): void;
  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ScaleRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ScaleRequest): ScaleRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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

  getScaleRequest(): string;
  setScaleRequest(value: string): void;

  getState(): ScaleRequestState;
  setState(value: ScaleRequestState): void;

  getProcessesMap(): jspb.Map<string, number>;
  clearProcessesMap(): void;
  getTagsMap(): jspb.Map<string, DeploymentProcessTags>;
  clearTagsMap(): void;
  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasUpdateTime(): boolean;
  clearUpdateTime(): void;
  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Formation.AsObject;
  static toObject(includeInstance: boolean, msg: Formation): Formation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Formation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Formation;
  static deserializeBinaryFromReader(message: Formation, reader: jspb.BinaryReader): Formation;
}

export namespace Formation {
  export type AsObject = {
    parent: string,
    scaleRequest: string,
    state: ScaleRequestState,
    processesMap: Array<[string, number]>,
    tagsMap: Array<[string, DeploymentProcessTags.AsObject]>,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    updateTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
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

export class ExpandedDeployment extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  hasOldRelease(): boolean;
  clearOldRelease(): void;
  getOldRelease(): Release | undefined;
  setOldRelease(value?: Release): void;

  hasNewRelease(): boolean;
  clearNewRelease(): void;
  getNewRelease(): Release | undefined;
  setNewRelease(value?: Release): void;

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
  toObject(includeInstance?: boolean): ExpandedDeployment.AsObject;
  static toObject(includeInstance: boolean, msg: ExpandedDeployment): ExpandedDeployment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
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

export class DeploymentEvent extends jspb.Message {
  hasDeployment(): boolean;
  clearDeployment(): void;
  getDeployment(): Deployment | undefined;
  setDeployment(value?: Deployment): void;

  getJobType(): string;
  setJobType(value: string): void;

  getJobState(): DeploymentEvent.JobState;
  setJobState(value: DeploymentEvent.JobState): void;

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

export class Event extends jspb.Message {
  hasDeploymentEvent(): boolean;
  clearDeploymentEvent(): void;
  getDeploymentEvent(): DeploymentEvent | undefined;
  setDeploymentEvent(value?: DeploymentEvent): void;

  getError(): string;
  setError(value: string): void;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

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
    deploymentEvent?: DeploymentEvent.AsObject,
    error: string,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export enum ReleaseType {
  ANY = 0,
  CODE = 1,
  CONFIG = 2,
}

export enum ScaleRequestState {
  SCALE_PENDING = 0,
  SCALE_CANCELLED = 1,
  SCALE_COMPLETE = 2,
}

export enum LogAggregatorStreamSource {
  APP = 0,
}

export enum LogAggregatorStreamType {
  STDOUT = 0,
  STDERR = 1,
  INIT = 2,
  UNKNOWN = 3,
}

export enum DeploymentStatus {
  PENDING = 0,
  FAILED = 1,
  RUNNING = 2,
  COMPLETE = 3,
}

