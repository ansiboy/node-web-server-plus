import http = require('http')
import httpProxy = require('http-proxy')
import { arugmentNull } from './errors';

var proxy = httpProxy.createProxyServer()
//; charset=UTF-8
const encoding = 'UTF-8'
export const contentTypes = {
    applicationJSON: `application/json; charset=${encoding}`,
    textPlain: `text/plain; charset=${encoding}`,
}

export interface ActionResult {
    execute(res: http.ServerResponse, req: http.IncomingMessage): void
}

export class ContentResult implements ActionResult {
    private contentType: string;
    private content: string | Buffer;
    private statusCode: number;

    constructor(content: string | Buffer, contentType?: string, statusCode?: number) {
        if (content == null)
            throw arugmentNull('content')

        this.content = content
        this.contentType = contentType || contentTypes.textPlain
        this.statusCode = statusCode || 200
    }

    execute(res: http.ServerResponse): void {
        res.setHeader("content-type", this.contentType)
        res.statusCode = this.statusCode;
        res.write(this.content)
    }
}

export class RedirectResult implements ActionResult {
    private targetURL: string;
    constructor(targetURL: string) {
        this.targetURL = targetURL
    }

    execute(res: http.ServerResponse): void {
        res.writeHead(302, { 'Location': this.targetURL })
    }
}

export class ProxyResut implements ActionResult {
    private targetURL: string;
    constructor(targetURL: string) {
        this.targetURL = targetURL
    }
    execute(res: http.ServerResponse, req: http.IncomingMessage): void {
        proxy.web(req, res, { target: this.targetURL })
    }

}