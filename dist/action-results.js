"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpProxy = require("http-proxy");
const errors_1 = require("./errors");
var proxy = httpProxy.createProxyServer();
//; charset=UTF-8
const encoding = 'UTF-8';
exports.contentTypes = {
    applicationJSON: `application/json; charset=${encoding}`,
    textPlain: `text/plain; charset=${encoding}`,
};
class ContentResult {
    constructor(content, contentType, statusCode) {
        if (content == null)
            throw errors_1.arugmentNull('content');
        this.content = content;
        this.contentType = contentType || exports.contentTypes.textPlain;
        this.statusCode = statusCode || 200;
    }
    execute(res) {
        res.setHeader("content-type", this.contentType);
        res.statusCode = this.statusCode;
        res.write(this.content);
    }
}
exports.ContentResult = ContentResult;
class RedirectResult {
    constructor(targetURL) {
        this.targetURL = targetURL;
    }
    execute(res) {
        res.writeHead(302, { 'Location': this.targetURL });
    }
}
exports.RedirectResult = RedirectResult;
class ProxyResut {
    constructor(targetURL) {
        this.targetURL = targetURL;
    }
    execute(res, req) {
        proxy.web(req, res, { target: this.targetURL });
    }
}
exports.ProxyResut = ProxyResut;
//# sourceMappingURL=action-results.js.map