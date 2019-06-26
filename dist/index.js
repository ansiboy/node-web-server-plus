"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
exports.startServer = server_1.startServer;
exports.formData = server_1.formData;
var attributes_1 = require("./attributes");
exports.controller = attributes_1.controller;
exports.action = attributes_1.action;
exports.register = attributes_1.register;
exports.createParameterDecorator = attributes_1.createParameterDecorator;
var action_results_1 = require("./action-results");
exports.ContentResult = action_results_1.ContentResult;
exports.RedirectResult = action_results_1.RedirectResult;
var controller_1 = require("./controller");
exports.Controller = controller_1.Controller;
//# sourceMappingURL=index.js.map