import { RequestContext, RequestProcessor, RequestResult, VirtualDirectory } from "maishu-node-web-server";
import less = require("less");
import * as fs from "fs";
import * as path from "path";
import * as errors from "../errors";
import { pathConcat } from "maishu-toolkit";

interface Options {
    directoryPath?: string | null
}

export class LessProcessor implements RequestProcessor {

    options: Options = {};

    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        let ext = path.extname(ctx.virtualPath);
        if (ext != ".css" && ext != ".less")
            return null;


        // let virtualPath = ext == ".css" ?
        //     ctx.virtualPath.substr(0, ctx.virtualPath.length - ".css".length) + ".less"
        //     : ctx.virtualPath;
        let fileName = this.cutExtName(ctx.virtualPath);
        let lessFilePath = fileName + ".less";
        let cssFilePath = fileName + ".css";

        let dir: VirtualDirectory | null = ctx.rootDirectory;// = this.options.directoryPath ? ctx.rootDirectory.findDirectory(this.options.directoryPath) : ctx.rootDirectory;
        if (this.options.directoryPath != null) {
            dir = ctx.rootDirectory.findDirectory(this.options.directoryPath);
            if (dir == null)
                throw errors.pageNotFound(this.options.directoryPath);
        }

        let physicalPath = dir.findFile(cssFilePath);
        if (physicalPath == null)
            physicalPath = dir.findFile(lessFilePath);

        if (physicalPath == null)
            throw errors.pageNotFound(`${cssFilePath} or ${lessFilePath}`);


        let buffer = fs.readFileSync(physicalPath);
        let originalCode = buffer.toString();
        let output = await less.render(originalCode, {
            paths: [path.dirname(physicalPath)]
        } as Less.Options);

        return {
            content: output.css,
            headers: { "Content-Type": "text/css; charset=UTF-8" }
        };
    }

    private cutExtName(filePath: string) {
        let ext = path.extname(filePath);
        while (ext) {
            filePath = filePath.substr(0, filePath.length - ext.length);
            ext = path.extname(filePath);
        }

        return filePath;
    }

}
