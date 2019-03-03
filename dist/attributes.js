"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
const constants_1 = require("./constants");
let actionsToRegister = [];
exports.controllerDefines = [];
function controller(path) {
    return function (constructor) {
        let controllerDefine = registerController(constructor, path);
        let items = actionsToRegister.filter(o => o.controllerType = constructor);
        for (let i = 0; i < items.length; i++) {
            registerAction(controllerDefine, items[i].memberName, items[i].path);
        }
        actionsToRegister = actionsToRegister.filter(o => o.controllerType != constructor);
        return constructor;
    };
}
exports.controller = controller;
function action(path) {
    return function (target, propertyKey, descriptor) {
        let memberName = descriptor.value.name;
        actionsToRegister.push({ controllerType: target.constructor, memberName, path });
    };
}
exports.action = action;
function register(type, path) {
    let controllerDefine = registerController(type, path);
    let obj = {
        action(member, path) {
            registerAction(controllerDefine, member, path);
            return obj;
        }
    };
    return obj;
}
exports.register = register;
function registerController(type, path) {
    if (!path) {
        path = type.name.endsWith(constants_1.controllerSuffix) ?
            type.name.substring(0, type.name.length - constants_1.controllerSuffix.length) : type.name;
    }
    if (path && path[0] != '/')
        path = '/' + path;
    let controllerDefine = exports.controllerDefines.filter(o => o.type == type)[0];
    if (controllerDefine != null)
        throw errors.controlRegister(type);
    controllerDefine = { type: type, actionDefines: [], path };
    exports.controllerDefines.push(controllerDefine);
    return controllerDefine;
}
function registerAction(controllerDefine, memberName, path) {
    if (controllerDefine == null)
        throw errors.arugmentNull('controllerDefine');
    console.assert(typeof memberName == 'string');
    controllerDefine.actionDefines.push({ memberName: memberName, path });
}
//# sourceMappingURL=attributes.js.map