import log4js = require("log4js");
import http = require('http');
import { LogLevel } from "./logger";

// export interface ServerContext {
//     controllerDefines: ControllerInfo[],
//     settings: Settings,
// }

export interface ServerContext<T = {}> {
    controllerDefines: ControllerInfo[],
    // settings: Settings,
    logLevel: Settings["logLevel"],
    data?: T
}

export interface ProxyItem {
    targetUrl: string,
    rewrite?: [string, string],
    headers?: { [name: string]: string } | ((req: http.IncomingMessage) => { [name: string]: string } | Promise<{ [name: string]: string }>),
    // response?: (proxResponse: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse) => void,
    pipe?: ProxyPipe
}


export interface ProxyPipe {
    onRequest?: (args: { req: http.IncomingMessage }, data: Buffer) => Promise<Buffer | null | undefined | void>,
    onResponse?: (args: { req: http.IncomingMessage, res: http.IncomingMessage }, data: Buffer) => Promise<Buffer | null | undefined | void>,
    next?: ProxyPipe,
}

export interface Settings {
    port?: number,
    bindIP?: string,
    controllerDirectory?: string | string[],
    staticRootDirectory?: string,
    proxy?: { [path_pattern: string]: string | ProxyItem },
    authenticate?: (req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext) => Promise<ActionResult | null>,
    requestFilters?: ((req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext) => Promise<ActionResult | null>)[],
    serverName?: string,
    /** 设置默认的 Http Header */
    headers?: { [name: string]: string }
    virtualPaths?: { [virtualPath: string]: string },
    logLevel?: LogLevel,
    serverContextData?: any,
}

export interface ControllerInfo {
    type: ControllerType<any>,
    path: string,
    actionDefines: ActionInfo[]
}

export type ControllerType<T> = { new(): T }

export interface ActionInfo {
    memberName: string,
    paths: string[],
}


export interface ActionResult {
    execute(res: http.ServerResponse, req: http.IncomingMessage, serverContext: ServerContext): Promise<any>
}
