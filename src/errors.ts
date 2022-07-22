import { ControllerType } from "./types.js";



export function postDataNotJSON(data: string) {
    let msg = `提交的数据不是 JSON 格式。提交数据为：${data}`;
    let err = new Error(msg);
    err.name = postDataNotJSON.name
    return err;
}

export function argumentNull(name: string) {
    let error = new Error(`Argument ${name} can not be null or empty.`)
    error.name = argumentNull.name
    return error
}

export function arugmentFieldNull(fieldName: string, argumentName: string) {
    let error = new Error(`Field '${fieldName}' of argument ${argumentName} can not be null or empty.`)
    error.name = arugmentFieldNull.name;
    return error
}

export function controllerDirectoryNotExists(dir: string) {
    let error = new Error(`Controller directory ${dir} is not exists.`)
    error.name = controllerDirectoryNotExists.name
    return error
}

export function controlRegister(type: ControllerType<any>) {
    let msg = `Controller ${type.name} is register.`
    let error = new Error(msg)
    error.name = controlRegister.name
    return error
}

export function controllerDirectoriesNull() {
    let msg = `Controller directories can not null or empty.`
    let error = new Error(msg)
    error.name = controllerDirectoriesNull.name
    return error
}

export function unexpectedNullValue(name: string) {
    let msg = `Unexpected null value.`
    let error = new Error(msg)
    error.name = unexpectedNullValue.name
    return error
}

export function onlyOneAction(methodName: string) {
    let msg = `Method can only define one action, method '${methodName}' is deined.`
    let error = new Error(msg)
    error.name = onlyOneAction.name
    return error
}

export function rootPathNull() {
    let msg = `Root path of config is null or emtpy.`
    let error = new Error(msg)
    error.name = rootPathNull.name
    return error
}

export function rootPathNotAbsolute(path: string) {
    let msg = `Root path '${path}' is not a absolute path.`;
    let error = new Error(msg);
    error.name = rootPathNotAbsolute.name;
    return error;
}

export function authenticateResultNull() {
    let msg = `Authenticate result cannt null`
    let error = new Error(msg)
    error.name = authenticateResultNull.name
    return error
}

export function notAbsolutePath(path: string) {
    let msg = `Path '${path}' is not a absolute path.`;
    let error = new Error(msg);
    error.name = rootPathNotAbsolute.name;
    return error;
}

export function pageNotFound(path: string) {
    let msg = `Path '${path}' not found.`;
    let error = new Error(msg);
    error.name = pageNotFound.name;
    error.statusCode = 404;
    return error;
}

export function requestNotReadable() {
    let msg = `The request is not readable.`;
    let error = new Error(msg);
    error.name = requestNotReadable.name;
    return error;
}

export function connectionClose() {
    let msg = `Connection close.`;
    let error = new Error(msg);
    error.name = connectionClose.name;
    return error;
}

export function physicalPathNotExists(physicalPath: string) {
    let msg = `Physical path '${physicalPath}' is not exists`;
    let error = new Error(msg);
    error.name = physicalPathNotExists.name;
    return error;
}

export function virtualPathConfigError(virtualPath: string, physicalPath: string) {
    let msg = `Virtual path '${virtualPath}' config error, physical path ${physicalPath} is not exists.`;
    let error = new Error(msg);
    error.name = virtualPathConfigError.name;
    return error;
}

export function virutalDirectoryNotExists(virtualPath: string) {
    let msg = `Virtual directory '${virtualPath}' is not exists`;
    let error = new Error(msg);
    error.name = virutalDirectoryNotExists.name;
    return error;
}
