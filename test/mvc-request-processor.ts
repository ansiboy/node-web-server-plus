import { createWebserver, createBrowser } from "./common.js";
import { HomeController } from "./www/controllers/home.js";
import * as assert from "assert";

describe("mvc-request-processor", function () {


    let webServer = createWebserver();
    let browser = createBrowser();

    it("execute action", async function () {

        let url = `http://127.0.0.1:${webServer.port}/home/product/1`;

        await browser.visit(url);

        let ctrl = new HomeController();
        let r = ctrl.product({ id: "1" });
        assert.equal(browser.source, JSON.stringify(r));
    })

})