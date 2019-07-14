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
const path = require("path");
const controller_loader_1 = require("./controller-loader");
const nodeStatic = require("maishu-node-static");
const action_results_1 = require("./action-results");
const attributes_1 = require("./attributes");
let packageInfo = require('../package.json');
const DefaultControllerPath = 'controllers';
const DefaultStaticFileDirectory = 'public';
function startServer(config) {
    if (!config)
        throw errors.arugmentNull('config');
    if (!config.rootPath)
        throw errors.rootPathNull();
    if (!path.isAbsolute(config.rootPath))
        throw errors.rootPathNotAbsolute(config.rootPath);
    if (!config.controllerDirectory)
        config.controllerDirectory = DefaultControllerPath;
    if (!config.staticRootDirectory)
        config.staticRootDirectory = DefaultStaticFileDirectory;
    let controllerDirectories = [];
    if (config.controllerDirectory) {
        if (typeof config.controllerDirectory == 'string')
            controllerDirectories.push(config.controllerDirectory);
        else
            controllerDirectories = config.controllerDirectory;
    }
    for (let i = 0; i < controllerDirectories.length; i++) {
        if (!path.isAbsolute(controllerDirectories[i]))
            controllerDirectories[i] = path.join(config.rootPath, controllerDirectories[i]);
    }
    // config.controllerDirectory = path.join(config.rootPath, config.controllerDirectory)
    if (!path.isAbsolute(config.staticRootDirectory))
        config.staticRootDirectory = path.join(config.rootPath, config.staticRootDirectory);
    let controllerLoader = new controller_loader_1.ControllerLoader(controllerDirectories);
    // let externalPaths: string[] = []
    // if (config.staticExternalDirectories != null && config.staticExternalDirectories.length > 0) {
    //     for (let i = 0; i < config.staticExternalDirectories.length; i++) {
    //         let item = config.staticExternalDirectories[i]
    //         externalPaths.push(item)
    //     }
    // }
    // for (let i = 0; i < externalPaths.length; i++) {
    //     if (!path.isAbsolute(externalPaths[i])) {
    //         externalPaths[i] = path.join(config.rootPath, externalPaths[i]);
    //     }
    //     else {
    //         externalPaths[i] = path.normalize(externalPaths[i]);
    //     }
    // }
    let fileServer;
    fileServer = new nodeStatic.Server(config.staticRootDirectory, {
        // externalPaths,
        virtualPaths: config.virtualPaths,
        serverInfo: `maishu-node-mvc ${packageInfo.version}`,
        gzip: true
    });
    let fileServer_resolve = fileServer.resolve;
    fileServer.resolve = function (pathname, req) {
        return fileServer_resolve.apply(fileServer, [pathname, req]);
    };
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
                let r = yield config.authenticate(req, res);
                if (r == null)
                    throw errors.authenticateResultNull();
                if (r.errorResult) {
                    outputResult(r.errorResult, res, req);
                    return;
                }
            }
            if (config.actionFilters) {
                let actionFilters = config.actionFilters || [];
                for (let i = 0; i < actionFilters.length; i++) {
                    let result = yield actionFilters[i](req, res);
                    if (result != null) {
                        outputResult(result, res, req);
                        return;
                    }
                }
            }
            let requestUrl = req.url || '';
            let urlInfo = url.parse(requestUrl);
            let pathName = urlInfo.pathname || '';
            let { action, controller, routeData } = controllerLoader.getAction(pathName);
            if (action != null && controller != null) {
                executeAction(controller, action, routeData, req, res);
                return;
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
                            // let headers
                            if (p != null && p.then && p.catch) {
                                // p.then(d => {
                                //     headers = d
                                // }).catch(err => {
                                //     outputError(err, res)
                                //     return
                                // })
                                headers = yield p;
                            }
                            else {
                                headers = r;
                            }
                        }
                        else if (typeof proxyItem.headers == 'object') {
                            headers = proxyItem.headers;
                        }
                        proxyRequest(targetUrl, req, res, headers);
                        return;
                    }
                }
            }
            //=====================================================================
            fileServer.serve(req, res);
        }
        catch (err) {
            outputError(err, res);
        }
    }));
    server.on('error', (err) => {
        console.log(err);
    });
    server.listen(config.port, config.bindIP);
    return { staticServer: fileServer };
}
exports.startServer = startServer;
function executeAction(controller, action, routeData, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let parameters = [];
        let parameterDecoders = []; //& { parameterValue?: any }
        parameterDecoders = Reflect.getMetadata(attributes_1.metaKeys.parameter, controller, action.name) || [];
        for (let i = 0; i < parameterDecoders.length; i++) {
            let metaData = parameterDecoders[i];
            let parameterValue = yield metaData.createParameter(req, routeData);
            parameters[metaData.parameterIndex] = parameterValue;
        }
        let actionResult = action.apply(controller, parameters);
        let p = actionResult;
        if (p != null && p.then && p.catch) {
            let disposeParameter = () => {
                for (let i = 0; i < parameterDecoders.length; i++) {
                    let d = parameterDecoders[i];
                    if (d.disposeParameter) {
                        d.disposeParameter(parameters[d.parameterIndex]);
                    }
                }
            };
            p.then(r => {
                outputResult(r, res, req);
                disposeParameter();
            }).catch(err => {
                outputError(err, res);
                disposeParameter();
            });
            return;
        }
        outputResult(actionResult, res, req);
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
function proxyRequest(targetUrl, req, res, headers) {
    return new Promise((resolve, reject) => {
        let request = createTargetResquest(targetUrl, req, res, headers);
        request.on('error', function (err) {
            outputError(err, res);
            reject(err);
        });
        request.on("close", () => {
            resolve();
        });
        req.on('data', (data) => {
            request.write(data);
        });
        req.on('end', () => {
            request.end();
        });
    });
}
exports.proxyRequest = proxyRequest;
function createTargetResquest(targetUrl, req, res, headers) {
    let u = url.parse(targetUrl);
    let { protocol, hostname, port, path } = u;
    // let headers: any = req.headers;
    headers = headers || {};
    headers = Object.assign(req.headers, headers);
    let request = http.request({
        protocol, hostname, port, path,
        method: req.method,
        headers: headers,
    }, (response) => {
        console.assert(response != null);
        for (var key in response.headers) {
            res.setHeader(key, response.headers[key] || '');
        }
        res.statusCode = response.statusCode || 200;
        res.statusMessage = response.statusMessage || '';
        response.pipe(res);
    });
    return request;
}
//# sourceMappingURL=server.js.map