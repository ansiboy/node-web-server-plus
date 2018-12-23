"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllerDefines = [];
function controller(path) {
    return function (constructor) {
        let controllerDefine = exports.controllerDefines.filter(o => o.type == constructor)[0];
        if (controllerDefine == null) {
            controllerDefine = { type: constructor, actionDefines: [] };
            exports.controllerDefines.push(controllerDefine);
        }
        controllerDefine.path = path;
        return constructor;
    };
}
exports.controller = controller;
function action(path) {
    return function (target, propertyKey, descriptor) {
        exports.controllerDefines[target.constructor.name] = exports.controllerDefines[target.constructor.name] || target.constructor;
        let controllerDefine = exports.controllerDefines.filter(o => o.type == target.constructor)[0];
        if (controllerDefine == null) {
            controllerDefine = { type: target.constructor, actionDefines: [] };
            exports.controllerDefines.push(controllerDefine);
        }
        controllerDefine.actionDefines.push({ method: descriptor.value, path });
    };
}
exports.action = action;
//# sourceMappingURL=attributes.js.map