"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
describe("java-script-processor", function () {
    it("js-to-amd", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let t = new java_script_processor_1.JavaScriptProcessor();
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
    it("ts-to-amd", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let t = new java_script_processor_1.JavaScriptProcessor();
            let context = {
                req: null,
                res: null,
                virtualPath: "sample.js",
                rootDirectory: new out_1.VirtualDirectory(__dirname),
                logLevel: "all"
            };
            let r = yield t.execute(context);
            let content = r.content;
            assert.ok(content.indexOf("define") >= 0);
        });
    });
});
