import http = require('http')
import errors = require('./errors');
import url = require('url');
import path = require('path')
import { ControllerLoader } from './controller-loader';
import nodeStatic = require('maishu-node-static')
import { ActionResult, ContentResult, contentTypes } from './action-results';
import { metaKeys, ActionParameterDecoder } from './attributes';

let packageInfo = require('../package.json')

const DefaultControllerPath = 'controllers'
const DefaultStaticFileDirectory = 'public'

interface ProxyItem {
    targetUrl: string,
    headers?: { [name: string]: string } | ((req: http.IncomingMessage) => { [name: string]: string } | Promise<{ [name: string]: string }>)
}

// interface ExternalDirectory {
//     path: string
//     alias?: string
// }

export interface Config {
    port: number,
    rootPath: string,
    bindIP?: string,
    controllerDirectory?: string | string[],
    staticRootDirectory?: string,
    proxy?: { [path_pattern: string]: string | ProxyItem },
    authenticate?: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<{ errorResult: ActionResult }>,
    actionFilters?: ((req: http.IncomingMessage, res: http.ServerResponse) => Promise<ActionResult>)[],
    // staticExternalDirectories?: string[],

    /** 设置默认的 Http Header */
    headers?: { [name: string]: string }
    virtualPaths?: { [virtualPath: string]: string }
}

export function startServer(config: Config) {
    if (!config) throw errors.arugmentNull('config')
    if (!config.rootPath) throw errors.rootPathNull()
    if (!path.isAbsolute(config.rootPath))
        throw errors.rootPathNotAbsolute(config.rootPath);

    if (!config.controllerDirectory)
        config.controllerDirectory = DefaultControllerPath

    if (!config.staticRootDirectory)
        config.staticRootDirectory = DefaultStaticFileDirectory



    let controllerDirectories: string[] = []
    if (config.controllerDirectory) {
        if (typeof config.controllerDirectory == 'string')
            controllerDirectories.push(config.controllerDirectory)
        else
            controllerDirectories = config.controllerDirectory
    }

    for (let i = 0; i < controllerDirectories.length; i++) {
        if (!path.isAbsolute(controllerDirectories[i]))
            controllerDirectories[i] = path.join(config.rootPath, controllerDirectories[i])
    }

    // config.controllerDirectory = path.join(config.rootPath, config.controllerDirectory)

    if (!path.isAbsolute(config.staticRootDirectory))
        config.staticRootDirectory = path.join(config.rootPath, config.staticRootDirectory)

    let controllerLoader = new ControllerLoader(controllerDirectories)
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

    let fileServer: nodeStatic.Server
    fileServer = new nodeStatic.Server(config.staticRootDirectory, {
        // externalPaths,
        virtualPaths: config.virtualPaths,
        serverInfo: `maishu-node-mvc ${packageInfo.version}`,
        gzip: true
    })

    let fileServer_resolve = fileServer.resolve
    fileServer.resolve = function (pathname: string, req: http.IncomingMessage) {
        return fileServer_resolve.apply(fileServer, [pathname, req])
    }

    let server = http.createServer(async (req, res) => {
        if (config.headers) {
            for (let key in config.headers) {
                res.setHeader(key, config.headers[key])
            }
        }
        if (req.method == 'OPTIONS') {
            res.end()
            return
        }
        try {
            if (config.authenticate) {
                let r = await config.authenticate(req, res)
                if (r == null)
                    throw errors.authenticateResultNull()

                if (r.errorResult) {
                    outputResult(r.errorResult, res, req)
                    return
                }
            }

            if (config.actionFilters) {
                let actionFilters = config.actionFilters || []
                for (let i = 0; i < actionFilters.length; i++) {
                    let result = await actionFilters[i](req, res)
                    if (result != null) {
                        outputResult(result, res, req)
                        return
                    }
                }
            }

            let requestUrl = req.url || ''
            let urlInfo = url.parse(requestUrl);
            let pathName = urlInfo.pathname || '';

            let { action, controller, routeData } = controllerLoader.getAction(pathName)
            if (action != null && controller != null) {
                let actionResult = await executeAction(controller, action, routeData, req, res);
                outputResult(actionResult, res, req);
                return
            }

            //=====================================================================
            // 处理 URL 转发
            if (config.proxy) {
                for (let key in config.proxy) {
                    let regex = new RegExp(key)
                    let reqUrl = req.url || ''
                    let arr = regex.exec(reqUrl)
                    if (arr != null && arr.length > 0) {
                        let proxyItem: ProxyItem = typeof config.proxy[key] == 'object' ? config.proxy[key] as ProxyItem : { targetUrl: config.proxy[key] } as ProxyItem
                        let targetUrl = proxyItem.targetUrl
                        targetUrl = targetUrl.replace(/\$(\d+)/, (match, number) => {
                            if (arr == null) throw errors.unexpectedNullValue('arr')

                            return typeof arr[number] != 'undefined' ? arr[number] : match;
                        })
                        let headers: { [key: string]: string } | undefined = undefined
                        if (typeof proxyItem.headers == 'function') {
                            let r = proxyItem.headers(req)
                            let p = r as Promise<any>
                            // let headers
                            if (p != null && p.then && p.catch) {
                                // p.then(d => {
                                //     headers = d
                                // }).catch(err => {
                                //     outputError(err, res)
                                //     return
                                // })
                                headers = await p
                            }
                            else {
                                headers = r as { [key: string]: string }
                            }
                        }
                        else if (typeof proxyItem.headers == 'object') {
                            headers = proxyItem.headers
                        }

                        proxyRequest(targetUrl, req, res, headers)
                        return
                    }
                }
            }
            //=====================================================================

            fileServer.serve(req, res)

        }
        catch (err) {
            outputError(err, res)
        }
    });

    server.on('error', (err) => {
        console.log(err)
    })

    server.listen(config.port, config.bindIP)

    return { staticServer: fileServer }
}

async function executeAction(controller: object, action: Function, routeData: { [key: string]: string } | null,
    req: http.IncomingMessage, res: http.ServerResponse) {

    let parameters: object[] = []

    let parameterDecoders: (ActionParameterDecoder<any>)[] = []//& { parameterValue?: any }
    parameterDecoders = Reflect.getMetadata(metaKeys.parameter, controller, action.name) || []
    for (let i = 0; i < parameterDecoders.length; i++) {
        let metaData = parameterDecoders[i];
        let parameterValue = await metaData.createParameter(req, routeData);
        parameters[metaData.parameterIndex] = parameterValue;
    }

    let actionResult = action.apply(controller, parameters);
    let p = actionResult as Promise<any>
    if (p != null && p.then && p.catch) {
        let disposeParameter = () => {
            for (let i = 0; i < parameterDecoders.length; i++) {
                let d = parameterDecoders[i]
                if (d.disposeParameter) {
                    d.disposeParameter(parameters[d.parameterIndex])
                }
            }
        }
        p.then(r => {
            outputResult(r, res, req)
            disposeParameter()
        }).catch(err => {
            outputError(err, res)
            disposeParameter()
        })
        return
    }

    return actionResult;
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

export function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, headers?: { [key: string]: string }) {
    return new Promise((resolve, reject) => {
        let request = createTargetResquest(targetUrl, req, res, headers);

        request.on('error', function (err) {
            outputError(err, res);
            reject(err);
        })

        request.on("close", () => {
            resolve();
        })

        req.on('data', (data) => {
            request.write(data);
        })
        req.on('end', () => {
            request.end();
        })
    })
}

function createTargetResquest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, headers?: { [key: string]: string }) {

    let u = url.parse(targetUrl)
    let { protocol, hostname, port, path } = u
    // let headers: any = req.headers;
    headers = headers || {}
    headers = Object.assign(req.headers, headers)
    let request = http.request(
        {
            protocol, hostname, port, path,
            method: req.method,
            headers: headers,
        },
        (response) => {
            console.assert(response != null);

            for (var key in response.headers) {
                res.setHeader(key, response.headers[key] || '');
            }
            res.statusCode = response.statusCode || 200;
            res.statusMessage = response.statusMessage || ''
            response.pipe(res);
        },
    );

    return request;
}




