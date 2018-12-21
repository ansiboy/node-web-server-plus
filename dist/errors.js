"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function controllerNotExist(path) {
    let msg = `Controller is not exists in path '${path}'.`;
    let error = new Error(msg);
    error.name = controllerNotExist.name;
    return error;
}
exports.controllerNotExist = controllerNotExist;
function loadControllerFail(name, innerError) {
    let msg = `Load controller '${name}' fail.`;
    let error = new Error(msg);
    error.name = loadControllerFail.name;
    error.innerError = innerError;
    return error;
}
exports.loadControllerFail = loadControllerFail;
function canntGetControlName(url) {
    let msg = `Cannt get controll name from url:${url}`;
    let error = new Error(msg);
    error.name = canntGetControlName.name;
    return error;
}
exports.canntGetControlName = canntGetControlName;
function canntGetActionName(url) {
    let msg = `Cannt get action name from url:${url}`;
    let error = new Error(msg);
    error.name = canntGetActionName.name;
    return error;
}
exports.canntGetActionName = canntGetActionName;
function configNotExists(path) {
    let msg = `Config file '${path}' is not exists`;
    let err = new Error(msg);
    err.name = configNotExists.name;
    return err;
}
exports.configNotExists = configNotExists;
function postDataNotJSON(data) {
    let msg = `提交的数据不是 JSON 格式。提交数据为：${data}`;
    let err = new Error(msg);
    err.name = postDataNotJSON.name;
    return err;
}
exports.postDataNotJSON = postDataNotJSON;
function actionNotExists(action, controller) {
    let msg = `Action '${action}' is not exists in controller '${controller}'`;
    let error = new Error(msg);
    error.name = actionNotExists.name;
    return error;
}
exports.actionNotExists = actionNotExists;
function parameterRequired(name) {
    let error = new Error(`Parameter '${name}' is required.`);
    error.name = parameterRequired.name;
    return error;
}
exports.parameterRequired = parameterRequired;
function controlAreaNotExists(name) {
    let error = new Error(`Controller area '${name}' is not exists.`);
    error.name = controlAreaNotExists.name;
    return error;
}
exports.controlAreaNotExists = controlAreaNotExists;
function arugmentNull(name) {
    let error = new Error(`Argument ${name} can not be null or empty.`);
    error.name = arugmentNull.name;
    return error;
}
exports.arugmentNull = arugmentNull;
//# sourceMappingURL=errors.js.map