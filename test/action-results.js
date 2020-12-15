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
const common_js_1 = require("./common.js");
const actionPaths_js_1 = require("./www/actionPaths.js");
const home_js_1 = require("./www/controllers/home.js");
const assert = __importStar(require("assert"));
describe("action results", function () {
    it("content result", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let webServer = common_js_1.createWebserver();
            let browser = common_js_1.createBrowser();
            let url = `http://127.0.0.1:${webServer.port}/${actionPaths_js_1.actionPaths.home.content}`;
            yield browser.visit(url);
            let ctr = new home_js_1.HomeController();
            let r = ctr.content().execute({});
            assert.equal(browser.source, r.content);
        });
    });
    it("controller physical path header", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let webServer = common_js_1.createWebserver();
            let browser = common_js_1.createBrowser();
            let url = `http://127.0.0.1:${webServer.port}/${actionPaths_js_1.actionPaths.home.content}`;
            yield browser.visit(url);
            let h = browser.response.headers.get("controller-physical-path");
            assert.notEqual(h || "", "");
        });
    });
});
