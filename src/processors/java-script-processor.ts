import { RequestContext, RequestProcessor, RequestResult } from "maishu-node-web-server";
import * as errors from "../errors.js";
import * as fs from "fs";
import * as babel from "@babel/core";

export class JavaScriptProcessor implements RequestProcessor {

    babelOptions: { [key: string]: babel.TransformOptions } = {
        "\\S+.ts.js": {
            plugins: [
                "@babel/plugin-transform-typescript",
                "@babel/plugin-transform-modules-amd"
            ]
        },
        "\\S+.js": {
            plugins: [
                "@babel/plugin-transform-modules-amd"
            ]
        }
    };

    skipPaths = ["\\S+node_modules\\S+", "\\S+lib\\S+"];

    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        if (ctx.virtualPath.endsWith(".js") == false)
            return null;

        let virtualPath = ctx.virtualPath;
        if (virtualPath.endsWith(".ts.js")) {
            virtualPath = virtualPath.substr(0, virtualPath.length - 3);
        }

        let physicalPath = ctx.rootDirectory.findFile(virtualPath);
        if (physicalPath == null)
            throw errors.pageNotFound(virtualPath);

        let buffer = fs.readFileSync(physicalPath);
        let code = buffer.toString();
        let option: babel.TransformOptions | undefined;

        let skip = false;
        for (let i = 0; i < this.skipPaths.length; i++) {
            let regex = new RegExp(this.skipPaths[i]);
            if (regex.test(ctx.virtualPath)) {
                skip = true;
                break;
            }
        }

        if (!skip) {
            for (let key in this.babelOptions) {
                let regex = new RegExp(key);
                if (regex.test(ctx.virtualPath)) {
                    option = this.babelOptions[key];
                    break;
                }
            }
        }

        if (option) {
            let r = babel.transform(code, option);
            code = r?.code || "/** Babel transform code fail. */";
        }

        const encoding = 'UTF-8';
        return { content: code, headers: { "content-type": `application/x-javascript; charset=${encoding}` } };
    }
}