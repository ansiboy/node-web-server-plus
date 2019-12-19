/// <reference types="node" />
import http = require('http');
import { ActionResult, ServerContext } from './types';
export declare const contentTypes: {
    applicationJSON: string;
    textPlain: string;
};
export declare class ContentResult implements ActionResult {
    private contentType;
    private content;
    private statusCode;
    constructor(content: string | Buffer, contentType?: string, statusCode?: number);
    execute(res: http.ServerResponse): Promise<void>;
}
export declare class RedirectResult implements ActionResult {
    private targetURL;
    constructor(targetURL: string);
    execute(res: http.ServerResponse): Promise<void>;
}
export declare class ProxyResut implements ActionResult {
    private targetURL;
    private method;
    constructor(targetURL: string, method?: string);
    execute(res: http.ServerResponse, req: http.IncomingMessage, serverContext: ServerContext): Promise<any>;
}
