/// <reference types="node" />
import http = require('http');
import { Settings, ServerContext, ProxyPipe } from './types';
export declare function startServer(settings: Settings): {
    server: http.Server;
};
export declare function outputError(err: Error, res: http.ServerResponse): void;
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext, method?: string, headers?: http.IncomingMessage["headers"], proxyPipe?: ProxyPipe): Promise<any>;
export declare function proxyRequestWithPipe(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext, proxyPipe: ProxyPipe, headers: http.IncomingMessage["headers"], method?: string): Promise<any>;
export declare function proxyRequestWithoutPipe(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext, headers: http.IncomingMessage["headers"], method?: string): Promise<unknown>;
