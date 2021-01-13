import { RequestContext, RequestProcessor, RequestResult } from "maishu-node-web-server";
import * as errors from "../errors";
import * as fs from "fs";
import * as JSON5 from "json5";
import * as path from "path";

export class Json5Processor implements RequestProcessor {
    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        let virtualPath = ctx.virtualPath;
        if (!virtualPath.endsWith(".json") && !virtualPath.endsWith(".json5"))
            return null;

        let extname = path.extname(ctx.virtualPath);
        let fileName = ctx.virtualPath.substr(0, ctx.virtualPath.length - extname.length);

        let jsonFileName = fileName + ".json";
        let json5FileName = fileName + ".json5";

        let physicalPath = ctx.rootDirectory.findFile(jsonFileName);
        if (physicalPath == null)
            physicalPath = ctx.rootDirectory.findFile(json5FileName);

        if (physicalPath == null)
            throw errors.pageNotFound(`${jsonFileName} or ${json5FileName}`);

        let buffer = fs.readFileSync(physicalPath);
        let obj = JSON5.parse(buffer.toString());

        const encoding = 'UTF-8';
        return {
            content: JSON.stringify(obj),
            headers: { "content-type": `application/json; charset=${encoding}` }
        };
    }

}