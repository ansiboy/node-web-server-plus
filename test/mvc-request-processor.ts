import { MVCRequestProcessor } from "../out/version-2";
import { VirtualDirectory } from "maishu-node-web-server";
import * as path from "path";
import { createWebserver, createBrowser } from "./common";
import { HomeController } from "./www/controllers/home";
import * as assert from "assert";

describe("mvc-request-processor", function () {

    let dir = new VirtualDirectory(path.join(__dirname, "www/controllers"));
    let p = new MVCRequestProcessor(dir);
    let webServer = createWebserver({
        requestProcessors: [p]
    })
    let browser = createBrowser();

    it("execute action", async function () {

        let url = `http://127.0.0.1:${webServer.port}/home/product/1`;

        await browser.visit(url);

        let ctrl = new HomeController();
        let r = ctrl.product({ id: "1" });
        assert.equal(browser.source, JSON.stringify(r));
    })

})