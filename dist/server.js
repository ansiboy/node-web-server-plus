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
const controller_loader_1 = require("./controller-loader");
function startServer(config) {
    let controllerLoader = new controller_loader_1.ControllerLoader(config.areas || {}, config.rootPath || "./");
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