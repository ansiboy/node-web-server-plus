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
function controlRegister(type) {
    let msg = `Controller ${type.name} is register.`;
    let error = new Error(msg);
    error.name = controlRegister.name;
    return error;
}
exports.controlRegister = controlRegister;
function controllerDirectoriesNull() {
    let msg = `Controller directories can not null or empty.`;
    let error = new Error(msg);
    error.name = controllerDirectoriesNull.name;
    return error;
}
exports.controllerDirectoriesNull = controllerDirectoriesNull;
function unexpectedNullValue() {
    let msg = `Unexpected null value.`;
    let error = new Error(msg);
    error.name = unexpectedNullValue.name;
    return error;
}
exports.unexpectedNullValue = unexpectedNullValue;
//# sourceMappingURL=errors.js.map