import { RequestContext, RequestProcessor, RequestResult } from "maishu-node-web-server";
import less = require("less");
import * as fs from "fs";
import * as path from "path";
import * as errors from "../errors";

export class LessProcessor implements RequestProcessor {
    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        let ext = path.extname(ctx.virtualPath);
        if (ext != ".css")
            return null;


        let virtualPath = ctx.virtualPath.substr(0, ctx.virtualPath.length - ".css".length) + ".less";

        let physicalPath = ctx.rootDirectory.findFile(virtualPath);
        if (physicalPath == null || !fs.existsSync(physicalPath))
            throw errors.pageNotFound(virtualPath);

        let buffer = fs.readFileSync(physicalPath);
        let originalCode = buffer.toString();
        let output = await less.render(originalCode, {
            paths: [physicalPath]
        } as Less.Options);

        return {
            content: output.css,
            headers: { "Content-Type": "text/css; charset=UTF-8" }
        };
    }

}
