
import * as errors from './errors'
import { controllerSuffix } from './constants';
import "reflect-metadata";

const actionMetaKey = Symbol('action')

interface ActionDefine {
    // controllerType: Function,
    memberName: string,
    paths: string[],
}

interface ControllerDefine {
    type: ControllerType<any>,
    path: string,
    actionDefines: ActionDefine[]
}

// let actionsToRegister: {
//     controllerType: ControllerType<any>,
//     memberName: string, path?: string
// }[] = []

export type ControllerType<T> = { new(): T }
export let controllerDefines: ControllerDefine[] = []

export function controller<T extends { new(...args: any[]): any }>(path?: string) {
    return function (constructor: T) {

        let controllerDefine = registerController(constructor, path)
        let propertyNames = Object.getOwnPropertyNames(constructor.prototype)
        for (let i = 0; i < propertyNames.length; i++) {
            let metadata: ActionDefine = Reflect.getMetadata(actionMetaKey, constructor, propertyNames[i])
            if (metadata) {
                registerAction(controllerDefine, metadata.memberName, metadata.paths)
            }
        }
        //let actionMetaDatas = Reflect.getOwnMetadata(actionMetaKey, constructor)

        // let controllerDefine = registerController(constructor, path)
        // let items = actionsToRegister.filter(o => o.controllerType = constructor)
        // for (let i = 0; i < items.length; i++) {
        //     registerAction(controllerDefine, items[i].memberName, items[i].path)
        // }

        // actionsToRegister = actionsToRegister.filter(o => o.controllerType != constructor)
        // return constructor
    }
}

export function action(...paths: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let memberName = descriptor.value.name
        let obj: ActionDefine = { memberName, paths }
        let controllerType = target.constructor
        let actionDefine = Reflect.getMetadata(actionMetaKey, controllerType, propertyKey)
        if (actionDefine)
            throw errors.onlyOneAction(propertyKey)

        Reflect.defineMetadata(actionMetaKey, obj, controllerType, propertyKey)

        // actionsToRegister.push({ controllerType: target.constructor, memberName, path })
    };
}

export function register<T>(type: ControllerType<T>, path?: string) {
    let controllerDefine = registerController(type, path)
    let obj = {
        action(member: keyof T, paths?: string[]) {
            registerAction(controllerDefine, member, paths || [])
            return obj
        }
    }

    return obj
}

function registerController<T>(type: ControllerType<T>, path?: string) {
    if (!path) {
        path = type.name.endsWith(controllerSuffix) ?
            type.name.substring(0, type.name.length - controllerSuffix.length) : type.name
    }

    if (path && path[0] != '/')
        path = '/' + path

    let controllerDefine = controllerDefines.filter(o => o.type == type)[0]
    if (controllerDefine != null)
        throw errors.controlRegister(type)

    controllerDefine = { type: type, actionDefines: [], path }
    controllerDefines.push(controllerDefine)

    // Reflect.getMetadataKeys()

    return controllerDefine
}

function registerAction<T>(controllerDefine: ControllerDefine, memberName: keyof T, paths: string[]) {
    if (controllerDefine == null)
        throw errors.arugmentNull('controllerDefine')

    console.assert(typeof memberName == 'string')
    controllerDefine.actionDefines.push({ memberName: memberName as string, paths })
}


