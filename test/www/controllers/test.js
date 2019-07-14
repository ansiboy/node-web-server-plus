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
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../dist/index");
class Test extends index_1.Controller {
    index() {
        return this.content("<html><body><h1>Hello World</h1><body><html>", "text/html; charset=UTF-8");
    }
    j() {
        return { a: 10, b: 10 };
    }
    product({ id, name }) {
        return `id: ${id}, name: ${name}`;
    }
}
__decorate([
    index_1.action(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "index", null);
__decorate([
    index_1.action("/j"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "j", null);
__decorate([
    index_1.action("/product/:id"),
    __param(0, index_1.routeData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Test.prototype, "product", null);
exports.Test = Test;
//# sourceMappingURL=test.js.map