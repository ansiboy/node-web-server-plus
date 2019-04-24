"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_results_1 = require("./action-results");
class ControllerHelper {
    content(value, contentType) {
        // contentType = contentType || contentTypes.text_plain
        let r = new action_results_1.ContentResult(value, contentType);
        return r;
    }
}
exports.ControllerHelper = ControllerHelper;
//# sourceMappingURL=controller-helper.js.map