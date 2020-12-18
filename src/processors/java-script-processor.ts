import { RequestContext, RequestProcessor, RequestResult } from "maishu-node-web-server";
import * as errors from "../errors.js";
import * as fs from "fs";
import * as babel from "@babel/core";

import { commonjsToAmd } from "./js-transform.js";

export class JavaScriptProcessor implements RequestProcessor {

    babelOptions: { [key: string]: babel.TransformOptions } = {
        "\\S+.ts$": {
            "presets": [
                ["@babel/preset-env", {
                    "targets": { chrome: 58 }
                }],
                // "@babel/plugin-transform-typescript"
            ],
            plugins: [
                "@babel/plugin-transform-typescript",
                "@babel/plugin-transform-modules-amd"
            ]
        },
        "\\S+.js$": {
            plugins: [
                "@babel/plugin-transform-modules-amd"
            ]
        },
        "\\S+.tsx$": {
            "presets": [
                ["@babel/preset-env", {
                    "targets": { chrome: 58 }
                }],
            ],
            plugins: [
                ["@babel/plugin-transform-typescript", { isTSX: true }],
                ["@babel/plugin-transform-react-jsx", { "pragma": "React.createElement", "pragmaFrag": "React.Fragment" }],
                "@babel/plugin-transform-modules-amd"
            ]
        },
        "\\S+.jsx$": {
            plugins: [
                ["@babel/plugin-transform-react-jsx", { "pragma": "React.createElement", "pragmaFrag": "React.Fragment" }],
                "@babel/plugin-transform-modules-amd"
            ]
        },
    };

    ignorePaths = ["\\S+node_modules\\S+", "\\S+lib\\S+"];

    async execute(ctx: RequestContext): Promise<RequestResult | null> {
        if (!ctx.virtualPath.endsWith(".js"))
            return null;

        let jsVirtualPath = ctx.virtualPath;
        let tsVirtualPath = ctx.virtualPath.substr(0, ctx.virtualPath.length - ".js".length) + ".ts";
        let tsxVirtualPath = ctx.virtualPath.substr(0, ctx.virtualPath.length - ".js".length) + ".tsx";

        let physicalPath = ctx.rootDirectory.findFile(jsVirtualPath);
        if (physicalPath == null) {
            physicalPath = ctx.rootDirectory.findFile(tsVirtualPath);
        }

        if (physicalPath == null) {
            physicalPath = ctx.rootDirectory.findFile(tsxVirtualPath);
        }

        if (physicalPath == null) {
            throw errors.pageNotFound(`${jsVirtualPath} ${tsVirtualPath} ${tsxVirtualPath}`);
        }


        let buffer = fs.readFileSync(physicalPath);
        let code = buffer.toString();
        let options: babel.TransformOptions | undefined;

        let skip = false;
        for (let i = 0; i < this.ignorePaths.length; i++) {
            let regex = new RegExp(this.ignorePaths[i]);
            if (regex.test(ctx.virtualPath)) {
                skip = true;
                break;
            }
        }

        if (!skip) {
            for (let key in this.babelOptions) {
                let regex = new RegExp(key);
                if (regex.test(physicalPath)) {
                    options = this.babelOptions[key];
                    break;
                }
            }
        }

        if (options) {
            let isTS = physicalPath.endsWith(".ts" || physicalPath.endsWith(".tsx"));
            if (isTS) {
                let r = babel.transform(code, options);
                code = r?.code || "/** Babel transform code fail. */";
            }
            else {
                code = commonjsToAmd(code, options);
            }
        }

        const encoding = 'UTF-8';
        return { content: code, headers: { "content-type": `application/x-javascript; charset=${encoding}` } };
    }
}