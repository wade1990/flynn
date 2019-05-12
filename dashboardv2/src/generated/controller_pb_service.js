// package: controller
// file: controller.proto

var controller_pb = require("./controller_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Controller = (function () {
  function Controller() {}
  Controller.serviceName = "controller.Controller";
  return Controller;
}());

Controller.ListAppsStream = {
  methodName: "ListAppsStream",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.ListAppsRequest,
  responseType: controller_pb.ListAppsResponse
};

Controller.StreamApp = {
  methodName: "StreamApp",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.GetAppRequest,
  responseType: controller_pb.App
};

Controller.UpdateAppMeta = {
  methodName: "UpdateAppMeta",
  service: Controller,
  requestStream: false,
  responseStream: false,
  requestType: controller_pb.UpdateAppRequest,
  responseType: controller_pb.App
};

Controller.StreamAppRelease = {
  methodName: "StreamAppRelease",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.GetAppReleaseRequest,
  responseType: controller_pb.Release
};

Controller.CreateScale = {
  methodName: "CreateScale",
  service: Controller,
  requestStream: false,
  responseStream: false,
  requestType: controller_pb.CreateScaleRequest,
  responseType: controller_pb.ScaleRequest
};

Controller.ListScaleRequestsStream = {
  methodName: "ListScaleRequestsStream",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.ListScaleRequestsRequest,
  responseType: controller_pb.ListScaleRequestsResponse
};

Controller.StreamAppFormation = {
  methodName: "StreamAppFormation",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.GetAppFormationRequest,
  responseType: controller_pb.Formation
};

Controller.GetRelease = {
  methodName: "GetRelease",
  service: Controller,
  requestStream: false,
  responseStream: false,
  requestType: controller_pb.GetReleaseRequest,
  responseType: controller_pb.Release
};

Controller.StreamAppLog = {
  methodName: "StreamAppLog",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.StreamAppLogRequest,
  responseType: controller_pb.LogChunk
};

Controller.CreateRelease = {
  methodName: "CreateRelease",
  service: Controller,
  requestStream: false,
  responseStream: false,
  requestType: controller_pb.CreateReleaseRequest,
  responseType: controller_pb.Release
};

Controller.StreamDeployments = {
  methodName: "StreamDeployments",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.ListDeploymentsRequest,
  responseType: controller_pb.ListDeploymentsResponse
};

Controller.CreateDeployment = {
  methodName: "CreateDeployment",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.CreateDeploymentRequest,
  responseType: controller_pb.Event
};

exports.Controller = Controller;

function ControllerClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ControllerClient.prototype.listAppsStream = function listAppsStream(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.ListAppsStream, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

ControllerClient.prototype.streamApp = function streamApp(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.StreamApp, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

ControllerClient.prototype.updateAppMeta = function updateAppMeta(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Controller.UpdateAppMeta, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ControllerClient.prototype.streamAppRelease = function streamAppRelease(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.StreamAppRelease, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

ControllerClient.prototype.createScale = function createScale(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Controller.CreateScale, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ControllerClient.prototype.listScaleRequestsStream = function listScaleRequestsStream(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.ListScaleRequestsStream, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

ControllerClient.prototype.streamAppFormation = function streamAppFormation(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.StreamAppFormation, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

ControllerClient.prototype.getRelease = function getRelease(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Controller.GetRelease, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ControllerClient.prototype.streamAppLog = function streamAppLog(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.StreamAppLog, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

ControllerClient.prototype.createRelease = function createRelease(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Controller.CreateRelease, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

ControllerClient.prototype.streamDeployments = function streamDeployments(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.StreamDeployments, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

ControllerClient.prototype.createDeployment = function createDeployment(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.CreateDeployment, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

exports.ControllerClient = ControllerClient;

