"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const out_1 = require("../../out");
const java_script_processor_1 = require("../../out/processors/java-script-processor");
const path = require("path");
const fs = require("fs");
const assert = require("assert");
describe("java-script-processor", function () {
    it("commonjs-to-amd", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let t = new java_script_processor_1.JavaScriptProcessor();
            let pre = {
                content: fs.readFileSync(path.join(__dirname, "../common.js"))
            };
            let context = {
                req: null,
                res: null,
                virtualPath: "/common.js",
                rootDirectory: new out_1.VirtualDirectory(path.join(__dirname, "../")),
                logLevel: "all"
            };
            let r = yield t.execute(context);
            let content = r.content;
            assert.ok(content.indexOf("define") >= 0);
        });
    });
});
