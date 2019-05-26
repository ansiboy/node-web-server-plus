/// <reference types="node" />
import http = require('http');
import nodeStatic = require('maishu-node-static');
import { ActionResult } from './action-results';
export interface Config {
    port: number;
    bindIP?: string;
    rootPath: string;
    proxy?: {
        [path_pattern: string]: string;
    };
    requestUrlRewrite?: {
        [url_pattern: string]: string;
    };
    controllerDirectory?: string;
    staticRootDirectory?: string;
    staticExternalDirectories?: string[];
    authenticate?: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<{
        errorResult: ActionResult;
    }>;
}
export declare function startServer(config: Config): {
    staticServer: nodeStatic.Server;
};
export declare let formData: (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
