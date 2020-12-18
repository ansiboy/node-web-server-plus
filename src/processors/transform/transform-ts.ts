import { errors } from "maishu-toolkit";
import { NodeConverter } from "./node-converter";
import { Program, Node, Statement, StringLiteral, VariableDeclarator } from "@babel/types";
import babel = require("@babel/core");
import * as path from "path";

export function transformTS(originalCode: string, options: babel.TransformOptions) {
    let ast = babel.parseSync(originalCode, options) as Node;
    new TSNodeConerter().transform(ast);

    let r = babel.transformFromAstSync(ast, undefined, options);
    let code = r?.code || "/** Babel transform code fail. */";
    return code;
}

class TSNodeConerter extends NodeConverter {
    transform(node: Node) {
        if (node == null)
            throw errors.argumentNull("node");

        switch (node.type) {
            case "ImportDeclaration":
                if (node.source != null && node.source.type == "StringLiteral") {
                    let moduleName = node.source.value;
                    if ((moduleName.endsWith(".scss") || moduleName.endsWith(".css") || moduleName.endsWith(".less")) && !moduleName.startsWith("css!")) {
                        let ext = path.extname(moduleName);
                        moduleName = "css!" + moduleName.substr(0, moduleName.length - ext.length) + ".css";
                        node.source.value = moduleName;
                    }
                }
                break;
        }
        return super.transform(node);
    }
}