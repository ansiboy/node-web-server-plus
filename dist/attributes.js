"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
const constants_1 = require("./constants");
require("reflect-metadata");
const actionMetaKey = Symbol('action');
exports.controllerDefines = [];
function controller(path) {
    return function (constructor) {
        let controllerDefine = registerController(constructor, path);
        let propertyNames = Object.getOwnPropertyNames(constructor.prototype);
        for (let i = 0; i < propertyNames.length; i++) {
            let metadata = Reflect.getMetadata(actionMetaKey, constructor, propertyNames[i]);
            if (metadata) {
                registerAction(controllerDefine, metadata.memberName, metadata.paths);
            }
        }
        //let actionMetaDatas = Reflect.getOwnMetadata(actionMetaKey, constructor)
        // let controllerDefine = registerController(constructor, path)
        // let items = actionsToRegister.filter(o => o.controllerType = constructor)
        // for (let i = 0; i < items.length; i++) {
        //     registerAction(controllerDefine, items[i].memberName, items[i].path)
        // }
        // actionsToRegister = actionsToRegister.filter(o => o.controllerType != constructor)
        // return constructor
    };
}
exports.controller = controller;
function action(...paths) {
    return function (target, propertyKey, descriptor) {
        let memberName = descriptor.value.name;
        let obj = { memberName, paths };
        let controllerType = target.constructor;
        let actionDefine = Reflect.getMetadata(actionMetaKey, controllerType, propertyKey);
        if (actionDefine)
            throw errors.onlyOneAction(propertyKey);
        Reflect.defineMetadata(actionMetaKey, obj, controllerType, propertyKey);
        // actionsToRegister.push({ controllerType: target.constructor, memberName, path })
    };
}
exports.action = action;
function register(type, path) {
    let controllerDefine = registerController(type, path);
    let obj = {
        action(member, paths) {
            registerAction(controllerDefine, member, paths || []);
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
    // Reflect.getMetadataKeys()
    return controllerDefine;
}
function registerAction(controllerDefine, memberName, paths) {
    if (controllerDefine == null)
        throw errors.arugmentNull('controllerDefine');
    console.assert(typeof memberName == 'string');
    controllerDefine.actionDefines.push({ memberName: memberName, paths });
}
//# sourceMappingURL=attributes.js.map