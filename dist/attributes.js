"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
const constants_1 = require("./constants");
require("reflect-metadata");
const actionMetaKey = Symbol('action');
const parameterMetaKey = Symbol('parameter');
exports.metaKeys = {
    action: actionMetaKey,
    parameter: parameterMetaKey
};
exports.controllerDefines = [];
/**
 * 标记一个类是否为控制器
 * @param path 路径
 */
function controller(path) {
    return function (constructor) {
        let controllerInfo = registerController(constructor, path);
        let propertyNames = Object.getOwnPropertyNames(constructor.prototype);
        for (let i = 0; i < propertyNames.length; i++) {
            let metadata = Reflect.getMetadata(actionMetaKey, constructor, propertyNames[i]);
            if (metadata) {
                registerAction(controllerInfo, metadata.memberName, metadata.paths);
            }
        }
    };
}
exports.controller = controller;
/**
 * 标记一个方法是否为 Action
 * @param paths 路径
 */
function action(...paths) {
    return function (target, propertyKey, descriptor) {
        let memberName = descriptor.value.name;
        let obj = { memberName, paths };
        let controllerType = target.constructor;
        let actionDefine = Reflect.getMetadata(actionMetaKey, controllerType, propertyKey);
        if (actionDefine)
            throw errors.onlyOneAction(propertyKey);
        Reflect.defineMetadata(actionMetaKey, obj, controllerType, propertyKey);
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
    return controllerDefine;
}
function registerAction(controllerDefine, memberName, paths) {
    if (controllerDefine == null)
        throw errors.arugmentNull('controllerDefine');
    console.assert(typeof memberName == 'string');
    controllerDefine.actionDefines.push({ memberName: memberName, paths });
}
function createParameterDecorator(createParameter, disposeParameter) {
    return function (target, propertyKey, parameterIndex) {
        let value = Reflect.getMetadata(exports.metaKeys.parameter, target, propertyKey) || [];
        let p = {
            createParameter,
            disposeParameter,
            parameterIndex
        };
        value.push(p);
        Reflect.defineMetadata(exports.metaKeys.parameter, value, target, propertyKey);
    };
}
exports.createParameterDecorator = createParameterDecorator;
//# sourceMappingURL=attributes.js.map