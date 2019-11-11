/// <reference types="node" />
import http = require('http');
import { ActionResult } from './action-results';
import { ServerContext } from './server-context';
import { LogLevel } from './logger';
interface ProxyItem {
    targetUrl: string;
    rewrite?: [string, string];
    headers?: {
        [name: string]: string;
    } | ((req: http.IncomingMessage) => {
        [name: string]: string;
    } | Promise<{
        [name: string]: string;
    }>);
}
export interface Settings {
    port: number;
    bindIP?: string;
    controllerDirectory?: string | string[];
    staticRootDirectory?: string;
    proxy?: {
        [path_pattern: string]: string | ProxyItem;
    };
    authenticate?: (req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext) => Promise<ActionResult | null>;
    actionFilters?: ((req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext) => Promise<ActionResult | null>)[];
    serverName?: string;
    /** 设置默认的 Http Header */
    headers?: {
        [name: string]: string;
    };
    virtualPaths?: {
        [virtualPath: string]: string;
    };
    logLevel?: LogLevel;
}
export declare function startServer(settings: Settings): {
    server: http.Server;
};
export declare function outputError(err: Error, res: http.ServerResponse): void;
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, method?: string, headers?: {
    [key: string]: string;
}): Promise<{}>;
export {};
