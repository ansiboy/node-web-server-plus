"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../dist/index");
// function connection() {
// }
// function createParameterDecorator<T>(createParameter: () => T, disposeParameter: (parameter: T) => void) {
//     return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
//     }
// }
let connection = index_1.createParameterDecorator(function () {
    return __awaiter(this, void 0, void 0, function* () {
        debugger;
        return {};
    });
}, function () {
    debugger;
});
let HomeController = class HomeController {
    index(conn, data) {
        return 'home index';
    }
    test({ arg }) {
        return arg;
    }
};
__decorate([
    index_1.action("/"),
    __param(0, connection), __param(1, index_1.formData)
], HomeController.prototype, "index", null);
__decorate([
    index_1.action(),
    __param(0, index_1.formData)
], HomeController.prototype, "test", null);
HomeController = __decorate([
    index_1.controller()
], HomeController);
exports.default = HomeController;
//# sourceMappingURL=home.js.map