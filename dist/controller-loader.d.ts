import { ServerContext } from './server-context';
export declare class ControllerLoader {
    private pathActions;
    private routeActions;
    constructor(serverContext: ServerContext, controllerDirectories: string[]);
    private joinPaths;
    /**
     * 获取指定文件夹中（包括子目录），控制器的路径。
     * @param dir 控制器的文件夹
     */
    private getControllerPaths;
    private loadController;
    getAction(virtualPath: string, serverContext: ServerContext): {
        action: any;
        controller: any;
        routeData: {
            [key: string]: string;
        } | null;
    } | null;
}
