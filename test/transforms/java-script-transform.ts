import { RequestContext, VirtualDirectory } from "../../out";
import { JavaScriptProcessor } from "../../out/processors/java-script-processor";
import * as path from "path";
import * as fs from "fs";
import * as assert from "assert";
describe("java-script-processor", function () {
    it("js-to-amd", async function () {
        let t = new JavaScriptProcessor();
        let context: RequestContext = {
            req: null,
            res: null,
            virtualPath: "/common.js",
            rootDirectory: new VirtualDirectory(path.join(__dirname, "../")),
            logLevel: "all"
        };
        let r = await t.execute(context);
        let content = r.content as string;
        assert.ok(content.indexOf("define") >= 0);
    });
    it("ts-to-amd", async function () {
        let t = new JavaScriptProcessor();
        let context: RequestContext = {
            req: null,
            res: null,
            virtualPath: "/common.ts.js",
            rootDirectory: new VirtualDirectory(path.join(__dirname, "../")),
            logLevel: "all"
        };
        let r = await t.execute(context);
        let content = r.content as string;
        assert.ok(content.indexOf("define") >= 0);
    });
});
