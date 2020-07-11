
import * as errors from '../errors'
import { controllerSuffix } from '../constants';
import "reflect-metadata";
import http = require('http')
import querystring = require('querystring');
import url = require('url');
import { ServerContext, ActionPath } from './types';
import { ActionInfo, ControllerType, ControllerInfo } from './types';

export let metaKeys = {
    action: "actionMetaKey",
    parameter: "parameterMetaKey"
}

export interface ActionParameterDecoder<T> {
    parameterIndex: number,
    createParameter: (
        req: http.IncomingMessage,
        res: http.ServerResponse,
        context: ServerContext,
        routeData: { [key: string]: string } | null,
    ) => Promise<T>,
    disposeParameter?: (parameter: T) => void
}


export let CONTROLLER_REGISTER = "$register";
export type RegisterCotnroller = (controllerInfos: ControllerInfo[]) => void;
/**
 * 标记一个类是否为控制器
 * @param path 路径
 */
export function controller<T extends { new(...args: any[]): any }>(path?: string) {
    return function (constructor: T) {
        let func: RegisterCotnroller = function (controllerInfos: ControllerInfo[]) {
            let controllerInfo = registerController(constructor, controllerInfos, path)
            let propertyNames = Object.getOwnPropertyNames(constructor.prototype)
            for (let i = 0; i < propertyNames.length; i++) {
                let metadata: ActionInfo = Reflect.getMetadata(metaKeys.action, constructor, propertyNames[i])
                if (metadata) {
                    registerAction(controllerInfo, metadata.memberName, metadata.paths)
                }
            }
        }
        constructor.prototype[CONTROLLER_REGISTER] = func;
    }
}


/**
 * 标记一个方法是否为 Action
 * @param paths 路径
 */
export function action(...paths: ActionPath[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let memberName = descriptor.value.name
        let obj: ActionInfo = { memberName, paths }
        let controllerType = target.constructor
        let actionDefine = Reflect.getMetadata(metaKeys.action, controllerType, propertyKey)
        if (actionDefine)
            throw errors.onlyOneAction(propertyKey)

        Reflect.defineMetadata(metaKeys.action, obj, controllerType, propertyKey)
    };
}

export function register<T>(type: ControllerType<T>, serverContext: ControllerInfo[], path?: string) {
    let controllerDefine = registerController(type, serverContext, path)
    let obj = {
        action(member: keyof T, paths?: string[]) {
            registerAction(controllerDefine, member, paths || [])
            return obj
        }
    }

    return obj
}

function registerController<T>(type: ControllerType<T>, controllerDefines: ControllerInfo[], path?: string) {
    if (!path) {
        path = type.name.endsWith(controllerSuffix) ?
            type.name.substring(0, type.name.length - controllerSuffix.length) : type.name
    }

    if (path && path[0] != '/')
        path = '/' + path

    // serverContext.controllerDefines = serverContext.controllerDefines || [];
    let controllerDefine = controllerDefines.filter(o => o.type == type)[0]
    if (controllerDefine != null)
        throw errors.controlRegister(type)

    controllerDefine = { type: type, actionDefines: [], path }
    controllerDefines.push(controllerDefine)

    return controllerDefine
}

function registerAction<T>(controllerDefine: ControllerInfo, memberName: keyof T, paths: ActionPath[]) {
    if (controllerDefine == null)
        throw errors.arugmentNull('controllerDefine')

    console.assert(typeof memberName == 'string')
    controllerDefine.actionDefines.push({ memberName: memberName as string, paths })
}

export function createParameterDecorator<T>(
    createParameter: (req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext, routeData: { [key: string]: string } | null) => Promise<T>,
    disposeParameter?: (parameter: T) => void) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let value: ActionParameterDecoder<T>[] = Reflect.getMetadata(metaKeys.parameter, target, propertyKey) || []
        let p: ActionParameterDecoder<T> = {
            createParameter,
            disposeParameter,
            parameterIndex
        }
        value.push(p)

        Reflect.defineMetadata(metaKeys.parameter, value, target, propertyKey)
    }
}

export let routeData = (function () {

    function getPostObject(request: http.IncomingMessage): Promise<any> {
        let length = request.headers['content-length'] || 0;
        let contentType = request.headers['content-type'] as string;
        if (length <= 0)
            return Promise.resolve({});

        if (!request.readable)
            throw errors.requestNotReadable();

        return new Promise((reslove, reject) => {
            var text = "";
            request
                .on('data', (data: { toString: () => string }) => {
                    text = text + data.toString();
                })
                .on('end', () => {
                    let obj;
                    try {
                        if (contentType.indexOf('application/json') >= 0) {
                            obj = JSON.parse(text)
                        }
                        else {
                            obj = querystring.parse(text);
                        }
                        reslove(obj || {});
                    }
                    catch (err) {
                        reject(err);
                    }
                })
        });
    }

    /**
     * 
     * @param request 获取 QueryString 里的对象
     */
    function getQueryObject(request: http.IncomingMessage): { [key: string]: any } {
        let contentType = request.headers['content-type'] as string;
        let obj: { [key: string]: any } = {};
        let urlInfo = url.parse(request.url || '');
        let { query } = urlInfo;

        if (!query) {
            return obj;
        }

        query = decodeURIComponent(query);
        let queryIsJSON = (contentType != null && contentType.indexOf('application/json') >= 0) ||
            (query != null && query[0] == '{' && query[query.length - 1] == '}')

        if (queryIsJSON) {
            let arr = (request.url || '').split('?');
            let str = arr[1]
            if (str != null) {
                str = decodeURIComponent(str);
                obj = JSON.parse(str);  //TODO：异常处理
            }
        }
        else {
            obj = querystring.parse(query);
        }

        return obj;
    }

    return createParameterDecorator<any>(async (req: http.IncomingMessage, res, context, routeData?: { [key: string]: string } | null) => {
        let obj: any = routeData = routeData || {}

        let queryData = getQueryObject(req);
        console.assert(queryData != null)
        obj = Object.assign(obj, queryData);

        if (req.method != 'GET') {
            let data = await getPostObject(req);
            obj = Object.assign(obj, data)
        }

        return obj;
    })

})()

export let formData = routeData;

export let request = createParameterDecorator(
    async (req) => {
        return req;
    }
)

export let response = createParameterDecorator(
    async (req, res: http.ServerResponse) => {
        return res;
    }
)

export let requestHeaders = createParameterDecorator(
    async (req) => {
        return req.headers;
    }
)

export let serverContext = createParameterDecorator(
    async (req, res, context: ServerContext) => {
        return context;
    }
)
