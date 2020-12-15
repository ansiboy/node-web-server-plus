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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../out/index.js");
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const fs = __importStar(require("fs"));
const maishu_node_web_server_1 = require("maishu-node-web-server");
describe("virtual-directory", function () {
    describe("create virtual directory", function () {
        let b = path.join(__dirname, "www/public/b");
        let c = path.join(__dirname, "www/public/c");
        it("directores", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let dir = index_js_1.createVirtualDirecotry(b, c);
                let dirs = dir.directories();
                let names1 = fs.readdirSync(b).filter(n => fs.statSync(maishu_node_web_server_1.pathConcat(b, n)).isDirectory());
                let names2 = fs.readdirSync(c).filter(n => fs.statSync(maishu_node_web_server_1.pathConcat(c, n)).isDirectory());
                assert.equal(names1.length + names2.length, Object.getOwnPropertyNames(dirs).length);
            });
        });
        it("files", function () {
            let dir = index_js_1.createVirtualDirecotry(b, c);
            let files = {};
            fs.readdirSync(b).filter(n => fs.statSync(maishu_node_web_server_1.pathConcat(b, n)).isFile())
                .forEach(n => {
                files[n] = maishu_node_web_server_1.pathConcat(b, n);
            });
            fs.readdirSync(c).filter(n => fs.statSync(maishu_node_web_server_1.pathConcat(c, n)).isFile())
                .forEach(n => {
                files[n] = maishu_node_web_server_1.pathConcat(c, n);
            });
            assert.equal(Object.getOwnPropertyNames(files).length, Object.getOwnPropertyNames(dir.files()).length);
        });
    });
});
