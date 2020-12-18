import babel = require("@babel/core");
import {
    AssignmentExpression,
    ExpressionStatement, Program, Node,
    ImportDeclaration, MemberExpression, Statement, StringLiteral,

    VariableDeclaration, VariableDeclarator, ImportNamespaceSpecifier
} from "@babel/types";
import * as errors from "../errors";
import { NodeConverter } from "./transform/node-converter";

/**
 * 将 commonjs 代码转换为 amd
 * @param originalCode commonjs 代码
 */
export function commonjsToAmd(originalCode: string, options: babel.TransformOptions) {
    options = options || {};
    options.plugins = options.plugins || [];

    let ast = babel.parseSync(originalCode, options) as Node;

    let g = new RequireToImport();
    ast = g.transform(ast);
    let program = (ast as any as babel.types.File).program;

    // 查找代码中是否有导出，例如： exports.default = IndexPage;;
    let exportsNode: Node = program.body.filter(o => o.type == "ExportNamedDeclaration")[0];
    if (exportsNode == null) {
        exportsNode = (program.body.filter(o => o.type == "ExpressionStatement" && o.expression.type == "AssignmentExpression" ||
            o.type == "ExportNamedDeclaration") as ExpressionStatement[])
            .map((o: ExpressionStatement) => o.expression as AssignmentExpression)
            .filter(o => o.left.type == "MemberExpression")
            .map(o => o.left as MemberExpression)
            .filter(o => o.object.type == "Identifier" && o.object.name == "exports")[0];
    }

    console.assert(g.improts != null);
    // 没有 import 和 exports
    let importsCount = program.body.filter(o => o.type == "ImportDeclaration").length + g.improts.length;
    if (importsCount == 0 && exportsNode == null) {
        return originalCode;
    }

    // import "require";
    let requireImport = Nodecreator.createImportDeclaration("require", "require");
    // import "exports";
    let exportsImport = Nodecreator.createImportDeclaration("exports", "exports");
    program.body.unshift(...[requireImport, exportsImport]);
    if (g.improts.length > 0) {
        program.body.unshift(...g.improts);
    }

    // let options = {
    //     plugins: [
    //         ["@babel/transform-modules-amd", { noInterop: true }],
    //     ] as Array<any>
    // };

    // let isTaro = isTaroProgram(program);
    // if (isTaro) {
    //     options.plugins.push([
    //         "@babel/transform-react-jsx", {
    //             "pragma": "Nerv.createElement",
    //             "pragmaFrag": "Nerv.Fragment"
    //         }
    //     ])
    // }
    // else {
    //     options.plugins.push([
    //         "@babel/transform-react-jsx", {
    //             "pragma": "React.createElement",
    //             "pragmaFrag": "React.Fragment"
    //         }
    //     ])
    // }

    let r = babel.transformFromAstSync(ast, undefined, options);
    let code = r?.code || "/** Babel transform code fail. */";
    return code;
}

function isTaroProgram(program: Program): boolean {
    let taroImport = (program.body.filter(o => o.type == "ImportDeclaration") as ImportDeclaration[])
        .map((o: ImportDeclaration) => o.source)
        .filter(o => o.value == "nervjs" || o.value == "@tarojs/taro")[0];
    return taroImport != null;
}


/**
 * 将 require 语句转换为 import 语句 
 * 例如：const nervjs_1 = require("nervjs") 转换为 import * as nervjs_1 from "nervjs"
 * require("index.less") 转换为 import "index.less"
 */
class RequireToImport extends NodeConverter {

    improts: ImportDeclaration[] = [];

    transform(node: Node) {
        if (node == null)
            throw errors.argumentNull("node");

        if (node.type == "CallExpression" && node.callee.type == "Identifier" && node.callee.name == "require" &&
            node.arguments.length == 1 && node.arguments[0].type == "StringLiteral") {
            let moduleName = node.arguments[0].value;

            // && !moduleName.startsWith("css!")) ||
            // (moduleName.endsWith(".css") && !moduleName.startsWith("css!")) ||
            // (moduleName.endsWith(".less") && !moduleName.startsWith("css!"))


            if ((moduleName.endsWith(".scss") || moduleName.endsWith(".css") || moduleName.endsWith(".less")) && !moduleName.startsWith("css!")) {
                moduleName = `css!${node.arguments[0].value}`;
                node.arguments[0].value = moduleName;
            }
            // else if (moduleName.endsWith(".less") && !moduleName.startsWith("less!")) {
            //     moduleName = `less!${node.arguments[0].value}`;
            //     node.arguments[0].value = moduleName;
            // }

            let s = this.createImportDeclaration(moduleName);
            this.improts.push(s);
        }

        return super.transform(node);
    }

    /**
     * 将如 const nervjs_1 = require("nervjs") 的语句转换为 import * as nervjs_1 from "nervjs"
     */
    private processVariableDeclaration(node: VariableDeclaration) {
        if (node.declarations.length != 1) {
            return super.transform(node);
        }

        let declaration = node.declarations[0];
        if (declaration.type != "VariableDeclarator" || declaration.id.type != "Identifier") {
            return super.transform(node);
        }

        let variableName: string;
        variableName = declaration.id.name;
        let initNode = declaration.init;
        if (initNode == null || initNode.type != "CallExpression" || initNode.callee.type != "Identifier" || initNode.callee.name != "require") {
            return super.transform(node);
        }

        let arg = initNode.arguments[0];
        if (arg == null || arg.type != "StringLiteral") {
            return super.transform(node);
        }

        let importDeclaration = this.createImportDeclaration(arg.value, variableName);
        return importDeclaration;
    }

    /**
     * 将如 require("index.less") 的语句转换为 import "index.less"
     */
    private processRequireStatement(node: Node) {
        if (node.type == "ExpressionStatement" && node.expression.type == "CallExpression" &&
            node.expression.callee.type == "Identifier" && node.expression.callee.name == "require" &&
            node.expression.arguments.length == 1 && node.expression.arguments[0].type == "StringLiteral") {
            let moduleName = node.expression.arguments[0].value;
            let s = this.createImportDeclaration(moduleName);
            this.improts.push(s);

            return node;
        }

        return super.transform(node);
    }

    private createImportDeclaration(moduleName: string, variableName?: string): babel.types.ImportDeclaration {
        return Nodecreator.createImportDeclaration(moduleName, variableName);
    }
}



class Nodecreator {
    static createImportDeclaration(moduleName: string, variableName?: string): babel.types.ImportDeclaration {
        if (!moduleName) throw errors.argumentNull("moduleName");


        if (moduleName.endsWith(".less")) {
            moduleName = `less!${moduleName}`;
        }


        let specifiers: ImportNamespaceSpecifier[] = [];
        if (variableName) {
            let specifier: babel.types.ImportNamespaceSpecifier = {
                type: "ImportNamespaceSpecifier",
                local: { type: "Identifier", name: variableName },

            } as babel.types.ImportNamespaceSpecifier;
            specifiers = [specifier];
        }
        let node = {
            type: "ImportDeclaration", specifiers,
            source: { type: "StringLiteral", value: moduleName } as babel.types.StringLiteral,
        } as babel.types.ImportDeclaration

        return node;
    }
}
