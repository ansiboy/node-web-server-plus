import http = require('http');
import { arugmentNull } from './errors';
import { proxyRequest } from './server';
import url = require('url');
import { ActionResult, ServerContext } from './types';


const encoding = 'UTF-8'
export const contentTypes = {
    applicationJSON: `application/json; charset=${encoding}`,
    textPlain: `text/plain; charset=${encoding}`,
}

export type Headers = { [key: string]: string | string[] };

export class ContentResult implements ActionResult {
    private headers: Headers;
    private content: string | Buffer;
    private statusCode: number;

    constructor(content: string | Buffer, headers: Headers, statusCode?: number) {
        if (content == null)
            throw arugmentNull('content')

        this.content = content
        this.headers = headers;
        this.statusCode = statusCode || 200
    }

    async execute(res: http.ServerResponse) {
        for (let key in this.headers) {
            res.setHeader(key, this.headers[key]);
        }
        res.statusCode = this.statusCode;
        res.write(this.content)
    }
}

export class RedirectResult implements ActionResult {
    private targetURL: string;
    constructor(targetURL: string) {
        this.targetURL = targetURL
    }

    async execute(res: http.ServerResponse) {
        res.writeHead(302, { 'Location': this.targetURL })
    }
}

export class ProxyResut implements ActionResult {
    private targetURL: string;
    private method: string | undefined;

    constructor(targetURL: string, method?: string) {
        this.targetURL = targetURL;
        this.method = method;
    }
    execute(res: http.ServerResponse, req: http.IncomingMessage, serverContext: ServerContext) {
        let targetURL = this.targetURL;
        let isFullUrl = !targetURL.endsWith("/");
        if (req.url && isFullUrl == false) {
            let u = url.parse(req.url);
            if (targetURL.endsWith("/")) {
                targetURL = targetURL.substr(0, targetURL.length - 1);
            }
            targetURL = targetURL + u.path;
        }

        return proxyRequest(targetURL, req, res, serverContext, this.method);
    }

}