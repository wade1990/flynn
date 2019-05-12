/**
 * @fileoverview gRPC-Web generated client stub for controller
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!



const grpc = {};
grpc.web = require('grpc-web');


var google_api_annotations_pb = require('./google/api/annotations_pb.js')

var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js')

var google_protobuf_duration_pb = require('google-protobuf/google/protobuf/duration_pb.js')

var google_protobuf_field_mask_pb = require('google-protobuf/google/protobuf/field_mask_pb.js')
const proto = {};
proto.controller = require('./controller_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.controller.ControllerClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.controller.ControllerPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.ListAppsRequest,
 *   !proto.controller.ListAppsResponse>}
 */
const methodInfo_Controller_ListApps = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.ListAppsResponse,
  /** @param {!proto.controller.ListAppsRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.ListAppsResponse.deserializeBinary
);


/**
 * @param {!proto.controller.ListAppsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.ListAppsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListAppsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.listApps =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/ListApps',
      request,
      metadata || {},
      methodInfo_Controller_ListApps,
      callback);
};


/**
 * @param {!proto.controller.ListAppsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.ListAppsResponse>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.listApps =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/ListApps',
      request,
      metadata || {},
      methodInfo_Controller_ListApps);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.ListAppsRequest,
 *   !proto.controller.ListAppsResponse>}
 */
const methodInfo_Controller_ListAppsStream = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.ListAppsResponse,
  /** @param {!proto.controller.ListAppsRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.ListAppsResponse.deserializeBinary
);


/**
 * @param {!proto.controller.ListAppsRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListAppsResponse>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.listAppsStream =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/ListAppsStream',
      request,
      metadata || {},
      methodInfo_Controller_ListAppsStream);
};


/**
 * @param {!proto.controller.ListAppsRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListAppsResponse>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.listAppsStream =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/ListAppsStream',
      request,
      metadata || {},
      methodInfo_Controller_ListAppsStream);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.GetAppRequest,
 *   !proto.controller.App>}
 */
const methodInfo_Controller_GetApp = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.App,
  /** @param {!proto.controller.GetAppRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.App.deserializeBinary
);


/**
 * @param {!proto.controller.GetAppRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.App)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.App>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.getApp =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/GetApp',
      request,
      metadata || {},
      methodInfo_Controller_GetApp,
      callback);
};


/**
 * @param {!proto.controller.GetAppRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.App>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.getApp =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/GetApp',
      request,
      metadata || {},
      methodInfo_Controller_GetApp);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.GetAppRequest,
 *   !proto.controller.App>}
 */
const methodInfo_Controller_StreamApp = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.App,
  /** @param {!proto.controller.GetAppRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.App.deserializeBinary
);


/**
 * @param {!proto.controller.GetAppRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.App>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.streamApp =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamApp',
      request,
      metadata || {},
      methodInfo_Controller_StreamApp);
};


/**
 * @param {!proto.controller.GetAppRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.App>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.streamApp =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamApp',
      request,
      metadata || {},
      methodInfo_Controller_StreamApp);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.UpdateAppRequest,
 *   !proto.controller.App>}
 */
const methodInfo_Controller_UpdateApp = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.App,
  /** @param {!proto.controller.UpdateAppRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.App.deserializeBinary
);


/**
 * @param {!proto.controller.UpdateAppRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.App)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.App>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.updateApp =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/UpdateApp',
      request,
      metadata || {},
      methodInfo_Controller_UpdateApp,
      callback);
};


/**
 * @param {!proto.controller.UpdateAppRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.App>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.updateApp =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/UpdateApp',
      request,
      metadata || {},
      methodInfo_Controller_UpdateApp);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.UpdateAppRequest,
 *   !proto.controller.App>}
 */
const methodInfo_Controller_UpdateAppMeta = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.App,
  /** @param {!proto.controller.UpdateAppRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.App.deserializeBinary
);


/**
 * @param {!proto.controller.UpdateAppRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.App)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.App>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.updateAppMeta =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/UpdateAppMeta',
      request,
      metadata || {},
      methodInfo_Controller_UpdateAppMeta,
      callback);
};


/**
 * @param {!proto.controller.UpdateAppRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.App>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.updateAppMeta =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/UpdateAppMeta',
      request,
      metadata || {},
      methodInfo_Controller_UpdateAppMeta);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.GetAppReleaseRequest,
 *   !proto.controller.Release>}
 */
const methodInfo_Controller_GetAppRelease = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.Release,
  /** @param {!proto.controller.GetAppReleaseRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.Release.deserializeBinary
);


/**
 * @param {!proto.controller.GetAppReleaseRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.Release)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Release>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.getAppRelease =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/GetAppRelease',
      request,
      metadata || {},
      methodInfo_Controller_GetAppRelease,
      callback);
};


/**
 * @param {!proto.controller.GetAppReleaseRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.Release>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.getAppRelease =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/GetAppRelease',
      request,
      metadata || {},
      methodInfo_Controller_GetAppRelease);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.GetAppReleaseRequest,
 *   !proto.controller.Release>}
 */
const methodInfo_Controller_StreamAppRelease = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.Release,
  /** @param {!proto.controller.GetAppReleaseRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.Release.deserializeBinary
);


/**
 * @param {!proto.controller.GetAppReleaseRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Release>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.streamAppRelease =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamAppRelease',
      request,
      metadata || {},
      methodInfo_Controller_StreamAppRelease);
};


/**
 * @param {!proto.controller.GetAppReleaseRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Release>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.streamAppRelease =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamAppRelease',
      request,
      metadata || {},
      methodInfo_Controller_StreamAppRelease);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.CreateScaleRequest,
 *   !proto.controller.ScaleRequest>}
 */
const methodInfo_Controller_CreateScale = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.ScaleRequest,
  /** @param {!proto.controller.CreateScaleRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.ScaleRequest.deserializeBinary
);


/**
 * @param {!proto.controller.CreateScaleRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.ScaleRequest)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ScaleRequest>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.createScale =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/CreateScale',
      request,
      metadata || {},
      methodInfo_Controller_CreateScale,
      callback);
};


/**
 * @param {!proto.controller.CreateScaleRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.ScaleRequest>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.createScale =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/CreateScale',
      request,
      metadata || {},
      methodInfo_Controller_CreateScale);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.ListScaleRequestsRequest,
 *   !proto.controller.ListScaleRequestsResponse>}
 */
const methodInfo_Controller_ListScaleRequestsStream = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.ListScaleRequestsResponse,
  /** @param {!proto.controller.ListScaleRequestsRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.ListScaleRequestsResponse.deserializeBinary
);


/**
 * @param {!proto.controller.ListScaleRequestsRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListScaleRequestsResponse>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.listScaleRequestsStream =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/ListScaleRequestsStream',
      request,
      metadata || {},
      methodInfo_Controller_ListScaleRequestsStream);
};


/**
 * @param {!proto.controller.ListScaleRequestsRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListScaleRequestsResponse>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.listScaleRequestsStream =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/ListScaleRequestsStream',
      request,
      metadata || {},
      methodInfo_Controller_ListScaleRequestsStream);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.GetAppFormationRequest,
 *   !proto.controller.Formation>}
 */
const methodInfo_Controller_StreamAppFormation = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.Formation,
  /** @param {!proto.controller.GetAppFormationRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.Formation.deserializeBinary
);


/**
 * @param {!proto.controller.GetAppFormationRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Formation>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.streamAppFormation =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamAppFormation',
      request,
      metadata || {},
      methodInfo_Controller_StreamAppFormation);
};


/**
 * @param {!proto.controller.GetAppFormationRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Formation>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.streamAppFormation =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamAppFormation',
      request,
      metadata || {},
      methodInfo_Controller_StreamAppFormation);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.GetReleaseRequest,
 *   !proto.controller.Release>}
 */
const methodInfo_Controller_GetRelease = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.Release,
  /** @param {!proto.controller.GetReleaseRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.Release.deserializeBinary
);


/**
 * @param {!proto.controller.GetReleaseRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.Release)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Release>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.getRelease =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/GetRelease',
      request,
      metadata || {},
      methodInfo_Controller_GetRelease,
      callback);
};


/**
 * @param {!proto.controller.GetReleaseRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.Release>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.getRelease =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/GetRelease',
      request,
      metadata || {},
      methodInfo_Controller_GetRelease);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.ListReleasesRequest,
 *   !proto.controller.ListReleasesResponse>}
 */
const methodInfo_Controller_ListReleases = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.ListReleasesResponse,
  /** @param {!proto.controller.ListReleasesRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.ListReleasesResponse.deserializeBinary
);


/**
 * @param {!proto.controller.ListReleasesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.ListReleasesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListReleasesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.listReleases =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/ListReleases',
      request,
      metadata || {},
      methodInfo_Controller_ListReleases,
      callback);
};


/**
 * @param {!proto.controller.ListReleasesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.ListReleasesResponse>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.listReleases =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/ListReleases',
      request,
      metadata || {},
      methodInfo_Controller_ListReleases);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.ListReleasesRequest,
 *   !proto.controller.ListReleasesResponse>}
 */
const methodInfo_Controller_ListReleasesStream = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.ListReleasesResponse,
  /** @param {!proto.controller.ListReleasesRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.ListReleasesResponse.deserializeBinary
);


/**
 * @param {!proto.controller.ListReleasesRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListReleasesResponse>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.listReleasesStream =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/ListReleasesStream',
      request,
      metadata || {},
      methodInfo_Controller_ListReleasesStream);
};


/**
 * @param {!proto.controller.ListReleasesRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListReleasesResponse>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.listReleasesStream =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/ListReleasesStream',
      request,
      metadata || {},
      methodInfo_Controller_ListReleasesStream);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.StreamAppLogRequest,
 *   !proto.controller.LogChunk>}
 */
const methodInfo_Controller_StreamAppLog = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.LogChunk,
  /** @param {!proto.controller.StreamAppLogRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.LogChunk.deserializeBinary
);


/**
 * @param {!proto.controller.StreamAppLogRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.LogChunk>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.streamAppLog =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamAppLog',
      request,
      metadata || {},
      methodInfo_Controller_StreamAppLog);
};


/**
 * @param {!proto.controller.StreamAppLogRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.LogChunk>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.streamAppLog =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamAppLog',
      request,
      metadata || {},
      methodInfo_Controller_StreamAppLog);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.CreateReleaseRequest,
 *   !proto.controller.Release>}
 */
const methodInfo_Controller_CreateRelease = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.Release,
  /** @param {!proto.controller.CreateReleaseRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.Release.deserializeBinary
);


/**
 * @param {!proto.controller.CreateReleaseRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.controller.Release)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Release>|undefined}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.createRelease =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/controller.Controller/CreateRelease',
      request,
      metadata || {},
      methodInfo_Controller_CreateRelease,
      callback);
};


/**
 * @param {!proto.controller.CreateReleaseRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.controller.Release>}
 *     A native promise that resolves to the response
 */
proto.controller.ControllerPromiseClient.prototype.createRelease =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/controller.Controller/CreateRelease',
      request,
      metadata || {},
      methodInfo_Controller_CreateRelease);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.ListDeploymentsRequest,
 *   !proto.controller.ListDeploymentsResponse>}
 */
const methodInfo_Controller_StreamDeployments = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.ListDeploymentsResponse,
  /** @param {!proto.controller.ListDeploymentsRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.ListDeploymentsResponse.deserializeBinary
);


/**
 * @param {!proto.controller.ListDeploymentsRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListDeploymentsResponse>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.streamDeployments =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamDeployments',
      request,
      metadata || {},
      methodInfo_Controller_StreamDeployments);
};


/**
 * @param {!proto.controller.ListDeploymentsRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.ListDeploymentsResponse>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.streamDeployments =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamDeployments',
      request,
      metadata || {},
      methodInfo_Controller_StreamDeployments);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.CreateDeploymentRequest,
 *   !proto.controller.Event>}
 */
const methodInfo_Controller_CreateDeployment = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.Event,
  /** @param {!proto.controller.CreateDeploymentRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.Event.deserializeBinary
);


/**
 * @param {!proto.controller.CreateDeploymentRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Event>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.createDeployment =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/CreateDeployment',
      request,
      metadata || {},
      methodInfo_Controller_CreateDeployment);
};


/**
 * @param {!proto.controller.CreateDeploymentRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Event>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.createDeployment =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/CreateDeployment',
      request,
      metadata || {},
      methodInfo_Controller_CreateDeployment);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.controller.StreamEventsRequest,
 *   !proto.controller.Event>}
 */
const methodInfo_Controller_StreamEvents = new grpc.web.AbstractClientBase.MethodInfo(
  proto.controller.Event,
  /** @param {!proto.controller.StreamEventsRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.controller.Event.deserializeBinary
);


/**
 * @param {!proto.controller.StreamEventsRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Event>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerClient.prototype.streamEvents =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamEvents',
      request,
      metadata || {},
      methodInfo_Controller_StreamEvents);
};


/**
 * @param {!proto.controller.StreamEventsRequest} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.controller.Event>}
 *     The XHR Node Readable Stream
 */
proto.controller.ControllerPromiseClient.prototype.streamEvents =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/controller.Controller/StreamEvents',
      request,
      metadata || {},
      methodInfo_Controller_StreamEvents);
};


module.exports = proto.controller;

