/// <reference types="node" />
import http = require('http');
export interface Config {
    port: number;
    bind_ip?: string;
    root_path: string;
    proxy?: {
        [path_pattern: string]: string;
    };
    controller_directories?: string[];
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
    data: string;
    statusCode: number;
    contentType: string;
    constructor(data: string, contentType: string, statusCode?: number);
}
