import * as http from 'http';
import { VirtualDirectory, RequestContext, Settings as WebServerSettings } from 'maishu-node-web-server';

export interface MVCRequestContext<T = {}> extends RequestContext {
    data?: T,
}

export type ServerContext<T = {}> = MVCRequestContext<T>;

export type Settings = WebServerSettings & {
    controllerDirectory?: string | VirtualDirectory,
    /** 项目根目录 */
    rootDirectory?: string | VirtualDirectory,
    serverContextData?: any,
    headers?: { [name: string]: string },
    virtualPaths?: { [virtualPath: string]: string },
    /** 请求处理选项配置 */
    processors?: { [name: string]: any }
};

export interface ControllerInfo {
    type: ControllerType<any>,
    path: string,
    actionDefines: ActionInfo[],
    physicalPath: string
}

export type ControllerType<T> = { new(): T }

export interface ActionInfo {
    memberName: string,
    paths: ActionPath[],
}

export type ActionPath = string | ((virtualPath: string) => object | null);

export interface ActionResult {
    execute(res: http.ServerResponse, req: http.IncomingMessage, context: MVCRequestContext): Promise<any>
}
