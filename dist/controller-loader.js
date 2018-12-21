"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
const fs = require("fs");
const path = require("path");
const isClass = require("is-class");
const DEFAULT_AREA_NAME = 'default';
const DEFAULT_CONTROLLER_NAME = 'home';
const DEFAULT_ACTION_NAME = 'index';
const DEFAULT_AREA_PATH = 'modules';
class ControllerLoader {
    constructor(areas, rootPath) {
        this.areaControllers = {};
        this.actions = {};
        if (!areas)
            throw errors.arugmentNull('areas');
        if (!rootPath)
            throw errors.arugmentNull('rootPath');
        this.rootPath = rootPath;
        this.initAreas(areas, rootPath);
        areas[DEFAULT_AREA_NAME] = areas[DEFAULT_AREA_NAME] || DEFAULT_AREA_PATH;
        for (let areaName in areas) {
            let controllerPaths = areas[areaName];
            let controllers = this.areaControllers[areaName] = {};
            for (let controllerName in controllerPaths) {
                let controllerPath = controllerPaths[controllerName];
                controllers[controllerName] = this.loadController(controllerPath);
            }
        }
    }
    initAreas(areas, ROOT_PATH) {
        areas[DEFAULT_AREA_NAME] = areas[DEFAULT_AREA_NAME] || DEFAULT_AREA_PATH;
        for (let name in areas) {
            let area = areas[name];
            if (typeof area == 'string') {
                let areaPath = area;
                let areaFullPath = path.join(__dirname, ROOT_PATH, areas[name]);
                areas[name] = area = {};
                let files = fs.readdirSync(areaFullPath);
                files.forEach(fileName => {
                    let arr = fileName.split('.');
                    if (area.length < 2 || arr[arr.length - 1] == null || arr[arr.length - 1].toLowerCase() != 'js')
                        return;
                    //========================
                    // 去掉末尾的文件扩展名
                    arr.pop();
                    //========================
                    fileName = arr.join('.');
                    area[fileName] = path.join(areaPath, fileName);
                });
                area[DEFAULT_CONTROLLER_NAME] = area[DEFAULT_CONTROLLER_NAME] || path.join(areaPath, DEFAULT_CONTROLLER_NAME);
            }
            else if (typeof area == 'object') {
                area[DEFAULT_CONTROLLER_NAME] = area[DEFAULT_CONTROLLER_NAME] || path.join(DEFAULT_AREA_PATH, DEFAULT_CONTROLLER_NAME);
            }
            else {
                throw innerErrors.invalidAreaType(name, typeof area);
            }
        }
    }
    loadController(controllerPath) {
        let controllerPhysicalPath = path.join(this.rootPath, controllerPath);
        let mod = require(controllerPhysicalPath);
        console.assert(mod != null);
        let ctrl = mod.default || mod;
        let controller_type = typeof (ctrl);
        let controller;
        if (controller_type == 'function') {
            controller = isClass(ctrl) ? new ctrl() : ctrl();
        }
        else if (controller_type == 'object') {
            controller = ctrl;
        }
        else {
            throw innerErrors.invalidControllerTypeByPath(controllerPhysicalPath, controller_type);
        }
        return controller;
    }
    getAction(virtualPath) {
        let action = this.actions[virtualPath];
        if (action != null) {
            return action;
        }
        let arr = virtualPath.split('/').filter(o => o);
        if (arr.length > 3) {
            throw innerErrors.parsePathFail(virtualPath);
        }
        arr.reverse();
        let [actionName, controllerName, arreaName] = Object.assign([DEFAULT_ACTION_NAME, DEFAULT_CONTROLLER_NAME, DEFAULT_AREA_NAME], arr);
        this.areaControllers[arreaName] = this.areaControllers[arreaName] || {};
        let controller = this.areaControllers[arreaName][controllerName];
        if (controller == null) {
            throw innerErrors.controllerNotExist(controllerName, virtualPath);
        }
        action = controller[actionName];
        if (action == null) {
            console.log(`Action '${actionName}' is not exists in '${controllerName}'`);
            throw innerErrors.actionNotExists(actionName, controllerName);
        }
        action.bind(controller);
        this.actions[virtualPath] = action;
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
    loadControllerFail(name, innerError) {
        let msg = `Load controller '${name}' fail.`;
        let error = new Error(msg);
        error.name = innerErrors.loadControllerFail.name;
        error.innerError = innerError;
        return error;
    },
    actionNotExists(action, controller) {
        let msg = `Action '${action}' is not exists in controller '${controller}'`;
        let error = new Error(msg);
        error.name = innerErrors.actionNotExists.name;
        return error;
    },
    controllerNotExist(controllerName, virtualPath) {
        let msg = `Control ${controllerName} is not exists, path is ${virtualPath}.`;
        let error = new Error(msg);
        error.name = errors.controllerNotExist.name;
        return error;
    }
};
//# sourceMappingURL=controller-loader.js.map