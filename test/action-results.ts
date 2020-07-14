import { createWebserver, createBrowser } from "./common"
import { actionPaths } from "./www/actionPaths";
import { HomeController } from "./www/controllers/home";
import * as assert from "assert";

describe("action results", function () {
    it("content result", async function () {
        let webServer = createWebserver();
        let browser = createBrowser();
        let url = `http://127.0.0.1:${webServer.port}/${actionPaths.home.content}`;
        await browser.visit(url);

        let ctr = new HomeController();
        let r = ctr.content().execute({} as any);
        assert.equal(browser.source, r.content);
    })
})