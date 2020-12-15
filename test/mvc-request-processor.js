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
const home_js_1 = require("./www/controllers/home.js");
const assert = __importStar(require("assert"));
describe("mvc-request-processor", function () {
    let webServer = common_js_1.createWebserver();
    let browser = common_js_1.createBrowser();
    it("execute action", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `http://127.0.0.1:${webServer.port}/home/product/1`;
            yield browser.visit(url);
            let ctrl = new home_js_1.HomeController();
            let r = ctrl.product({ id: "1" });
            assert.equal(browser.source, JSON.stringify(r));
        });
    });
});
