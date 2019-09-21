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
function unexpectedNullValue(name) {
    let msg = `Unexpected null value.`;
    let error = new Error(msg);
    error.name = unexpectedNullValue.name;
    return error;
}
exports.unexpectedNullValue = unexpectedNullValue;
function onlyOneAction(methodName) {
    let msg = `Method can only define one action, method '${methodName}' is deined.`;
    let error = new Error(msg);
    error.name = onlyOneAction.name;
    return error;
}
exports.onlyOneAction = onlyOneAction;
function rootPathNull() {
    let msg = `Root path of config is null or emtpy.`;
    let error = new Error(msg);
    error.name = rootPathNull.name;
    return error;
}
exports.rootPathNull = rootPathNull;
function rootPathNotAbsolute(path) {
    let msg = `Root path '${path}' is not a absolute path.`;
    let error = new Error(msg);
    error.name = rootPathNotAbsolute.name;
    return error;
}
exports.rootPathNotAbsolute = rootPathNotAbsolute;
function authenticateResultNull() {
    let msg = `Authenticate result cannt null`;
    let error = new Error(msg);
    error.name = authenticateResultNull.name;
    return error;
}
exports.authenticateResultNull = authenticateResultNull;
function notAbsolutePath(path) {
    let msg = `Path '${path}' is not a absolute path.`;
    let error = new Error(msg);
    error.name = rootPathNotAbsolute.name;
    return error;
}
exports.notAbsolutePath = notAbsolutePath;
function pageNotFound(path) {
    let msg = `Path '${path}' not found.`;
    let error = new Error(msg);
    error.name = pageNotFound.name;
    error.statusCode = 404;
    return error;
}
exports.pageNotFound = pageNotFound;
function requestNotReadable() {
    let msg = `The request is not readable.`;
    let error = new Error(msg);
    error.name = requestNotReadable.name;
    return error;
}
exports.requestNotReadable = requestNotReadable;
