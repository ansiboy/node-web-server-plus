import * as http from 'http';
import { VirtualDirectory, RequestContext, Settings as WebServerSettings, ProxyProcessor } from 'maishu-node-web-server';

interface MVCRequestContext<T = {}> extends RequestContext {
    data?: T,
}

export type ServerContext<T = {}> = MVCRequestContext<T>;

export type Settings = WebServerSettings & {
    controllerDirectory?: string,
    /** 静态文件夹路径 */
    staticPath?: string,

    /** @deprecated 使用 contextData 替代 */
    serverContextData?: any,

    /** 上下文数据 */
    contextData?: any,

    headers?: { [name: string]: string },
    virtualPaths?: { [virtualPath: string]: string },
    /** 请求处理选项配置 */
    processors?: { [name: string]: any },
    proxy?: ProxyProcessor["proxyTargets"];
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
