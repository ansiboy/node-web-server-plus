/// <reference types="node" />
import http = require('http');
import nodeStatic = require('maishu-node-static');
import { ActionResult } from './action-results';
interface ProxyItem {
    targetUrl: string;
    headers?: {
        [name: string]: string;
    } | ((req: http.IncomingMessage) => {
        [name: string]: string;
    } | Promise<{
        [name: string]: string;
    }>);
}
export interface Config {
    port: number;
    rootPath: string;
    bindIP?: string;
    controllerDirectory?: string | string[];
    staticRootDirectory?: string;
    proxy?: {
        [path_pattern: string]: string | ProxyItem;
    };
    authenticate?: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<{
        errorResult: ActionResult;
    }>;
    actionFilters?: ((req: http.IncomingMessage, res: http.ServerResponse) => Promise<ActionResult>)[];
    /** 设置默认的 Http Header */
    headers?: {
        [name: string]: string;
    };
    virtualPaths?: {
        [virtualPath: string]: string;
    };
}
export declare function startServer(config: Config): {
    staticServer: nodeStatic.Server;
};
export declare function outputError(err: Error, res: http.ServerResponse): void;
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, headers?: {
    [key: string]: string;
}): Promise<unknown>;
export {};
