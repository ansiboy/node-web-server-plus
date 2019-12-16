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
const controller_1 = require("./controller");
const attributes_1 = require("./attributes");
function createAPIControllerType(getActionInfos, serverContext) {
    let APIControllerType = class APIController extends controller_1.Controller {
        list() {
            return __awaiter(this, void 0, void 0, function* () {
                let actionInfos = getActionInfos();
                let r = actionInfos.map(o => ({
                    path: o.actionPath,
                    controller: o.controllerType.name,
                    action: o.memberName,
                }));
                return r;
            });
        }
    };
    attributes_1.register(APIControllerType, serverContext).action("list", ["/api/action/list"]);
    return APIControllerType;
}
exports.createAPIControllerType = createAPIControllerType;
