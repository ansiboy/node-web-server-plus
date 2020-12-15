"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const out = __importStar(require("../../../out/index.js"));
const actionPaths_js_1 = require("../actionPaths.js");
const { controller, action, createParameterDecorator, routeData, ContentResult } = out;
// function connection() {
// }
// function createParameterDecorator<T>(createParameter: () => T, disposeParameter: (parameter: T) => void) {
//     return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
//     }
// }
let connection = createParameterDecorator(function () {
    return __awaiter(this, void 0, void 0, function* () {
        debugger;
        return {};
    });
}, function () {
    debugger;
});
let HomeController = 
/** 主页模块 */
class HomeController {
    /**
     * 首页
     * @param conn 数据库连接
     * @param data 表单数据
     */
    index(conn, data) {
        return 'home index';
    }
    test({ arg }) {
        return arg;
    }
    distributor() {
        return {};
    }
    product({ id }) {
        return { id };
    }
    redirect(data) {
        return data;
    }
    content() {
        return new ContentResult("Hello World", {});
    }
};
__decorate([
    action(actionPaths_js_1.actionPaths.home.index),
    __param(0, connection), __param(1, routeData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "index", null);
__decorate([
    action(),
    __param(0, routeData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "test", null);
__decorate([
    action(`${actionPaths_js_1.actionPaths.home.distributor}/*`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "distributor", null);
__decorate([
    action(`${actionPaths_js_1.actionPaths.home.product}/:id`),
    __param(0, routeData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "product", null);
__decorate([
    action(`${actionPaths_js_1.actionPaths.home.redirect}/:module(/*)`),
    __param(0, routeData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "redirect", null);
__decorate([
    action(actionPaths_js_1.actionPaths.home.content),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "content", null);
HomeController = __decorate([
    controller()
    /** 主页模块 */
], HomeController);
exports.HomeController = HomeController;
