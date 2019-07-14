export declare class ControllerLoader {
    private pathActions;
    private routeActions;
    constructor(controller_directories: string[]);
    private joinPaths;
    private getControllerPaths;
    private loadController;
    getAction(virtualPath: string): {
        action: any;
        controller: any;
        routeData: {
            [key: string]: string;
        } | null;
    };
}
