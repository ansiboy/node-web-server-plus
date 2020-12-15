import { RequestContext, RequestProcessor, RequestResult } from "maishu-node-web-server";
import * as errors from "../errors";
import * as fs from "fs";
import babel = require("@babel/core");

export class JavaScriptProcessor implements RequestProcessor {

    private _babelOptions: { [key: string]: babel.TransformOptions } = {
        "\S+.ts.js": {
            plugins: [
                "@babel/plugin-transform-typescript",
                "@babel/plugin-transform-modules-amd"
            ]
        },
        "\S+.js": {
            plugins: [
                "@babel/plugin-transform-modules-amd"
            ]
        }
    };

    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        if (ctx.virtualPath.endsWith(".js") == false)
            return null;

        let virtualPath = ctx.virtualPath;
        if (virtualPath.endsWith(".ts.js")) {
            virtualPath = virtualPath.substr(0, virtualPath.length - 3);
        }

        let physicalPath = ctx.rootDirectory.findFile(ctx.virtualPath);
        if (physicalPath == null)
            throw errors.pageNotFound(ctx.virtualPath);

        let buffer = fs.readFileSync(physicalPath);
        let code = buffer.toString();
        let option: babel.TransformOptions | undefined;

        // 非 node_modules 的 js 才做转换
        if (virtualPath.indexOf("node_modules") < 0) {
            for (let key in this.babelOptions) {
                let regex = new RegExp(key);
                if (regex.test(virtualPath)) {
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

    get babelOptions() {
        return this._babelOptions;
    }



}