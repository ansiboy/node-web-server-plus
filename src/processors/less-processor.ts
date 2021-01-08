import { RequestContext, RequestProcessor, RequestResult, VirtualDirectory } from "maishu-node-web-server";
import less = require("less");
import * as fs from "fs";
import * as path from "path";
import * as errors from "../errors";
import * as scss from "node-sass";

interface Options {
    directoryPath?: string | null
}

export class LessProcessor implements RequestProcessor {

    options: Options = {};

    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        let ext = path.extname(ctx.virtualPath);
        if (ext != ".css" && ext != ".less" && ext != ".scss")
            return null;


        // let virtualPath = ext == ".css" ?
        //     ctx.virtualPath.substr(0, ctx.virtualPath.length - ".css".length) + ".less"
        //     : ctx.virtualPath;
        let fileName = this.cutExtName(ctx.virtualPath);
        let lessFilePath = fileName + ".less";
        let cssFilePath = fileName + ".css";
        let scssFilePath = fileName + ".scss";

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
            physicalPath = dir.findFile(scssFilePath);

        if (physicalPath == null)
            throw errors.pageNotFound(`${cssFilePath} or ${lessFilePath} or ${scssFilePath}`);


        let buffer = fs.readFileSync(physicalPath);
        let originalCode = buffer.toString();

        let content: string;
        let extname = path.extname(physicalPath);
        switch (extname) {
            case ".less":
                let output = await this.parseLess(originalCode, physicalPath);
                content = output.css;
                break;
            case ".scss":
                let out = originalCode ? this.parseScss(originalCode, physicalPath) : "";
                content = typeof out == "string" ? out : out.css.toString();
                break;
            default:
                content = originalCode;
        }


        return {
            content: content,
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

    private async parseLess(originalCode: string, physicalPath: string) {
        let output = await less.render(originalCode, {
            paths: [path.dirname(physicalPath)]
        } as Less.Options);

        return output;
    }

    private parseScss(originalCode: string, physicalPath: string) {
        let output = scss.renderSync({
            data: originalCode
        });

        return output;
    }

}
