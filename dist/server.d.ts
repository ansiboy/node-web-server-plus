/// <reference types="node" />
import http = require('http');
import { ActionResult } from './action-results';
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
export interface Config {
    port: number;
    bindIP?: string;
    controllerDirectory?: string | string[];
    staticRootDirectory?: string;
    proxy?: {
        [path_pattern: string]: string | ProxyItem;
    };
    authenticate?: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<ActionResult | null>;
    actionFilters?: ((req: http.IncomingMessage, res: http.ServerResponse) => Promise<ActionResult | null>)[];
    /** 设置默认的 Http Header */
    headers?: {
        [name: string]: string;
    };
    virtualPaths?: {
        [virtualPath: string]: string;
    };
}
export declare function startServer(config: Config): void;
export declare function outputError(err: Error, res: http.ServerResponse): void;
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, headers?: {
    [key: string]: string;
}): Promise<{}>;
export {};
