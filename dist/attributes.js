"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
exports.controllerDefines = [];
function controller(path) {
    checkValidPath(path);
    return function (constructor) {
        registerController(constructor, path);
        return constructor;
    };
}
exports.controller = controller;
function action(path) {
    checkValidPath(path);
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
    let controllerDefine = exports.controllerDefines.filter(o => o.type == type)[0];
    if (controllerDefine == null) {
        controllerDefine = { type: type, actionDefines: [] };
        exports.controllerDefines.push(controllerDefine);
    }
    controllerDefine.path = path;
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