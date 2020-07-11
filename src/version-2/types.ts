import http = require('http');
import { LogLevel } from "../logger";
import { VirtualDirectory } from "maishu-node-web-server";

export interface ServerContext<T = {}> {
    // controllerDefines: ControllerInfo[],
    // settings: Settings,
    // logLevel: Settings["logLevel"],
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
    controllerDirectory?: VirtualDirectory,
    staticRootDirectory?: VirtualDirectory,
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
    paths: ActionPath[],
}

export type ActionPath = string | ((virtualPath: string) => object | null);

export interface ActionResult {
    execute(res: http.ServerResponse, req: http.IncomingMessage, serverContext: ServerContext): Promise<any>
}
