/// <reference types="node" />
import http = require('http');
export interface Config {
    port: number;
    bindIP?: string;
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
export declare const contentTypes: {
    application_json: string;
    text_plain: string;
};
export declare class ContentResult {
    data: string | Buffer;
    statusCode: number;
    contentType: string;
    constructor(data: string | Buffer, contentType: string, statusCode?: number);
}
