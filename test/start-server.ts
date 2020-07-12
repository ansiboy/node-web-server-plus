import { createWebserver, createBrowser } from "./common"
import * as assert from "assert";

describe("start server", function () {
    it("headers", async function () {

        let headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'get, post, put',
            'Access-Control-Allow-Headers': 'token'
        }
        let webServer = createWebserver({
            headers
        })

        let browser = createBrowser();
        let url = `http://127.0.0.1:${webServer.port}`;
        await browser.visit(url);

        let key1: keyof typeof headers = "Access-Control-Allow-Origin";
        let allowOrign = browser.response.headers.get(key1);
        assert.equal(allowOrign, headers[key1])

        let key2: keyof typeof headers = "Access-Control-Allow-Methods";
        let methods = browser.response.headers.get(key2);
        assert.equal(methods, headers[key2])
    })
})