
import * as errors from './errors'
import { controllerSuffix } from './constants';
import "reflect-metadata";
import http = require('http')

const actionMetaKey = Symbol('action')
const parameterMetaKey = Symbol('parameter')

export let metaKeys = {
    action: actionMetaKey,
    parameter: parameterMetaKey
}

export interface ActionParameterDecoder<T> {
    parameterIndex: number,
    createParameter: (req: http.IncomingMessage) => Promise<T>,
    disposeParameter?: (parameter: T) => void
}

interface ActionDefine {
    memberName: string,
    paths: string[],
}

interface ControllerDefine {
    type: ControllerType<any>,
    path: string,
    actionDefines: ActionDefine[]
}

export type ControllerType<T> = { new(): T }
export let controllerDefines: ControllerDefine[] = []

/**
 * 标记一个类是否为控制器
 * @param path 路径
 */
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
    }
}

/**
 * 标记一个方法是否为 Action
 * @param paths 路径
 */
export function action(...paths: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let memberName = descriptor.value.name
        let obj: ActionDefine = { memberName, paths }
        let controllerType = target.constructor
        let actionDefine = Reflect.getMetadata(actionMetaKey, controllerType, propertyKey)
        if (actionDefine)
            throw errors.onlyOneAction(propertyKey)

        Reflect.defineMetadata(actionMetaKey, obj, controllerType, propertyKey)
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

    return controllerDefine
}

function registerAction<T>(controllerDefine: ControllerDefine, memberName: keyof T, paths: string[]) {
    if (controllerDefine == null)
        throw errors.arugmentNull('controllerDefine')

    console.assert(typeof memberName == 'string')
    controllerDefine.actionDefines.push({ memberName: memberName as string, paths })
}

export function createParameterDecorator<T>(createParameter: (req: http.IncomingMessage) => Promise<T>, disposeParameter?: (parameter: T) => void) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {

        let value: ActionParameterDecoder<T>[] = Reflect.getMetadata(metaKeys.parameter, target, propertyKey) || []
        let p: ActionParameterDecoder<T> = {
            createParameter,
            disposeParameter,
            parameterIndex
        }
        value.push(p)

        Reflect.defineMetadata(metaKeys.parameter, value, target, propertyKey)
    }
}



