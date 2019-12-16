"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("./errors");
const constants_1 = require("./constants");
require("reflect-metadata");
const querystring = require("querystring");
const url = require("url");
// const actionMetaKey = Symbol('action')
// const parameterMetaKey = Symbol('parameter')
exports.metaKeys = {
    action: "actionMetaKey",
    parameter: "parameterMetaKey"
};
//==============================================================================
// controllerDefines 变量用作全局变量, 由于同一个文件可能会加载多次, 会导致变量失效
// export let controllerDefines: ControllerInfo[] = []
// export let controllerDefines: ControllerInfo[] =
//     (global as any)["Node-MVC-ControllerInfos"] = (global as any)["Node-MVC-ControllerInfos"] || []
//==============================================================================
exports.CONTROLLER_REGISTER = "$register";
/**
 * 标记一个类是否为控制器
 * @param path 路径
 */
function controller(path) {
    return function (constructor) {
        constructor.prototype[exports.CONTROLLER_REGISTER] = function (serverContext) {
            let controllerInfo = registerController(constructor, serverContext, path);
            let propertyNames = Object.getOwnPropertyNames(constructor.prototype);
            for (let i = 0; i < propertyNames.length; i++) {
                let metadata = Reflect.getMetadata(exports.metaKeys.action, constructor, propertyNames[i]);
                if (metadata) {
                    registerAction(controllerInfo, metadata.memberName, metadata.paths);
                }
            }
        };
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
        let actionDefine = Reflect.getMetadata(exports.metaKeys.action, controllerType, propertyKey);
        if (actionDefine)
            throw errors.onlyOneAction(propertyKey);
        Reflect.defineMetadata(exports.metaKeys.action, obj, controllerType, propertyKey);
    };
}
exports.action = action;
function register(type, serverContext, path) {
    let controllerDefine = registerController(type, serverContext, path);
    let obj = {
        action(member, paths) {
            registerAction(controllerDefine, member, paths || []);
            return obj;
        }
    };
    return obj;
}
exports.register = register;
function registerController(type, serverContext, path) {
    if (!path) {
        path = type.name.endsWith(constants_1.controllerSuffix) ?
            type.name.substring(0, type.name.length - constants_1.controllerSuffix.length) : type.name;
    }
    if (path && path[0] != '/')
        path = '/' + path;
    serverContext.controllerDefines = serverContext.controllerDefines || [];
    let controllerDefine = serverContext.controllerDefines.filter(o => o.type == type)[0];
    if (controllerDefine != null)
        throw errors.controlRegister(type);
    controllerDefine = { type: type, actionDefines: [], path };
    serverContext.controllerDefines.push(controllerDefine);
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
exports.routeData = (function () {
    function getPostObject(request) {
        let length = request.headers['content-length'] || 0;
        let contentType = request.headers['content-type'];
        if (length <= 0)
            return Promise.resolve({});
        if (!request.readable)
            throw errors.requestNotReadable();
        return new Promise((reslove, reject) => {
            var text = "";
            request
                .on('data', (data) => {
                text = text + data.toString();
            })
                .on('end', () => {
                let obj;
                try {
                    if (contentType.indexOf('application/json') >= 0) {
                        obj = JSON.parse(text);
                    }
                    else {
                        obj = querystring.parse(text);
                    }
                    reslove(obj || {});
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    /**
     *
     * @param request 获取 QueryString 里的对象
     */
    function getQueryObject(request) {
        let contentType = request.headers['content-type'];
        let obj = {};
        let urlInfo = url.parse(request.url || '');
        let { query } = urlInfo;
        if (!query) {
            return obj;
        }
        query = decodeURIComponent(query);
        let queryIsJSON = (contentType != null && contentType.indexOf('application/json') >= 0) ||
            (query != null && query[0] == '{' && query[query.length - 1] == '}');
        if (queryIsJSON) {
            let arr = (request.url || '').split('?');
            let str = arr[1];
            if (str != null) {
                str = decodeURIComponent(str);
                obj = JSON.parse(str); //TODO：异常处理
            }
        }
        else {
            obj = querystring.parse(query);
        }
        return obj;
    }
    return createParameterDecorator((req, res, context, routeData) => __awaiter(this, void 0, void 0, function* () {
        let obj = routeData = routeData || {};
        let queryData = getQueryObject(req);
        console.assert(queryData != null);
        obj = Object.assign(obj, queryData);
        if (req.method != 'GET') {
            let data = yield getPostObject(req);
            obj = Object.assign(obj, data);
        }
        return obj;
    }));
})();
exports.formData = exports.routeData;
exports.request = createParameterDecorator((req) => __awaiter(void 0, void 0, void 0, function* () {
    return req;
}));
exports.response = createParameterDecorator((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res;
}));
exports.requestHeaders = createParameterDecorator((req) => __awaiter(void 0, void 0, void 0, function* () {
    return req.headers;
}));
exports.serverContext = createParameterDecorator((req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
    return context;
}));
