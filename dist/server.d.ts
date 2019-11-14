/// <reference types="node" />
import http = require('http');
import { ServerContext } from './server-context';
import { Settings } from './types';
export declare function startServer(settings: Settings): {
    server: http.Server;
};
export declare function outputError(err: Error, res: http.ServerResponse): void;
export declare function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext, method?: string, headers?: {
    [key: string]: string;
}): Promise<{}>;
