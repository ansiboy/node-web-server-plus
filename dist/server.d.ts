/// <reference types="node" />
import http = require('http');
export interface Config {
    port: number;
    bindIP?: string;
    rootPath: string;
    proxy?: {
        [path_pattern: string]: string;
    };
    controllerDirectory?: string;
    staticFileDirectory?: string;
}
export interface Callbacks {
    actionBeforeExecute?: (path: string, req: http.IncomingMessage) => void;
    actionAfterExecute?: (path: string, req: http.IncomingMessage) => void;
}
export declare function startServer(config: Config, callbacks?: Callbacks): void;
