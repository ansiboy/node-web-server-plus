import http = require('http')
import { arugmentNull } from './errors';
import { outputError, proxyRequest } from './server';
import url = require('url');
import path = require("path");


//; charset=UTF-8
const encoding = 'UTF-8'
export const contentTypes = {
    applicationJSON: `application/json; charset=${encoding}`,
    textPlain: `text/plain; charset=${encoding}`,
}

export interface ActionResult {
    execute(res: http.ServerResponse, req: http.IncomingMessage): Promise<any>
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

    async execute(res: http.ServerResponse) {
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

    async execute(res: http.ServerResponse) {
        res.writeHead(302, { 'Location': this.targetURL })
    }
}

export class ProxyResut implements ActionResult {
    private targetURL: string;
    constructor(targetURL: string) {
        this.targetURL = targetURL
    }
    execute(res: http.ServerResponse, req: http.IncomingMessage) {
        let targetURL = this.targetURL;
        if (req.url) {
            let u = url.parse(req.url);
            targetURL = path.join(targetURL, u.path || "");
        }

        return proxyRequest(targetURL, req, res);
    }

}