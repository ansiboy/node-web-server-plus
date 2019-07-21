import * as errors from './errors'
import * as fs from 'fs'
import * as path from 'path'
import isClass = require('is-class')
import { controllerDefines, controller } from './attributes';
import { isRouteString } from "./router";
// import Route = require("route-parser");
import UrlPattern = require("url-pattern");
import { Controller } from './controller';
import { createAPIControllerType, ActionInfo } from './api-controller';

export class ControllerLoader {

    // 使用路径进行匹配的 action
    private pathActions: { [path: string]: ActionInfo } = {};

    // 使用路由进行匹配的 action
    private routeActions: (ActionInfo & { route: UrlPattern })[] = [];
    // private routes: Route[] = [];

    constructor(controllerDirectories: string[]) {
        if (controllerDirectories == null || controllerDirectories.length == 0)
            throw errors.arugmentNull('controllerDirectories')

        let controllerPaths: { [dir: string]: string[] } = {}
        controllerDirectories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                throw errors.controllerDirectoryNotExists(dir)
            }

            controllerPaths[dir] = this.getControllerPaths(dir)
        })

        for (let dir in controllerPaths) {
            controllerPaths[dir].forEach(controllerPath => {
                this.loadController(controllerPath)
            })
        }

        //=============================================
        // 注册内置的控制器

        createAPIControllerType(() => {
            let actionInfos: ActionInfo[] = [
                ...Object.getOwnPropertyNames(this.pathActions).map(name => this.pathActions[name]),
                ...this.routeActions
            ];

            return actionInfos;
        });
        //==============================================

        controllerDefines.forEach(c => {
            console.assert((c.path || '') != '')
            c.actionDefines.forEach(a => {

                let actionPaths = a.paths || []
                if (actionPaths.length == 0) {
                    actionPaths.push(this.joinPaths(c.path, a.memberName))
                }
                for (let i = 0; i < actionPaths.length; i++) {
                    let actionPath: string = actionPaths[i]
                    if (actionPath[0] != '/') {
                        actionPath = this.joinPaths(c.path, actionPath)
                    }

                    if (isRouteString(actionPath)) {
                        let route = new UrlPattern(actionPath);
                        this.routeActions.push({ route, controllerType: c.type, memberName: a.memberName, actionPath });
                    }
                    else {
                        this.pathActions[actionPath] = { controllerType: c.type, memberName: a.memberName, actionPath }
                    }

                }
            })
        })
    }

    private joinPaths(path1: string, path2: string) {
        if (path1 == null) throw errors.arugmentNull('path1')
        if (path2 == null) throw errors.arugmentNull('path2')
        let p = path.join(path1, path2)
        p = p.replace(/\\/g, '/')
        return p
    }

    /**
     * 获取指定文件夹中（包括子目录），控制器的路径。
     * @param dir 控制器的文件夹
     */
    private getControllerPaths(dir: string) {
        let controllerPaths: string[] = []
        let dirs: string[] = []
        dirs.push(dir)
        while (dirs.length > 0) {
            let item = dirs.pop()
            let files = fs.readdirSync(item as string)
            files.forEach(f => {
                let p = path.join(item as string, f)
                let state = fs.lstatSync(p)
                if (state.isDirectory()) {
                    dirs.push(p)
                }
                else if (state.isFile() && p.endsWith('.js')) {
                    // 去掉 .js 后缀
                    controllerPaths.push(p.substring(0, p.length - 3))
                }
            })
        }

        return controllerPaths
    }

    private loadController(controllerPath: string): void {
        try {
            let mod = require(controllerPath);
            console.assert(mod != null)
            let propertyNames = Object.getOwnPropertyNames(mod)
            for (let i = 0; i < propertyNames.length; i++) {
                let ctrlType = mod[propertyNames[i]]
                if (!isClass(ctrlType)) {
                    continue
                }

                //TODO: 检查控制器是否重复
                console.assert(controllerDefines != null)
                let controllerDefine = controllerDefines.filter(o => o.type == ctrlType)[0]

                // 判断类型使用 ctrlType.prototype instanceof Controller 不可靠
                if (controllerDefine == null && ctrlType["typeName"] == Controller.typeName) {
                    controller(ctrlType.name)(ctrlType);
                }
            }
        }
        catch (err) {
            console.error(err)
            throw innerErrors.loadControllerFail(controllerPath, err)
        }
    }


    getAction(virtualPath: string) {

        if (!virtualPath) throw errors.arugmentNull('virtualPath')

        // 将一个或多个的 / 变为一个 /，例如：/shop/test// 转换为 /shop/test/
        virtualPath = virtualPath.replace(/\/+/g, '/');

        // 去掉路径末尾的 / ，例如：/shop/test/ 变为 /shop/test, 如果路径 / 则保持不变
        if (virtualPath[virtualPath.length - 1] == '/' && virtualPath.length > 1)
            virtualPath = virtualPath.substr(0, virtualPath.length - 1);

        let actionInfo = this.pathActions[virtualPath];
        let controller: any = null;
        let action: any = null;
        let routeData: { [key: string]: string } | null = null;

        if (actionInfo != null) {
            controller = new actionInfo.controllerType()
            action = controller[actionInfo.memberName]
            console.assert(action != null)
        }

        for (let i = 0; i < this.routeActions.length; i++) {
            let r = this.routeActions[i].route.match(virtualPath)
            if (r) {
                routeData = r;
                controller = new this.routeActions[i].controllerType();
                action = controller[this.routeActions[i].memberName];
                break;
            }
        }

        if (action == null)
            return null;

        console.assert(controller != null);
        return { action, controller, routeData }
    }
}


let innerErrors = {
    invalidAreaType(areaName: string, actualType: string) {
        let error = new Error(`Area ${areaName} type must be string or object, actual is ${actualType}.`)
        return error
    },
    parsePathFail(path: string) {
        let error = new Error(`Parse path ${path} fail.`)
        return error
    },
    invalidControllerType(areaName: string, controllerName: string, actualType: string) {
        let error = new Error(`Controller ${controllerName} of area ${areaName} type must be function or object, actual is ${actualType}.`)
        return error
    },
    invalidControllerTypeByPath(path: string, actualType: string) {
        let error = new Error(`Controller ${path} type must be function or object, actual is ${actualType}.`)
        return error
    },
    loadControllerFail(path: string, innerError: Error) {
        let msg = `Load controller '${path}' fail.`;
        let error = new Error(msg);
        error.name = innerErrors.loadControllerFail.name;
        error.innerError = innerError
        return error;
    },
    actionNotExists(path: string): Error {
        let msg = `Action '${path}' is not exists.`;
        let error = new Error(msg);
        error.name = innerErrors.actionNotExists.name;
        error.statusCode = 404
        return error;
    },
    controllerNotExist(controllerName: string, virtualPath: string) {
        let msg = `Control ${controllerName} is not exists, path is ${virtualPath}.`
        let error = new Error(msg)
        error.name = innerErrors.controllerNotExist.name
        error.statusCode = 404
        return error
    },
    controllerIsNotClass(controllerName: string) {
        let msg = `Control ${controllerName} is not a class.`
        let error = new Error(msg)
        error.name = innerErrors.controllerIsNotClass.name
        return error
    }
}

