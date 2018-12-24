"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
const fs = require("fs");
const path = require("path");
const isClass = require("is-class");
const attributes_1 = require("./attributes");
const DEFAULT_ACTION_NAME = 'index';
class ControllerLoader {
    constructor(controller_directories, root_path) {
        this.actions = {};
        if (controller_directories == null || controller_directories.length == 0)
            throw errors.arugmentNull('areas');
        let controllerPaths = {};
        controller_directories.forEach(dir => {
            dir = path.join(root_path, dir);
            if (!fs.existsSync(dir)) {
                throw errors.controllerDirectoryNotExists(dir);
            }
            controllerPaths[dir] = this.getControllerPaths(dir);
        });
        let controllers = {};
        for (let dir in controllerPaths) {
            controllerPaths[dir].forEach(controllerPath => {
                controllers[controllerPath] = this.loadController(controllerPath, dir);
            });
        }
        attributes_1.controllerDefines.forEach(c => {
            console.assert((c.path || '') != '');
            c.actionDefines.forEach(a => {
                let actionPath = a.path || this.joinPaths(c.path, a.memberName);
                this.actions[actionPath] = { controllerType: c.type, memberName: a.memberName };
            });
            let defaultActionPath = this.joinPaths(c.path, DEFAULT_ACTION_NAME);
            if (c.actionDefines[defaultActionPath] == null && c.type.prototype[DEFAULT_ACTION_NAME] != null) {
                this.actions[defaultActionPath] = { controllerType: c.type, memberName: DEFAULT_ACTION_NAME };
            }
        });
        // console.log(controllerDefines)
        // console.log(this.actions)
    }
    joinPaths(path1, path2) {
        if (path1 == null)
            throw errors.arugmentNull('path1');
        if (path2 == null)
            throw errors.arugmentNull('path2');
        let p = path.join(path1, path2);
        p = p.replace(/\\/g, '/');
        return p;
    }
    getControllerPaths(dir) {
        let controllerPaths = [];
        let dirs = [];
        dirs.push(dir);
        while (dirs.length > 0) {
            let item = dirs.pop();
            let files = fs.readdirSync(item);
            files.forEach(f => {
                let p = path.join(item, f);
                let state = fs.lstatSync(p);
                if (state.isDirectory()) {
                    dirs.push(p);
                }
                else if (state.isFile() && p.endsWith('.js')) {
                    // 去掉 .js 后缀
                    controllerPaths.push(p.substring(0, p.length - 3));
                }
            });
        }
        return controllerPaths;
    }
    loadController(controllerPath, dir) {
        let ctrl;
        try {
            let mod = require(controllerPath);
            console.assert(mod != null);
            ctrl = mod.default || mod;
        }
        catch (err) {
            console.error(err);
            throw innerErrors.loadControllerFail(controllerPath, err);
        }
        if (!isClass(ctrl)) {
            throw innerErrors.controllerIsNotClass(controllerPath);
        }
        console.assert(attributes_1.controllerDefines != null);
        let controllerDefine = attributes_1.controllerDefines.filter(o => o.type == ctrl)[0];
        if (!controllerDefine.path) {
            controllerDefine.path = path.join('/', path.relative(dir, controllerPath));
        }
    }
    getAction(virtualPath) {
        if (!virtualPath)
            throw errors.arugmentNull('virtualPath');
        // 将一个或多个的 / 变为一个 /，例如：/shop/test// 转换为 /shop/test/
        virtualPath = virtualPath.replace(/\/+/g, '/');
        // 去掉路径末尾的 / ，例如：/shop/test/ 变为 /shop/test, 如果路径 / 则保持不变
        if (virtualPath[virtualPath.length - 1] == '/' && virtualPath.length > 1)
            virtualPath = virtualPath.substr(0, virtualPath.length - 1);
        let actionInfo = this.actions[virtualPath];
        if (actionInfo == null) {
            throw innerErrors.actionNotExists(virtualPath);
        }
        let controller = new actionInfo.controllerType();
        let action = controller[actionInfo.memberName];
        console.assert(action != null);
        return action;
    }
}
exports.ControllerLoader = ControllerLoader;
let innerErrors = {
    invalidAreaType(areaName, actualType) {
        let error = new Error(`Area ${areaName} type must be string or object, actual is ${actualType}.`);
        return error;
    },
    parsePathFail(path) {
        let error = new Error(`Parse path ${path} fail.`);
        return error;
    },
    invalidControllerType(areaName, controllerName, actualType) {
        let error = new Error(`Controller ${controllerName} of area ${areaName} type must be function or object, actual is ${actualType}.`);
        return error;
    },
    invalidControllerTypeByPath(path, actualType) {
        let error = new Error(`Controller ${path} type must be function or object, actual is ${actualType}.`);
        return error;
    },
    loadControllerFail(path, innerError) {
        let msg = `Load controller '${path}' fail.`;
        let error = new Error(msg);
        error.name = innerErrors.loadControllerFail.name;
        error.innerError = innerError;
        return error;
    },
    actionNotExists(path) {
        let msg = `Action '${path}' is not exists.`;
        let error = new Error(msg);
        error.name = innerErrors.actionNotExists.name;
        error.statusCode = 404;
        return error;
    },
    controllerNotExist(controllerName, virtualPath) {
        let msg = `Control ${controllerName} is not exists, path is ${virtualPath}.`;
        let error = new Error(msg);
        error.name = innerErrors.controllerNotExist.name;
        error.statusCode = 404;
        return error;
    },
    controllerIsNotClass(controllerName) {
        let msg = `Control ${controllerName} is not a class.`;
        let error = new Error(msg);
        error.name = innerErrors.controllerIsNotClass.name;
        return error;
    }
};
//# sourceMappingURL=controller-loader.js.map