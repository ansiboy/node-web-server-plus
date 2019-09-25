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
const http = require("http");
const errors = require("./errors");
const url = require("url");
const path = require("path");
const controller_loader_1 = require("./controller-loader");
const nodeStatic = require("maishu-node-static");
const action_results_1 = require("./action-results");
const attributes_1 = require("./attributes");
let packageInfo = require('../package.json');
function startServer(config) {
    if (!config)
        throw errors.arugmentNull('config');
    let controllerDirectories = [];
    if (config.controllerDirectory) {
        if (typeof config.controllerDirectory == 'string')
            controllerDirectories.push(config.controllerDirectory);
        else
            controllerDirectories = config.controllerDirectory;
    }
    for (let i = 0; i < controllerDirectories.length; i++) {
        if (!path.isAbsolute(controllerDirectories[i]))
            throw errors.notAbsolutePath(controllerDirectories[i]);
    }
    if (config.staticRootDirectory && !path.isAbsolute(config.staticRootDirectory))
        throw errors.notAbsolutePath(config.staticRootDirectory);
    let serverContext = { data: {}, controllerDefines: [] };
    let controllerLoader;
    if (controllerDirectories.length > 0)
        controllerLoader = new controller_loader_1.ControllerLoader(serverContext, controllerDirectories);
    let fileServer = null;
    if (config.staticRootDirectory) {
        fileServer = new nodeStatic.Server(config.staticRootDirectory, {
            virtualPaths: config.virtualPaths,
            serverInfo: `maishu-node-mvc ${packageInfo.version} ${config.serverName}`,
            gzip: true,
        });
        let fileServer_resolve = fileServer.resolve;
        fileServer.resolve = function (pathname, req) {
            return fileServer_resolve.apply(fileServer, [pathname, req]);
        };
    }
    let server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
        if (config.headers) {
            for (let key in config.headers) {
                res.setHeader(key, config.headers[key]);
            }
        }
        if (req.method == 'OPTIONS') {
            res.end();
            return;
        }
        try {
            if (config.authenticate) {
                let r = yield config.authenticate(req, res, serverContext);
                if (r) {
                    outputResult(r, res, req);
                    return;
                }
            }
            if (config.actionFilters) {
                let actionFilters = config.actionFilters || [];
                for (let i = 0; i < actionFilters.length; i++) {
                    let result = yield actionFilters[i](req, res, serverContext);
                    if (result != null) {
                        outputResult(result, res, req);
                        return;
                    }
                }
            }
            let requestUrl = getRequestUrl(req);
            let urlInfo = url.parse(requestUrl);
            let pathName = urlInfo.pathname || '';
            if (pathName == "/socket.io/socket.io.js") {
                return;
            }
            let r = null;
            if (controllerLoader) {
                r = controllerLoader.getAction(pathName, serverContext);
            }
            if (r != null && r.action != null && r.controller != null) {
                return executeAction(serverContext, r.controller, r.action, r.routeData, req, res);
            }
            //=====================================================================
            // 处理 URL 转发
            if (config.proxy) {
                for (let key in config.proxy) {
                    let regex = new RegExp(key);
                    let reqUrl = req.url || '';
                    let arr = regex.exec(reqUrl);
                    if (arr != null && arr.length > 0) {
                        let proxyItem = typeof config.proxy[key] == 'object' ? config.proxy[key] : { targetUrl: config.proxy[key] };
                        let targetUrl = proxyItem.targetUrl;
                        targetUrl = targetUrl.replace(/\$(\d+)/, (match, number) => {
                            if (arr == null)
                                throw errors.unexpectedNullValue('arr');
                            return typeof arr[number] != 'undefined' ? arr[number] : match;
                        });
                        let headers = undefined;
                        if (typeof proxyItem.headers == 'function') {
                            let r = proxyItem.headers(req);
                            let p = r;
                            if (p != null && p.then && p.catch) {
                                headers = yield p;
                            }
                            else {
                                headers = r;
                            }
                        }
                        else if (typeof proxyItem.headers == 'object') {
                            headers = proxyItem.headers;
                        }
                        yield proxyRequest(targetUrl, req, res, req.method, headers);
                        return;
                    }
                }
            }
            //=====================================================================
            if (fileServer) {
                fileServer.serve(req, res);
                return;
            }
            throw errors.pageNotFound(requestUrl);
        }
        catch (err) {
            outputError(err, res);
        }
    }));
    server.on('error', (err) => {
        console.log(err);
    });
    server.listen(config.port, config.bindIP);
    return { server };
}
exports.startServer = startServer;
function executeAction(serverContext, controller, action, routeData, req, res) {
    if (!controller)
        throw errors.arugmentNull("controller");
    if (!action)
        throw errors.arugmentNull("action");
    if (!req)
        throw errors.arugmentNull("req");
    if (!res)
        throw errors.arugmentNull("res");
    routeData = routeData || {};
    let parameterDecoders = [];
    parameterDecoders = Reflect.getMetadata(attributes_1.metaKeys.parameter, controller, action.name) || [];
    parameterDecoders.sort((a, b) => a.parameterIndex < b.parameterIndex ? -1 : 1);
    let parameters = [];
    return Promise.all(parameterDecoders.map(p => p.createParameter(req, res, serverContext, routeData))).then(r => {
        parameters = r;
        let actionResult = action.apply(controller, parameters);
        let p = actionResult;
        if (p == null || p.then == null) {
            p = Promise.resolve(p);
        }
        return p;
    }).then((r) => {
        return outputResult(r, res, req);
    }).catch(err => {
        return outputError(err, res);
    }).finally(() => {
        for (let i = 0; i < parameterDecoders.length; i++) {
            let d = parameterDecoders[i];
            if (d.disposeParameter) {
                d.disposeParameter(parameters[d.parameterIndex]);
            }
        }
    });
}
function outputResult(result, res, req) {
    return __awaiter(this, void 0, void 0, function* () {
        result = result === undefined ? null : result;
        let contentResult;
        if (isContentResult(result)) {
            contentResult = result;
        }
        else {
            contentResult = typeof result == 'string' ?
                new action_results_1.ContentResult(result, action_results_1.contentTypes.textPlain, 200) :
                new action_results_1.ContentResult(JSON.stringify(result), action_results_1.contentTypes.applicationJSON, 200);
        }
        yield contentResult.execute(res, req);
        res.end();
    });
}
function isContentResult(result) {
    if (result == null)
        return false;
    let r = result;
    if (r.execute !== undefined)
        return true;
    return false;
}
function outputError(err, res) {
    if (err == null) {
        err = new Error(`Unkonwn error because original error is null.`);
        err.name = 'nullError';
    }
    const defaultErrorStatusCode = 600;
    res.setHeader("content-type", action_results_1.contentTypes.applicationJSON);
    res.statusCode = err.statusCode || defaultErrorStatusCode;
    res.statusMessage = err.name; // statusMessage 不能为中文，否则会出现 invalid chartset 的异常
    if (/^\d\d\d\s/.test(err.name)) {
        res.statusCode = Number.parseInt(err.name.substr(0, 3));
        err.name = err.name.substr(4);
    }
    let outputObject = errorOutputObject(err);
    let str = JSON.stringify(outputObject);
    res.write(str);
    res.end();
}
exports.outputError = outputError;
function errorOutputObject(err) {
    let outputObject = { message: err.message, name: err.name, stack: err.stack };
    if (err.innerError) {
        outputObject['innerError'] = errorOutputObject(err.innerError);
    }
    return outputObject;
}
function proxyRequest(targetUrl, req, res, method, headers) {
    return new Promise((resolve, reject) => {
        let request = createTargetResquest(targetUrl, req, res, method, headers);
        request.on('error', function (err) {
            debugger;
            // outputError(err, res);
            reject(err);
        });
        request.on("close", () => {
            debugger;
            resolve();
        });
    });
}
exports.proxyRequest = proxyRequest;
function createTargetResquest(targetUrl, req, res, method, headers) {
    headers = headers || {};
    headers = Object.assign(req.headers, headers);
    //=====================================================
    // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
    delete headers.host;
    //=====================================================
    let request = http.request(targetUrl, {
        method: method || req.method,
        headers: headers, timeout: 2000,
    }, (response) => {
        console.assert(response != null);
        for (var key in response.headers) {
            res.setHeader(key, response.headers[key] || '');
        }
        res.statusCode = response.statusCode || 200;
        res.statusMessage = response.statusMessage || '';
        response.pipe(res);
    });
    if (!req.readable)
        throw errors.requestNotReadable();
    req.on('data', (data) => {
        request.write(data);
    }).on('end', () => {
        request.end();
        req.resume();
    });
    return request;
}
function getRequestUrl(req) {
    let requestUrl = req.url || '';
    // 将一个或多个的 / 变为一个 /，例如：/shop/test// 转换为 /shop/test/
    requestUrl = requestUrl.replace(/\/+/g, '/');
    // 去掉路径末尾的 / ，例如：/shop/test/ 变为 /shop/test, 如果路径 / 则保持不变
    if (requestUrl[requestUrl.length - 1] == '/' && requestUrl.length > 1)
        requestUrl = requestUrl.substr(0, requestUrl.length - 1);
    return requestUrl;
}
