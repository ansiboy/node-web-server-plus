
import * as errors from './errors'

interface ActionDefine {
    // method: Function,
    memberName: string,
    path?: string,
}

interface ControllerDefine {
    type: ControllerType<any>,
    path?: string,
    actionDefines: ActionDefine[]
}

export type ControllerType<T> = { new(): T }
export let controllerDefines: ControllerDefine[] = []

export function controller<T extends { new(...args: any[]): any }>(path?: string) {
    checkValidPath(path)
    return function (constructor: T) {
        registerController(constructor, path)

        return constructor
    }
}

export function action(path?: string) {
    checkValidPath(path)
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let memberName = descriptor.value.name
        registerAction<any>(target.constructor, memberName, path)
    };
}

export function register<T>(type: ControllerType<T>, path?: string) {
    registerController(type, path)
    let obj = {
        action(member: keyof T, path?: string) {
            registerAction(type, member, path)
            return obj
        }
    }

    return obj
}

function registerController<T>(type: ControllerType<T>, path?: string) {
    let controllerDefine = controllerDefines.filter(o => o.type == type)[0]
    if (controllerDefine == null) {
        controllerDefine = { type: type, actionDefines: [] }
        controllerDefines.push(controllerDefine)
    }
    controllerDefine.path = path
    return controllerDefine
}

function registerAction<T>(controllerType: ControllerType<T>, memberName: keyof T, path?: string) {
    console.assert(typeof memberName == 'string')
    let controllerDefine = controllerDefines.filter(o => o.type == controllerType)[0]
    if (controllerDefine == null) {
        controllerDefine = registerController(controllerType)
    }

    controllerDefine.actionDefines.push({ memberName: memberName as string, path })
}

function checkValidPath(path: string) {
    if (!path) throw errors.arugmentNull('path')
    if (path[0] != '/')
        throw new Error(`Path must starts with '/', actual is '${path}'`)

}
