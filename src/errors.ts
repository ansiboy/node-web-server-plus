

export function controllerNotExist(path: string): Error {
    let msg = `Controller is not exists in path '${path}'.`;
    let error = new Error(msg);
    error.name = controllerNotExist.name;
    return error;
}

export function loadControllerFail(name: string, innerError: Error) {
    let msg = `Load controller '${name}' fail.`;
    let error = new Error(msg);
    error.name = loadControllerFail.name;
    error.innerError = innerError
    return error;
}

export function canntGetControlName(url: string) {
    let msg = `Cannt get controll name from url:${url}`;
    let error = new Error(msg);
    error.name = canntGetControlName.name
    return error;
}

export function canntGetActionName(url: string) {
    let msg = `Cannt get action name from url:${url}`;
    let error = new Error(msg);
    error.name = canntGetActionName.name
    return error;
}

export function configNotExists(path: string) {
    let msg = `Config file '${path}' is not exists`;
    let err = new Error(msg)
    err.name = configNotExists.name
    return err
}

export function postDataNotJSON(data: string): Error {
    let msg = `提交的数据不是 JSON 格式。提交数据为：${data}`;
    let err = new Error(msg);
    err.name = postDataNotJSON.name
    return err;
}

export function actionNotExists(action: string, controller: string): Error {
    let msg = `Action '${action}' is not exists in controller '${controller}'`;
    let error = new Error(msg);
    error.name = actionNotExists.name;
    return error;
}

export function parameterRequired(name: string) {
    let error = new Error(`Parameter '${name}' is required.`)
    error.name = parameterRequired.name
    return error
}

export function controlAreaNotExists(name: string) {
    let error = new Error(`Controller area '${name}' is not exists.`)
    error.name = controlAreaNotExists.name
    return error
}

export function arugmentNull(name: string) {
    let error = new Error(`Argument ${name} can not be null or empty.`)
    error.name = arugmentNull.name
    return error
}

