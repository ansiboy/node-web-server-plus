import http = require('http')
import { arugmentNull } from './errors';

export const contentTypes = {
    applicationJSON: 'application/json',
    textPlain: 'text/plain',
}

export interface ActionResult {
    execute(res: http.ServerResponse): void
}

export class ContentResult implements ActionResult {
    private contentType: string;
    private content: string;
    private statusCode: number;

    constructor(content: string, contentType?: string, statusCode?: number) {
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