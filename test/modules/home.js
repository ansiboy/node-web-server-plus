"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../dist/index");
let HomeController = class HomeController {
    index() {
        return 'home index';
    }
    test({ arg }) {
        return arg;
    }
};
__decorate([
    index_1.action("/")
], HomeController.prototype, "index", null);
__decorate([
    index_1.action()
], HomeController.prototype, "test", null);
HomeController = __decorate([
    index_1.controller()
], HomeController);
exports.default = HomeController;
//# sourceMappingURL=home.js.map