"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function postDataNotJSON(data) {
    let msg = `提交的数据不是 JSON 格式。提交数据为：${data}`;
    let err = new Error(msg);
    err.name = postDataNotJSON.name;
    return err;
}
exports.postDataNotJSON = postDataNotJSON;
function arugmentNull(name) {
    let error = new Error(`Argument ${name} can not be null or empty.`);
    error.name = arugmentNull.name;
    return error;
}
exports.arugmentNull = arugmentNull;
function controllerDirectoryNotExists(dir) {
    let error = new Error(`Controller directory ${dir} is not exists.`);
    error.name = controllerDirectoryNotExists.name;
    return error;
}
exports.controllerDirectoryNotExists = controllerDirectoryNotExists;
//# sourceMappingURL=errors.js.map