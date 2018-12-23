
interface ActionDefine {
    method: Function,
    path?: string,
}

interface ControllerDefine {
    type: ControllerType,
    path?: string,
    actionDefines: ActionDefine[]
}

export type ControllerType = { new(): { [name: string]: Function } }
export let controllerDefines: ControllerDefine[] = []

export function controller<T extends { new(...args: any[]): any }>(path?: string) {
    return function (constructor: T) {
        let controllerDefine = controllerDefines.filter(o => o.type == constructor)[0]
        if (controllerDefine == null) {
            controllerDefine = { type: constructor, actionDefines: [] }
            controllerDefines.push(controllerDefine)
        }
        controllerDefine.path = path

        return constructor
    }
}

export function action(path?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        controllerDefines[target.constructor.name] = controllerDefines[target.constructor.name] || target.constructor
        let controllerDefine = controllerDefines.filter(o => o.type == target.constructor)[0]
        if (controllerDefine == null) {
            controllerDefine = { type: target.constructor, actionDefines: [] }
            controllerDefines.push(controllerDefine)
        }

        controllerDefine.actionDefines.push({ method: descriptor.value, path })

    };
}
