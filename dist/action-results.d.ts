/// <reference types="node" />
import http = require('http');
export declare const contentTypes: {
    applicationJSON: string;
    textPlain: string;
};
export interface ActionResult {
    execute(res: http.ServerResponse, req: http.IncomingMessage): void;
}
export declare class ContentResult implements ActionResult {
    private contentType;
    private content;
    private statusCode;
    constructor(content: string | Buffer, contentType?: string, statusCode?: number);
    execute(res: http.ServerResponse): void;
}
export declare class RedirectResult implements ActionResult {
    private targetURL;
    constructor(targetURL: string);
    execute(res: http.ServerResponse): void;
}
export declare class ProxyResut implements ActionResult {
    private targetURL;
    constructor(targetURL: string);
    execute(res: http.ServerResponse, req: http.IncomingMessage): void;
}
