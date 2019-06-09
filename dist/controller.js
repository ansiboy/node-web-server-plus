"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_results_1 = require("./action-results");
class Controller {
    content(value, type) {
        let r = new action_results_1.ContentResult(value, type);
        return r;
    }
    redirect(targetUrl) {
        let r = new action_results_1.RedirectResult(targetUrl);
        return r;
    }
    proxy(targetUrl) {
        let r = new action_results_1.ProxyResut(targetUrl);
        return r;
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map