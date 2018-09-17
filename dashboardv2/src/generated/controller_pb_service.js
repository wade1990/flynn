// package: controller
// file: controller.proto

var controller_pb = require("./controller_pb");
var grpc = require("grpc-web-client").grpc;

var Controller = (function () {
  function Controller() {}
  Controller.serviceName = "controller.Controller";
  return Controller;
}());

Controller.ListApps = {
  methodName: "ListApps",
  service: Controller,
  requestStream: false,
  responseStream: false,
  requestType: controller_pb.ListAppsRequest,
  responseType: controller_pb.ListAppsResponse
};

Controller.GetApp = {
  methodName: "GetApp",
  service: Controller,
  requestStream: false,
  responseStream: false,
  requestType: controller_pb.GetAppRequest,
  responseType: controller_pb.App
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

Controller.CreateDeployment = {
  methodName: "CreateDeployment",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.CreateDeploymentRequest,
  responseType: controller_pb.Event
};

Controller.StreamEvents = {
  methodName: "StreamEvents",
  service: Controller,
  requestStream: false,
  responseStream: true,
  requestType: controller_pb.StreamEventsRequest,
  responseType: controller_pb.Event
};

exports.Controller = Controller;

function ControllerClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ControllerClient.prototype.listApps = function listApps(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  grpc.unary(Controller.ListApps, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          callback(Object.assign(new Error(response.statusMessage), { code: response.status, metadata: response.trailers }), null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
};

ControllerClient.prototype.getApp = function getApp(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  grpc.unary(Controller.GetApp, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          callback(Object.assign(new Error(response.statusMessage), { code: response.status, metadata: response.trailers }), null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
};

ControllerClient.prototype.getRelease = function getRelease(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  grpc.unary(Controller.GetRelease, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          callback(Object.assign(new Error(response.statusMessage), { code: response.status, metadata: response.trailers }), null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
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
  grpc.unary(Controller.CreateRelease, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          callback(Object.assign(new Error(response.statusMessage), { code: response.status, metadata: response.trailers }), null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
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

ControllerClient.prototype.streamEvents = function streamEvents(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Controller.StreamEvents, {
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

