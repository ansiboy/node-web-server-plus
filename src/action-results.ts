import http = require('http');
import { arugmentNull } from './errors';
import url = require('url');
import { ActionResult, ServerContext } from './types';
import * as errors from "./errors";
import { getLogger } from './logger';
import { LOG_CATEGORY_NAME } from './constants';
import { RequestProcessor, RequestContext, ExecuteResult } from 'maishu-node-web-server';

const encoding = 'UTF-8'
export const contentTypes = {
    applicationJSON: `application/json; charset=${encoding}`,
    textPlain: `text/plain; charset=${encoding}`,
}

export type Headers = { [key: string]: string };

export class ContentResult implements RequestProcessor {
    private headers: Headers;
    private content: string | Buffer;
    private statusCode: number;

    constructor(content: string | Buffer, headers?: Headers | string, statusCode?: number) {
        if (content == null)
            throw arugmentNull('content')

        this.content = content
        if (typeof headers == "string") {
            this.headers = { "content-type": headers };
        }
        else {
            this.headers = headers || {};
        }
        this.statusCode = statusCode || 200
    }

    execute(args: RequestContext): ExecuteResult {
        return { statusCode: this.statusCode, headers: this.headers, content: this.content };
    }
}

export class RedirectResult implements RequestProcessor {
    private targetURL: string;
    constructor(targetURL: string) {
        this.targetURL = targetURL
    }

    execute(): ExecuteResult {
        // res.writeHead(302, { 'Location': this.targetURL })
        return { statusCode: 302, headers: { "Location": this.targetURL }, content: "" };
    }
}

export class ProxyResut implements RequestProcessor {
    private targetURL: string;
    private method: string | undefined;

    constructor(targetURL: string, method?: string) {
        this.targetURL = targetURL;
        this.method = method;
    }
    async execute(args: RequestContext) {
        let targetURL = this.targetURL;
        let isFullUrl = !targetURL.endsWith("/");
        let req = args.req;
        if (req.url && isFullUrl == false) {
            let u = url.parse(req.url);
            if (targetURL.endsWith("/")) {
                targetURL = targetURL.substr(0, targetURL.length - 1);
            }
            targetURL = targetURL + u.path;
        }

        return proxyRequest(targetURL, args.req, args.res, {}, args.req.method);
    }

}

function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse,
    headers: http.IncomingMessage["headers"], method?: string): Promise<ExecuteResult> {
    return new Promise<ExecuteResult>(function (resolve, reject) {
        headers = Object.assign({}, req.headers, headers || {});
        // headers = Object.assign(req.headers, headers);
        //=====================================================
        if (headers.host) {
            headers["delete-host"] = headers.host;
            // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
            delete headers.host;
        }

        //=====================================================
        let clientRequest = http.request(targetUrl,
            {
                method: method || req.method,
                headers: headers, timeout: 2000,
            },
            function (response) {
                for (var key in response.headers) {
                    res.setHeader(key, response.headers[key] || '');
                }
                res.statusCode = response.statusCode || 200;
                res.statusMessage = response.statusMessage || '';

                let b = Buffer.from([]);

                response.on("data", (data) => {
                    b = Buffer.concat([b, data]);
                });

                response.on("end", () => {
                    resolve({ content: b });
                });
                response.on("error", err => reject(err));
                response.on("close", () => {
                    reject(errors.connectionClose())
                });
            }
        );

        if (!req.readable) {
            reject(errors.requestNotReadable());
        }


        req.on('data', (data) => {
            clientRequest.write(data);
        }).on('end', () => {
            clientRequest.end();
        }).on('error', (err) => {
            clientRequest.end();
            reject(err);
        });

        clientRequest.on("error", function (err) {
            // let logger = getLogger(LOG_CATEGORY_NAME, serverContext.logLevel);
            // logger.error(err);
            reject(err);
        });
    })
}