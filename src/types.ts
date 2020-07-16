import http = require('http');
import { LogLevel } from "./logger";
import { VirtualDirectory, FileProcessor } from 'maishu-node-web-server';
import { ContentTransform } from 'maishu-node-web-server';

export interface ServerContext<T = {}> {
    // controllerDefines: ControllerInfo[],
    // settings: Settings,
    data?: T,
    logLevel: LogLevel
}

export interface ProxyItem {
    targetUrl: string,
    rewrite?: [string, string],
    headers?: { [name: string]: string } | ((req: http.IncomingMessage) => { [name: string]: string } | Promise<{ [name: string]: string }>),
    // response?: (proxResponse: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse) => void,
    // pipe?: ProxyPipe
}


// export interface ProxyPipe {
//     onRequest?: (args: { req: http.IncomingMessage }, data: Buffer) => Promise<Buffer | null | undefined | void>,
//     onResponse?: (args: { req: http.IncomingMessage, res: http.IncomingMessage }, data: Buffer) => Promise<Buffer | null | undefined | void>,
//     next?: ProxyPipe,
// }

export interface Settings {
    port?: number,
    bindIP?: string,
    controllerDirectory?: string | VirtualDirectory,
    staticRootDirectory?: string | VirtualDirectory,
    proxy?: { [path_pattern: string]: string | ProxyItem },
    serverName?: string,
    /** 设置默认的 Http Header */
    headers?: { [name: string]: string }
    virtualPaths?: { [virtualPath: string]: string },
    logLevel?: LogLevel,
    serverContextData?: any,
    fileProcessors?: { [fileExtention: string]: FileProcessor },
    contentTransforms?: ContentTransform[],
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
