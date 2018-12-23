interface ActionDefine {
    method: Function;
    path?: string;
}
interface ControllerDefine {
    type: ControllerType;
    path?: string;
    actionDefines: ActionDefine[];
}
export declare type ControllerType = {
    new (): {
        [name: string]: Function;
    };
};
export declare let controllerDefines: ControllerDefine[];
export declare function controller<T extends {
    new (...args: any[]): any;
}>(path?: string): (constructor: T) => T;
export declare function action(path?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export {};
