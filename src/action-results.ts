import http = require('http');
import { arugmentNull } from './errors';
import url = require('url');
import { ActionResult, ServerContext } from './types';
import * as errors from "./errors";
import { getLogger } from './logger';
import { LOG_CATEGORY_NAME } from './constants';

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

    constructor(content: string | Buffer, headers: Headers | string, statusCode?: number) {
        if (content == null)
            throw arugmentNull('content')

        this.content = content
        if (typeof headers == "string") {
            this.headers = { "content-type": headers };
        }
        else {
            this.headers = headers;
        }
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

export function proxyRequest(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext,
    method?: string, headers?: http.IncomingMessage["headers"],) {


    headers = Object.assign({}, req.headers, headers || {});
    // headers = Object.assign(req.headers, headers);
    //=====================================================
    if (headers.host) {
        headers["delete-host"] = headers.host;
        // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
        delete headers.host;
    }

    return proxyRequestWithoutPipe(targetUrl, req, res, serverContext, headers, method)

}


export function proxyRequestWithoutPipe(targetUrl: string, req: http.IncomingMessage, res: http.ServerResponse, serverContext: ServerContext,
    headers: http.IncomingMessage["headers"], method?: string) {
    return new Promise(function (resolve, reject) {
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
                // if (proxyResponse) {
                //     proxyResponse(response, req, res);
                // }
                // else {
                response.pipe(res);
                // }

                response.on("end", () => resolve());
                response.on("error", err => reject(err));
                response.on("close", () => reject(errors.connectionClose()));
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
            let logger = getLogger(LOG_CATEGORY_NAME, "all");
            logger.error(err);
            reject(err);
        });

        // clientRequest.on("finish", function () {
        //     resolve();
        // })
    })
}