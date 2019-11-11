import http = require('http')
import errors = require('./errors');
import url = require('url');
import path = require('path')
import { ControllerLoader } from './controller-loader';
import nodeStatic = require('maishu-node-static')
import { ActionResult, ContentResult, contentTypes } from './action-results';
import { metaKeys, ActionParameterDecoder } from './attributes';
import { ServerContext } from './server-context';
import { LogLevel, getLogger } from './logger';
import { LOG_CATEGORY_NAME } from './constants';

let packageInfo = require('../package.json')

interface ProxyItem {
    targetUrl: string,
    rewrite?: [string, string],
    headers?: { [name: string]: string } | ((req: http.IncomingMessage) => { [name: string]: string } | Promise<{ [name: string]: string }>)
}

export interface Settings {
    port: number,
    bindIP?: string,
    controllerDirectory?: string | string[],
    staticRootDirectory?: string,
    proxy?: { [path_pattern: string]: string | ProxyItem },
    authenticate?: (req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext) => Promise<ActionResult | null>,
    actionFilters?: ((req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext) => Promise<ActionResult | null>)[],
    serverName?: string,
    /** 设置默认的 Http Header */
    headers?: { [name: string]: string }
    virtualPaths?: { [virtualPath: string]: string },
    logLevel?: LogLevel
}

export function startServer(settings: Settings) {
    if (!settings) throw errors.arugmentNull('config')
    let logger = getLogger(LOG_CATEGORY_NAME, settings.logLevel);

    let controllerDirectories: string[] = []
    if (settings.controllerDirectory) {
        if (typeof settings.controllerDirectory == 'string')
            controllerDirectories.push(settings.controllerDirectory)
        else
            controllerDirectories = settings.controllerDirectory
    }

    for (let i = 0; i < controllerDirectories.length; i++) {
        if (!path.isAbsolute(controllerDirectories[i]))
            throw errors.notAbsolutePath(controllerDirectories[i]);
    }

    if (settings.staticRootDirectory && !path.isAbsolute(settings.staticRootDirectory))
        throw errors.notAbsolutePath(settings.staticRootDirectory);

    let serverContext: ServerContext = { data: {}, controllerDefines: [] };

    let controllerLoader: ControllerLoader;
    if (controllerDirectories.length > 0)
        controllerLoader = new ControllerLoader(serverContext, controllerDirectories);

    let fileServer: nodeStatic.Server | null = null;
    if (settings.staticRootDirectory) {
        fileServer = new nodeStatic.Server(settings.staticRootDirectory, {
            virtualPaths: settings.virtualPaths,
            serverInfo: `maishu-node-mvc ${packageInfo.version} ${settings.serverName}`,
            gzip: true,
        })

        let fileServer_resolve = fileServer.resolve
        fileServer.resolve = function (pathname: string, req: http.IncomingMessage) {
            return fileServer_resolve.apply(fileServer, [pathname, req])
        }
    }

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
                    outputResult(r, res, req)
                    return
                }
            }

            if (settings.actionFilters) {
                logger.info("Settings actionFilters is not null.");
                let actionFilters = settings.actionFilters || []
                for (let i = 0; i < actionFilters.length; i++) {
                    let result = await actionFilters[i](req, res, serverContext)
                    if (result != null) {
                        outputResult(result, res, req)
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

            if (r != null && r.action != null && r.controller != null) {
                return executeAction(serverContext, r.controller, r.action, r.routeData, req, res);
            }

            //=====================================================================
            // 处理 URL 转发
            if (settings.proxy) {
                for (let key in settings.proxy) {
                    let regex = new RegExp(key)
                    let reqUrl = req.url || ''
                    let arr = regex.exec(reqUrl)
                    if (arr != null && arr.length > 0) {
                        let proxyItem: ProxyItem = typeof settings.proxy[key] == 'object' ? settings.proxy[key] as ProxyItem : { targetUrl: settings.proxy[key] } as ProxyItem
                        let targetUrl = proxyItem.targetUrl

                        let regex = /\$(\d+)/g;
                        if (regex.test(targetUrl)) {
                            targetUrl = targetUrl.replace(regex, (match, number) => {
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
                        await proxyRequest(targetUrl, req, res, req.method, headers);
                        return
                    }
                }
            }
            //=====================================================================
            if (fileServer) {
                fileServer.serve(req, res)
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

    server.listen(settings.port, settings.bindIP)

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
        return outputResult(r, res, req);
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

async function outputResult(result: object | null, res: http.ServerResponse, req: http.IncomingMessage) {
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

    await contentResult.execute(res, req)
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

export function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, method?: string, headers?: { [key: string]: string }) {
    return new Promise((resolve, reject) => {
        let request = createTargetResquest(targetUrl, req, res, method, headers);

        request.on('error', function (err) {
            debugger
            // outputError(err, res);
            reject(err);
        })

        request.on("finish", () => {
            // debugger
            resolve();
        })


    })
}

function createTargetResquest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, method?: string, headers?: { [key: string]: string }) {
    headers = headers || {};
    headers = Object.assign(req.headers, headers);
    //=====================================================
    // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
    delete headers.host;
    //=====================================================
    let request = http.request(targetUrl,
        {
            method: method || req.method,
            headers: headers, timeout: 2000,
        },
        (response) => {
            console.assert(response != null);

            for (var key in response.headers) {
                res.setHeader(key, response.headers[key] || '');
            }
            res.statusCode = response.statusCode || 200;
            res.statusMessage = response.statusMessage || ''
            response.pipe(res);
        }
    );

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

function getRequestUrl(req: http.IncomingMessage) {
    let requestUrl = req.url || ''
    // 将一个或多个的 / 变为一个 /，例如：/shop/test// 转换为 /shop/test/
    requestUrl = requestUrl.replace(/\/+/g, '/');

    // 去掉路径末尾的 / ，例如：/shop/test/ 变为 /shop/test, 如果路径 / 则保持不变
    if (requestUrl[requestUrl.length - 1] == '/' && requestUrl.length > 1)
        requestUrl = requestUrl.substr(0, requestUrl.length - 1);

    return requestUrl;
}




