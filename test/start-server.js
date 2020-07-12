"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const assert = require("assert");
describe("start server", function () {
    it("headers", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'get, post, put',
                'Access-Control-Allow-Headers': 'token'
            };
            let webServer = common_1.createWebserver({
                headers
            });
            let browser = common_1.createBrowser();
            let url = `http://127.0.0.1:${webServer.port}`;
            yield browser.visit(url);
            let key1 = "Access-Control-Allow-Origin";
            let allowOrign = browser.response.headers.get(key1);
            assert.equal(allowOrign, headers[key1]);
            let key2 = "Access-Control-Allow-Methods";
            let methods = browser.response.headers.get(key2);
            assert.equal(methods, headers[key2]);
        });
    });
});
