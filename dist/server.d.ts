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
    bindIP?: string;
    rootPath: string;
    proxy?: {
        [path_pattern: string]: string | ProxyItem;
    };
    controllerDirectory?: string | string[];
    staticRootDirectory?: string;
    staticExternalDirectories?: string[];
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
export declare let formData: (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export {};
