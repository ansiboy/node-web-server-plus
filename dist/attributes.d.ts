/// <reference types="node" />
import "reflect-metadata";
import http = require('http');
import { ServerContext } from './server-context';
import { ControllerType } from './types';
export declare let metaKeys: {
    action: string;
    parameter: string;
};
export interface ActionParameterDecoder<T> {
    parameterIndex: number;
    createParameter: (req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext, routeData: {
        [key: string]: string;
    } | null) => Promise<T>;
    disposeParameter?: (parameter: T) => void;
}
export declare let CONTROLLER_REGISTER: string;
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
export declare function register<T>(type: ControllerType<T>, serverContext: ServerContext, path?: string): {
    action(member: keyof T, paths?: string[] | undefined): any;
};
export declare function createParameterDecorator<T>(createParameter: (req: http.IncomingMessage, res: http.ServerResponse, context: ServerContext, routeData: {
    [key: string]: string;
} | null) => Promise<T>, disposeParameter?: (parameter: T) => void): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare let routeData: (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare let formData: (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare let request: (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare let response: (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare let requestHeaders: (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare let context: (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
