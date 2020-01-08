import http = require('http')
import errors = require('./errors');
import url = require('url');
import path = require('path')
import { ControllerLoader } from './controller-loader';
import nodeStatic = require('maishu-node-static')
import { ContentResult, contentTypes } from './action-results';
import { metaKeys, ActionParameterDecoder } from './attributes';
import { getLogger } from './logger';
import { LOG_CATEGORY_NAME } from './constants';
import { Settings, ProxyItem, ActionResult, ServerContext, ProxyPipe } from './types';
import fs = require("fs");

let packageInfo = require('../package.json')

export function startServer(settings: Settings) {
    if (!settings) throw errors.arugmentNull('config')
    let logger = getLogger(LOG_CATEGORY_NAME, settings.logLevel);

    let serverContext: ServerContext = {
        controllerDefines: [], logLevel: settings.logLevel, data: settings.serverContextData
    };

    let controllerLoader: ControllerLoader;
    if (settings.controllerDirectory) {
        let controllerDir = settings.controllerDirectory;
        controllerLoader = new ControllerLoader(serverContext, controllerDir);
    }

    let fileServer: nodeStatic.Server | null = null;
    let staticRoot = settings.staticRootDirectory;
    if (staticRoot == null) {
        staticRoot = new nodeStatic.VirtualDirectory();
    }

    if (settings.virtualPaths) {
        for (let key in settings.virtualPaths) {
            let virtualPath = key
            let physicalPath = settings.virtualPaths[key];
            if (fs.existsSync(physicalPath) == false)
                throw errors.virtualPathConfigError(virtualPath, physicalPath);

            if (fs.statSync(physicalPath).isDirectory()) {
                staticRoot.addVirtualDirectory(virtualPath, physicalPath, "merge");
            }
            else {
                staticRoot.addVirtualFile(virtualPath, physicalPath);
            }
        }
    }

    fileServer = new nodeStatic.Server(staticRoot, {
        serverInfo: `maishu-node-mvc ${packageInfo.version} ${settings.serverName}`,
    })

    let server = http.createServer(async (req, res) => {
        if (settings.headers) {
            for (let key in settings.headers) {
                res.setHeader(key, settings.headers[key])
            }
        }
        if (req.method == 'OPTIONS') {
            res.end()
            return
        }
        try {
            if (settings.authenticate) {
                logger.info("Settings authenticate function is set and use it to auth the user.");
                let r = await settings.authenticate(req, res, serverContext);
                if (r) {
                    logger.warn("Settings authenticate function auth user fail.");
                    outputResult(r, res, req, serverContext);
                    return
                }
            }

            if (settings.requestFilters) {
                logger.info("Settings requestFilters is not null.");
                let actionFilters = settings.requestFilters || []
                for (let i = 0; i < actionFilters.length; i++) {
                    let result = await actionFilters[i](req, res, serverContext);
                    if (result != null) {
                        outputResult(result, res, req, serverContext)
                        return
                    }
                }
            }

            let requestUrl = getRequestUrl(req);
            let urlInfo = url.parse(requestUrl);
            let pathName = urlInfo.pathname || '';

            if (pathName == "/socket.io/socket.io.js") {
                return
            }

            let r: ReturnType<ControllerLoader["getAction"]> | null = null;
            if (controllerLoader) {
                r = controllerLoader.getAction(pathName, serverContext);
            }

            if (r != null) {
                console.assert(r.action != null);
                console.assert(r.controller != null);
                return executeAction(serverContext, r.controller, r.action, r.routeData, req, res);
            }

            //=====================================================================
            // 处理 URL 转发
            if (settings.proxy) {
                for (let key in settings.proxy) {
                    let regex = new RegExp(key)
                    let reqUrl = req.url || ''
                    let arr = regex.exec(reqUrl)
                    if (arr == null || arr.length == 0) {
                        continue;
                    }

                    let proxyItem: ProxyItem = typeof settings.proxy[key] == 'object' ? settings.proxy[key] as ProxyItem : { targetUrl: settings.proxy[key] } as ProxyItem
                    let targetUrl = proxyItem.targetUrl

                    let regex1 = /\$(\d+)/g;
                    if (regex1.test(targetUrl)) {
                        targetUrl = targetUrl.replace(regex1, (match, number) => {
                            if (arr == null) throw errors.unexpectedNullValue('arr')

                            return typeof arr[number] != 'undefined' ? arr[number] : match;
                        })
                    }

                    let headers: { [key: string]: string } | undefined = undefined
                    if (typeof proxyItem.headers == 'function') {
                        let r = proxyItem.headers(req)
                        let p = r as Promise<any>
                        if (p != null && p.then && p.catch) {
                            headers = await p
                        }
                        else {
                            headers = r as { [key: string]: string }
                        }
                    }
                    else if (typeof proxyItem.headers == 'object') {
                        headers = proxyItem.headers
                    }

                    await proxyRequest(targetUrl, req, res, serverContext, req.method, headers, proxyItem.pipe);
                    return;
                }
            }
            //=====================================================================
            if (fileServer) {
                await fileServer.serve(req, res)
                return;
            }

            throw errors.pageNotFound(requestUrl);

        }
        catch (err) {
            outputError(err, res)
        }
    });

    server.on('error', (err) => {
        logger.error(err);
    })

    if (settings.port != null) {
        server.listen(settings.port, settings.bindIP)
    }

    return { server };
}

function executeAction(serverContext: ServerContext, controller: object, action: Function, routeData: { [key: string]: string } | null,
    req: http.IncomingMessage, res: http.ServerResponse) {

    if (!controller)
        throw errors.arugmentNull("controller")

    if (!action)
        throw errors.arugmentNull("action")

    if (!req)
        throw errors.arugmentNull("req");

    if (!res)
        throw errors.arugmentNull("res");

    routeData = routeData || {};

    let parameterDecoders: (ActionParameterDecoder<any>)[] = [];
    parameterDecoders = Reflect.getMetadata(metaKeys.parameter, controller, action.name) || [];
    parameterDecoders.sort((a, b) => a.parameterIndex < b.parameterIndex ? -1 : 1);
    let parameters: object[] = []
    return Promise.all(parameterDecoders.map(p => p.createParameter(req, res, serverContext, routeData))).then(r => {
        parameters = r;
        let actionResult = action.apply(controller, parameters);
        let p = actionResult as Promise<any>;
        if (p == null || p.then == null) {
            p = Promise.resolve(p);
        }
        return p;
    }).then((r) => {
        return outputResult(r, res, req, serverContext);
    }).catch(err => {
        return outputError(err, res);
    }).finally(() => {
        for (let i = 0; i < parameterDecoders.length; i++) {
            let d = parameterDecoders[i]
            if (d.disposeParameter) {
                d.disposeParameter(parameters[d.parameterIndex])
            }
        }
    })
}

async function outputResult(result: object | null, res: http.ServerResponse, req: http.IncomingMessage, serverContext: ServerContext) {
    result = result === undefined ? null : result
    let contentResult: ActionResult
    if (isContentResult(result)) {
        contentResult = result as ActionResult
    }
    else {
        contentResult = typeof result == 'string' ?
            new ContentResult(result, contentTypes.textPlain, 200) :
            new ContentResult(JSON.stringify(result), contentTypes.applicationJSON, 200)
    }

    await contentResult.execute(res, req, serverContext);
    res.end()
}

function isContentResult(result: object | null) {
    if (result == null)
        return false

    let r = result as ActionResult
    if (r.execute !== undefined)
        return true

    return false
}

export function outputError(err: Error, res: http.ServerResponse) {
    if (err == null) {
        err = new Error(`Unkonwn error because original error is null.`)
        err.name = 'nullError'
    }

    const defaultErrorStatusCode = 600;

    res.setHeader("content-type", contentTypes.applicationJSON);
    res.statusCode = err.statusCode || defaultErrorStatusCode;
    res.statusMessage = err.name;      // statusMessage 不能为中文，否则会出现 invalid chartset 的异常

    if (/^\d\d\d\s/.test(err.name)) {
        res.statusCode = Number.parseInt(err.name.substr(0, 3));
        err.name = err.name.substr(4);
    }

    let outputObject = errorOutputObject(err)
    let str = JSON.stringify(outputObject);
    res.write(str);
    res.end();
}

function errorOutputObject(err: Error) {
    let outputObject = { message: err.message, name: err.name, stack: err.stack };
    if (err.innerError) {
        (outputObject as any)['innerError'] = errorOutputObject(err.innerError)
    }

    return outputObject
}

export function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext,
    method?: string, headers?: http.IncomingMessage["headers"], proxyPipe?: ProxyPipe) {


    headers = Object.assign({}, req.headers, headers || {});
    // headers = Object.assign(req.headers, headers);
    //=====================================================
    if (headers.host) {
        headers["delete-host"] = headers.host;
        // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
        delete headers.host;
    }

    if (proxyPipe == null) {
        return proxyRequestWithoutPipe(targetUrl, req, res, serverContext, headers, method)
    }

    return proxyRequestWithPipe(targetUrl, req, res, serverContext, proxyPipe, headers, method)
}

export async function proxyRequestWithPipe(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext,
    proxyPipe: ProxyPipe, headers: http.IncomingMessage["headers"], method?: string): Promise<any> {

    let logger = getLogger(LOG_CATEGORY_NAME, serverContext.logLevel);

    let p: ProxyPipe & { previous?: ProxyPipe } = proxyPipe;
    while (p.next) {
        (p.next as typeof p).previous = p;
        p = p.next;
    }

    return new Promise(function (resolve, reject) {

        let buffers: Buffer[] = [];
        req.on('data', (chunk: Buffer) => {
            buffers.push(chunk);
        }).on("error", (err) => {
            logger.error(err);
            reject(err);
        }).on('end', () => {
            let buffer = Buffer.concat(buffers);
            console.assert(p != null);

            let targetResponse: http.IncomingMessage;
            processPipeRequest(req, proxyPipe, buffer)
                .then(data => {
                    return sentRequest(data);
                })
                .then(([data, response]) => {
                    targetResponse = response;
                    return processPipeResponse(req, response, p, data);
                })
                .then((data) => {

                    console.assert(targetResponse != null);

                    for (var key in targetResponse.headers) {
                        res.setHeader(key, targetResponse.headers[key] || '');
                    }

                    res.statusCode = targetResponse.statusCode || 200;
                    res.statusMessage = targetResponse.statusMessage || '';

                    res.write(data);
                    res.end();

                    resolve(data);
                })
                .catch(err => {
                    reject(err)
                });
        });
    })

    /** 处理 pipe request */
    async function processPipeRequest(req: http.IncomingMessage, pipe: ProxyPipe, buffer: Buffer): Promise<Buffer> {
        let data: Buffer;
        if (!pipe.onRequest) {
            data = buffer;
        }
        else {
            let r = await pipe.onRequest({ req }, buffer);
            data = r || buffer;
        }

        if (pipe.next) {
            return processPipeRequest(req, pipe.next, data);
        }

        return data;
    }

    /** 处理 pipe response */
    async function processPipeResponse(req: http.IncomingMessage, res: http.IncomingMessage, pipe: typeof p, buffer: Buffer): Promise<Buffer> {
        let data: Buffer;
        if (!pipe.onResponse) {
            data = buffer;
        }
        else {
            let r = await pipe.onResponse({ req, res }, buffer);
            data = r || buffer;
        }

        if (pipe.previous) {
            return processPipeResponse(req, res, pipe.previous, data);
        }

        return data;
    }

    /** 转发请求 */
    function sentRequest(buffer: Buffer) {
        return new Promise<[Buffer, http.IncomingMessage]>((resolve, reject) => {
            let clientRequest = http.request(targetUrl,
                {
                    method: method || req.method,
                    headers: headers, timeout: 2000,
                },
                function (response) {
                    for (var key in response.headers) {
                        res.setHeader(key, response.headers[key] || '');
                    }
                    res.statusCode = response.statusCode || 200;
                    res.statusMessage = response.statusMessage || '';

                    let responseBuffers: Buffer[] = [];
                    response.on("data", function (chunk) {
                        responseBuffers.push(chunk);
                    }).on("end", function () {
                        let buffer = Buffer.concat(responseBuffers);
                        resolve([buffer, response])
                    }).on("error", (err) => {
                        reject(err);
                    })

                }
            );

            clientRequest.write(buffer);
        })
    }


}

export function proxyRequestWithoutPipe(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext,
    headers: http.IncomingMessage["headers"], method?: string) {
    return new Promise(function (resolve, reject) {
        headers = Object.assign({}, req.headers, headers || {});
        // headers = Object.assign(req.headers, headers);
        //=====================================================
        if (headers.host) {
            headers["delete-host"] = headers.host;
            // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
            delete headers.host;
        }

        //=====================================================
        let clientRequest = http.request(targetUrl,
            {
                method: method || req.method,
                headers: headers, timeout: 2000,
            },
            function (response) {
                for (var key in response.headers) {
                    res.setHeader(key, response.headers[key] || '');
                }
                res.statusCode = response.statusCode || 200;
                res.statusMessage = response.statusMessage || '';
                // if (proxyResponse) {
                //     proxyResponse(response, req, res);
                // }
                // else {
                response.pipe(res);
                // }

                response.on("end", () => resolve());
                response.on("error", err => reject(err));
                response.on("close", () => reject(errors.connectionClose()));
            }
        );

        if (!req.readable) {
            reject(errors.requestNotReadable());
        }


        req.on('data', (data) => {
            clientRequest.write(data);
        }).on('end', () => {
            clientRequest.end();
        }).on('error', (err) => {
            clientRequest.end();
            reject(err);
        });

        clientRequest.on("error", function (err) {
            let logger = getLogger(LOG_CATEGORY_NAME, serverContext.logLevel);
            logger.error(err);
            reject(err);
        });

        // clientRequest.on("finish", function () {
        //     resolve();
        // })
    })
}

function getRequestUrl(req: http.IncomingMessage) {
    let requestUrl = req.url || ''
    // 将一个或多个的 / 变为一个 /，例如：/shop/test// 转换为 /shop/test/
    requestUrl = requestUrl.replace(/\/+/g, '/');

    // 去掉路径末尾的 / ，例如：/shop/test/ 变为 /shop/test, 如果路径 / 则保持不变
    if (requestUrl[requestUrl.length - 1] == '/' && requestUrl.length > 1)
        requestUrl = requestUrl.substr(0, requestUrl.length - 1);

    return requestUrl;
}




