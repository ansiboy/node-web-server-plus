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
const path = require("path");
const controller_loader_1 = require("./controller-loader");
const nodeStatic = require("node-static");
const action_results_1 = require("./action-results");
const DefaultControllerPath = 'controllers';
const DefaultStaticFileDirectory = 'public';
function startServer(config, callbacks) {
    if (!config)
        throw errors.arugmentNull('config');
    if (!config.rootPath)
        throw errors.rootPathNull();
    if (!config.controllerDirectory)
        config.controllerDirectory = DefaultControllerPath;
    if (!config.staticFileDirectory)
        config.staticFileDirectory = DefaultStaticFileDirectory;
    if (!path.isAbsolute(config.controllerDirectory))
        config.controllerDirectory = path.join(config.rootPath, config.controllerDirectory);
    if (!path.isAbsolute(config.staticFileDirectory))
        config.staticFileDirectory = path.join(config.rootPath, config.staticFileDirectory);
    let controllerLoader = new controller_loader_1.ControllerLoader([config.controllerDirectory]);
    callbacks = callbacks || {};
    let fileServer;
    if (config.staticFileDirectory) {
        fileServer = new nodeStatic.Server(config.staticFileDirectory);
    }
    let server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
        // setHeaders(res)
        // res.setHeader('Content-Type', 'application/json;charset=utf-8');
        if (req.method == 'OPTIONS') {
            res.end();
            return;
        }
        try {
            //=====================================================================
            // 处理 URL 转发
            if (config.proxy) {
                for (let key in config.proxy) {
                    let regex = new RegExp(key);
                    let reqUrl = req.url || '';
                    let arr = regex.exec(reqUrl);
                    if (arr != null && arr.length > 0) {
                        let targetUrl = reqUrl.replace(/\$(\d+)/, (match, number) => {
                            if (arr == null)
                                throw errors.unexpectedNullValue('arr');
                            return typeof arr[number] != 'undefined' ? arr[number] : match;
                        });
                        proxyRequest(targetUrl, req, res);
                        return;
                    }
                }
            }
            //=====================================================================
            let requestUrl = req.url || '';
            let urlInfo = url.parse(requestUrl);
            let pathName = urlInfo.pathname || '';
            // let parsedPath = path.parse(pathName)
            // if (parsedPath.ext && fileServer) {
            //     fileServer.serve(req, res)
            //     return
            // }
            let { action, controller } = controllerLoader.getAction(pathName);
            if (action == null) {
                fileServer.serve(req, res);
                return;
            }
            let data = yield pareseActionArgument(req);
            if (!callbacks)
                throw errors.unexpectedNullValue('callbacks');
            if (callbacks.actionBeforeExecute)
                callbacks.actionBeforeExecute(pathName, req);
            let actionResult = action.apply(controller, [data, req, res]);
            let p = actionResult;
            if (p.then && p.catch) {
                p.then(r => {
                    outputResult(r, res);
                }).catch(err => {
                    outputError(err, res);
                });
                return;
            }
            if (callbacks.actionAfterExecute)
                callbacks.actionAfterExecute(pathName, req);
            outputResult(actionResult, res);
        }
        catch (err) {
            outputError(err, res);
        }
    }));
    server.on('error', (err) => {
        console.log(err);
    });
    server.listen(config.port, config.bindIP);
}
exports.startServer = startServer;
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
        var text = "";
        request.on('data', (data) => {
            text = text + data.toString();
        });
        request.on('end', () => {
            let obj;
            try {
                if (contentType.indexOf('application/json') >= 0) {
                    obj = JSON.parse(text);
                }
                else {
                    obj = querystring.parse(text);
                }
                reslove(obj);
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
// export const contentTypes = {
//     application_json: 'application/json',
//     text_plain: 'text/plain',
// }
function outputResult(result, res) {
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
    // res.setHeader("content-type", contentResult.contentType || contentTypes.text_plain);
    // res.statusCode = contentResult.statusCode || 200;
    // res.end(contentResult.data);
    contentResult.execute(res);
    res.end();
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
function errorOutputObject(err) {
    let outputObject = { message: err.message, name: err.name, stack: err.stack };
    if (err.innerError) {
        outputObject['innerError'] = errorOutputObject(err.innerError);
    }
    return outputObject;
}
// export class ContentResult {
//     data: string | Buffer
//     statusCode: number
//     contentType: string
//     constructor(data: string | Buffer, contentType: string, statusCode?: number) {
//         this.data = data
//         this.contentType = contentType
//         this.statusCode = statusCode == null ? 200 : statusCode
//     }
// }
function proxyRequest(targetUrl, req, res) {
    let request = createTargetResquest(targetUrl, req, res);
    request.on('error', function (err) {
        outputError(err, res);
    });
    req.on('data', (data) => {
        request.write(data);
    });
    req.on('end', () => {
        request.end();
    });
}
function createTargetResquest(targetUrl, req, res) {
    let u = url.parse(targetUrl);
    let { protocol, host, port, path } = u;
    let headers = req.headers;
    let request = http.request({
        protocol, host, port, path,
        method: req.method,
        headers: headers,
    }, (response) => {
        console.assert(response != null);
        // const StatusCodeGenerateToken = 666; // 生成 Token
        // if (response.statusCode == StatusCodeGenerateToken) {
        //     let responseContent: string;
        //     let contentType = response.headers['content-type'] as string;
        //     response.on('data', (data: ArrayBuffer) => {
        //         responseContent = data.toString();
        //     })
        //     response.on('end', () => {
        //         Token.create(responseContent, contentType)
        //             .then((o: Token) => {
        //                 res.setHeader("content-type", "application/json");
        //                 var obj = JSON.stringify({ token: o.id });
        //                 res.write(obj);
        //                 res.end();
        //             }).catch(err => {
        //                 outputError(res, err);
        //             })
        //     })
        // }
        // else {
        for (var key in response.headers) {
            res.setHeader(key, response.headers[key] || '');
        }
        res.statusCode = response.statusCode || 200;
        res.statusMessage = response.statusMessage || '';
        response.pipe(res);
        // }
    });
    return request;
}
//# sourceMappingURL=server.js.map