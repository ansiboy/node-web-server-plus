/// <reference types="node" />
import http = require('http');
export interface Config {
    host?: {
        port: number;
        bind_ip: string;
    };
    areas?: {
        [area: string]: string | {
            [controller: string]: string;
        };
    };
}
export declare class WebServer {
    private server;
    constructor(server: http.Server);
}
export declare function startServer(config: Config): void;
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
