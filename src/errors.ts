import { ControllerType } from "./attributes";

export function postDataNotJSON(data: string): Error {
    let msg = `提交的数据不是 JSON 格式。提交数据为：${data}`;
    let err = new Error(msg);
    err.name = postDataNotJSON.name
    return err;
}

export function arugmentNull(name: string) {
    let error = new Error(`Argument ${name} can not be null or empty.`)
    error.name = arugmentNull.name
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

