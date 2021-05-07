import { RequestContext, RequestProcessor, RequestResult, VirtualDirectory } from "maishu-node-web-server";
import less = require("less");
import * as fs from "fs";
import * as path from "path";
import * as errors from "../errors";
import * as scss from "sass";

interface Options {
    directoryPath?: string | null
}

let cssExtNames = [".css", ".less", ".scss"];
export class LessProcessor implements RequestProcessor {

    private options: Options = {};

    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        let ext = path.extname(ctx.virtualPath);
        if (cssExtNames.indexOf(ext) < 0)
            return null;


        let fileName = this.cutExtName(ctx.virtualPath);
        let lessFilePath = fileName + ".less";
        let cssFilePath = fileName + ".css";
        let scssFilePath = fileName + ".scss";

        let dir: VirtualDirectory | null = ctx.rootDirectory;
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
                let out = originalCode ? this.parseScss(originalCode, physicalPath, ctx.rootDirectory) : "";
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

    get directoryPath() {
        return this.options.directoryPath;
    }
    set directoryPath(value) {
        this.options.directoryPath = value;
    }

    private cutExtName(filePath: string) {
        let ext = path.extname(filePath);
        while (cssExtNames.indexOf(ext) >= 0) {
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

    private parseScss(originalCode: string, physicalPath: string, rootDirectory: VirtualDirectory,) {
        let dirPath: string | null = null;
        if (this.options.directoryPath) {
            let dir = rootDirectory.findDirectory(this.options.directoryPath);
            if (dir)
                dirPath = dir.physicalPath;
        }
        else {
            dirPath = rootDirectory.physicalPath;
        }

        let options: scss.Options = { data: originalCode, includePaths: [] };
        if (dirPath != null) {
            options.includePaths?.push(dirPath);
        }

        let dir = path.dirname(physicalPath);
        options.includePaths?.push(dir);

        let output = scss.renderSync(options);

        return output;
    }

}
