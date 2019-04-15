import "reflect-metadata";
interface ActionDefine {
    memberName: string;
    paths: string[];
}
interface ControllerDefine {
    type: ControllerType<any>;
    path: string;
    actionDefines: ActionDefine[];
}
export declare type ControllerType<T> = {
    new (): T;
};
export declare let controllerDefines: ControllerDefine[];
export declare function controller<T extends {
    new (...args: any[]): any;
}>(path?: string): (constructor: T) => void;
export declare function action(...paths: string[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function register<T>(type: ControllerType<T>, path?: string): {
    action(member: keyof T, paths?: string[] | undefined): any;
};
export {};
