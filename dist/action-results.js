"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const server_1 = require("./server");
const url = require("url");
const path = require("path");
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
        return __awaiter(this, void 0, void 0, function* () {
            res.setHeader("content-type", this.contentType);
            res.statusCode = this.statusCode;
            res.write(this.content);
        });
    }
}
exports.ContentResult = ContentResult;
class RedirectResult {
    constructor(targetURL) {
        this.targetURL = targetURL;
    }
    execute(res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.writeHead(302, { 'Location': this.targetURL });
        });
    }
}
exports.RedirectResult = RedirectResult;
class ProxyResut {
    constructor(targetURL) {
        this.targetURL = targetURL;
    }
    execute(res, req) {
        let targetURL = this.targetURL;
        if (req.url) {
            let u = url.parse(req.url);
            targetURL = path.join(targetURL, u.path || "");
        }
        return server_1.proxyRequest(targetURL, req, res);
    }
}
exports.ProxyResut = ProxyResut;
