import { ControllerType } from "./attributes";
export declare function postDataNotJSON(data: string): Error;
export declare function arugmentNull(name: string): Error;
export declare function controllerDirectoryNotExists(dir: string): Error;
export declare function controlRegister(type: ControllerType<any>): Error;
export declare function controllerDirectoriesNull(): Error;
export declare function unexpectedNullValue(name: string): Error;
export declare function onlyOneAction(methodName: string): Error;
export declare function rootPathNull(): Error;
