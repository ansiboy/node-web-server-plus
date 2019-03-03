"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
const constants_1 = require("./constants");
exports.controllerDefines = [];
function controller(path) {
    return function (constructor) {
        registerController(constructor, path);
        return constructor;
    };
}
exports.controller = controller;
function action(path) {
    return function (target, propertyKey, descriptor) {
        let memberName = descriptor.value.name;
        registerAction(target.constructor, memberName, path);
    };
}
exports.action = action;
function register(type, path) {
    registerController(type, path);
    let obj = {
        action(member, path) {
            registerAction(type, member, path);
            return obj;
        }
    };
    return obj;
}
exports.register = register;
function registerController(type, path) {
    if (!path) {
        // const controllerSuffix = 'Controller'
        path = type.name.endsWith(constants_1.controllerSuffix) ?
            type.name.substring(0, type.name.length - constants_1.controllerSuffix.length) : type.name;
    }
    if (path && path[0] != '/')
        path = '/' + path;
    let controllerDefine = exports.controllerDefines.filter(o => o.type == type)[0];
    if (controllerDefine == null) {
        controllerDefine = { type: type, actionDefines: [], path };
        exports.controllerDefines.push(controllerDefine);
    }
    else {
        controllerDefine.path = path;
    }
    return controllerDefine;
}
function registerAction(controllerType, memberName, path) {
    console.assert(typeof memberName == 'string');
    let controllerDefine = exports.controllerDefines.filter(o => o.type == controllerType)[0];
    if (controllerDefine == null) {
        controllerDefine = registerController(controllerType);
    }
    controllerDefine.actionDefines.push({ memberName: memberName, path });
}
function checkValidPath(path) {
    if (!path)
        throw errors.arugmentNull('path');
    if (path[0] != '/')
        throw new Error(`Path must starts with '/', actual is '${path}'`);
}
//# sourceMappingURL=attributes.js.map