/// <reference types="node" />
import http = require('http');
import { Settings, ProxyItem, ServerContext } from './types';
export declare function startServer(settings: Settings): {
    server: http.Server;
};
export declare function outputError(err: Error, res: http.ServerResponse): void;
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext, method?: string, headers?: http.IncomingMessage["headers"], proxyResponse?: ProxyItem["response"]): Promise<unknown>;
