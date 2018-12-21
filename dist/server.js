"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const errors = require("./errors");
const url = require("url");
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const controller_loader_1 = require("./controller-loader");
const isClass = require('is-class');
const ROOT_PATH = "../";
const DEFAULT_AREA = 'default';
class WebServer {
    constructor(server) {
        this.server = server;
    }
}
exports.WebServer = WebServer;
function startServer(config) {
    let controllerLoader = new controller_loader_1.ControllerLoader(config.areas || {}, ROOT_PATH);
    let server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
        setHeaders(res);
        if (req.method == 'OPTIONS') {
            res.end();
            return;
        }
        try {
            let requestUrl = req.url || '';
            let urlInfo = url.parse(requestUrl);
            let path = urlInfo.pathname || '';
            let action = controllerLoader.getAction(path);
            let data = yield pareseActionArgument(req);
            let actionResult = yield action(data, req, res);
            outputResult(actionResult, res);
            // let arr = path.split('/').filter(o => o)
            // let area: string, controllerName: string, actionName: string
            // if (arr.length <= 2) {
            //     [controllerName, actionName] = arr;
            //     area = DEFAULT_AREA;
            // }
            // else {
            //     [area, controllerName, actionName] = arr
            // }
            // if (!controllerName)
            //     throw errors.canntGetControlName(requestUrl)
            // if (!actionName)
            //     throw errors.canntGetActionName(requestUrl)
            // await executeAction(config, area, controllerName, actionName, req, res)
        }
        catch (err) {
            outputError(err, res);
        }
    }));
    server.on('error', (err) => {
        console.log(err);
    });
    // return server
    server.listen(config.host.port, config.host.bind_ip);
}
exports.startServer = startServer;
function setHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', `POST, GET, OPTIONS, PUT, DELETE`);
}
function pareseActionArgument(req) {
    let dataPromise;
    if (req.method == 'GET') {
        let queryData = getQueryObject(req);
        dataPromise = Promise.resolve(queryData);
    }
    else {
        dataPromise = getPostObject(req);
    }
    return dataPromise;
}
function executeAction(config, areaName, controllerName, actionName, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let areas = config.areas || {};
        let controllers;
        let area = areas[areaName];
        if (typeof area == 'string') {
            controllers = {};
            let controllerPhysicalPath = path.join(__dirname, ROOT_PATH, areas[areaName]);
            let files = fs.readdirSync(controllerPhysicalPath);
            files.forEach(fileName => {
                let arr = fileName.split('.');
                if (arr[arr.length - 1] == null || arr[arr.length - 1].toLowerCase() != 'js')
                    return;
                //========================
                // 去掉末尾的文件扩展名
                arr.pop();
                //========================
                fileName = arr.join('.');
                controllers[fileName] = path.join(areas[areaName], fileName);
            });
        }
        else {
            controllers = area;
        }
        if (controllers == null)
            throw errors.controlAreaNotExists(areaName);
        let controllerPath = controllers[controllerName];
        if (!controllerPath) {
            throw errors.controllerNotExist(controllerName);
        }
        controllerPath = path.join(ROOT_PATH, controllers[controllerName]);
        let controller;
        try {
            let mod = require(controllerPath);
            console.assert(mod != null);
            controller = mod.default || mod;
            let controller_type = typeof (controller);
            if (controller_type == 'function') {
                controller = isClass(controller) ? new controller(req, res) : controller(req, res);
            }
        }
        catch (err) {
            throw errors.loadControllerFail(controllerName, err);
        }
        let action = controller[actionName];
        if (action == null) {
            console.log(`Action '${actionName}' is not exists in '${controllerName}'`);
            throw errors.actionNotExists(actionName, controllerName);
        }
        let dataPromise;
        if (req.method == 'GET') {
            let queryData = getQueryObject(req);
            dataPromise = Promise.resolve(queryData);
        }
        else {
            dataPromise = getPostObject(req);
        }
        let data = yield dataPromise;
        try {
            let result = action.apply(controller, [data, req, res]);
            if (result.then != null && result.catch != null) {
                result.then(r => {
                    outputResult(r, res);
                }).catch(e => {
                    outputError(e, res);
                });
                return;
            }
            outputResult(result, res);
        }
        catch (err) {
            outputError(err, res);
        }
    });
}
/**
 *
 * @param request 获取 QueryString 里的对象
 */
function getQueryObject(request) {
    let contentType = request.headers['content-type'];
    let obj = {};
    if (contentType != null && contentType.indexOf('application/json') >= 0) {
        let arr = (request.url || '').split('?');
        let str = arr[1];
        if (str != null) {
            str = decodeURI(str);
            obj = JSON.parse(str); //TODO：异常处理
        }
    }
    else {
        let urlInfo = url.parse(request.url || '');
        let { search } = urlInfo;
        if (search) {
            obj = querystring.parse(search.substr(1));
        }
    }
    return obj;
}
function getPostObject(request) {
    let length = request.headers['content-length'] || 0;
    let contentType = request.headers['content-type'];
    if (length <= 0)
        return Promise.resolve({});
    return new Promise((reslove, reject) => {
        request.on('data', (data) => {
            let text = data.toString();
            try {
                let obj;
                if (contentType.indexOf('application/json') >= 0) {
                    obj = JSON.parse(text);
                }
                else {
                    obj = querystring.parse(text);
                }
                reslove(obj);
            }
            catch (exc) {
                let err = errors.postDataNotJSON(text);
                console.assert(err != null);
                reject(err);
            }
        });
    });
}
exports.contentTypes = {
    application_json: 'application/json',
    text_plain: 'text/plain',
};
function outputResult(result, res) {
    result = result === undefined ? null : result;
    let contentResult;
    if (result instanceof ContentResult) {
        contentResult = result;
    }
    else {
        contentResult = typeof result == 'string' ?
            new ContentResult(result, exports.contentTypes.text_plain, 200) :
            new ContentResult(JSON.stringify(result), exports.contentTypes.application_json, 200);
    }
    res.setHeader("content-type", contentResult.contentType || exports.contentTypes.text_plain);
    res.statusCode = contentResult.statusCode || 200;
    res.end(contentResult.data);
}
function outputError(err, res) {
    console.assert(err != null, 'error is null');
    const defaultErrorStatusCode = 600;
    res.setHeader("content-type", exports.contentTypes.application_json);
    res.statusCode = defaultErrorStatusCode;
    res.statusMessage = err.name; // statusMessage 不能为中文，否则会出现 invalid chartset 的异常
    if (/^\d\d\d\s/.test(err.name)) {
        res.statusCode = Number.parseInt(err.name.substr(0, 3));
        err.name = err.name.substr(4);
    }
    let outputObject = errorOutputObject(err);
    // if (err.innerError) {
    //     outputObject['innerError'] = err.innerError
    // }
    let str = JSON.stringify(outputObject);
    res.write(str);
    res.end();
}
function errorOutputObject(err) {
    let outputObject = { message: err.message, name: err.name, stack: err.stack };
    if (err.innerError) {
        outputObject['innerError'] = errorOutputObject(err.innerError);
    }
    return outputObject;
}
class ContentResult {
    constructor(data, contentType, statusCode) {
        this.data = data;
        this.contentType = contentType;
        this.statusCode = statusCode == null ? 200 : statusCode;
    }
}
exports.ContentResult = ContentResult;
//# sourceMappingURL=server.js.map