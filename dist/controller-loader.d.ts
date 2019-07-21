export declare class ControllerLoader {
    private pathActions;
    private routeActions;
    constructor(controllerDirectories: string[]);
    private joinPaths;
    /**
     * 获取指定文件夹中（包括子目录），控制器的路径。
     * @param dir 控制器的文件夹
     */
    private getControllerPaths;
    private loadController;
    getAction(virtualPath: string): {
        action: any;
        controller: any;
        routeData: {
            [key: string]: string;
        } | null;
    } | null;
}
