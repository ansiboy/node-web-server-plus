import { RequestContext, RequestProcessor, RequestResult } from "maishu-node-web-server";
import * as errors from "../errors";
import * as fs from "fs";
import * as JSON5 from "json5";

export class Json5Processor implements RequestProcessor {
    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        let virtualPath = ctx.virtualPath;
        if (!virtualPath.endsWith(".json") && !virtualPath.endsWith(".json5"))
            return null;

        let physicalPath = ctx.rootDirectory.findFile(virtualPath);
        if (physicalPath == null)
            throw errors.pageNotFound(virtualPath);

        let buffer = fs.readFileSync(physicalPath);
        let obj = JSON5.parse(buffer.toString());

        const encoding = 'UTF-8';
        return {
            content: JSON.stringify(obj),
            headers: { "content-type": `application/json; charset=${encoding}` }
        };
    }

}