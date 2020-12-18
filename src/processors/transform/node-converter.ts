import { Program, Node, Statement, StringLiteral, VariableDeclarator } from "@babel/types";
import * as errors from "../../errors";

export abstract class NodeConverter {
    transform(node: Node): Node | null {
        if (node == null) throw errors.argumentNull("node");
        switch (node.type) {
            case "Program":
                let statements: Statement[] = [];
                for (let i = 0; i < node.body.length; i++) {
                    let statement = this.transform(node.body[i]) as Statement;
                    if (statement != null)
                        statements.push(statement);
                }

                break;
            case "ImportDeclaration":
                node.source = this.transform(node.source) as StringLiteral;
                break;
            case "File":
                node.program = this.transform(node.program) as Program;
                break;
            case "VariableDeclaration":
                for (let i = 0; i < node.declarations.length; i++) {
                    node.declarations[i] = this.transform(node.declarations[i]) as VariableDeclarator;
                }
                break;
            case "VariableDeclarator":
                if (node.init != null)
                    node.init = this.transform(node.init) as typeof node.init;
                break;
            case "CallExpression":
                node.callee = this.transform(node.callee) as typeof node.callee;
                for (let i = 0; i < node.arguments.length; i++) {
                    node.arguments[i] = this.transform(node.arguments[i]) as typeof node.arguments[0];
                }


                break;
            case "ExpressionStatement":
                node.expression = this.transform(node.expression) as typeof node.expression;
                break;
        }

        return node;

    }
}
