/// <reference types="node" />
import "reflect-metadata";
import http = require('http');
export declare let metaKeys: {
    action: symbol;
    parameter: symbol;
};
export interface ActionParameterDecoder<T> {
    parameterIndex: number;
    createParameter: (req: http.IncomingMessage) => Promise<T>;
    disposeParameter?: (parameter: T) => void;
}
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
/**
 * 标记一个类是否为控制器
 * @param path 路径
 */
export declare function controller<T extends {
    new (...args: any[]): any;
}>(path?: string): (constructor: T) => void;
/**
 * 标记一个方法是否为 Action
 * @param paths 路径
 */
export declare function action(...paths: string[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function register<T>(type: ControllerType<T>, path?: string): {
    action(member: keyof T, paths?: string[] | undefined): any;
};
export declare function createParameterDecorator<T>(createParameter: (req: http.IncomingMessage) => Promise<T>, disposeParameter?: (parameter: T) => void): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export {};
