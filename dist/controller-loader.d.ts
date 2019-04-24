export declare class ControllerLoader {
    private actions;
    constructor(controller_directories: string[]);
    private joinPaths;
    private getControllerPaths;
    private loadController;
    getAction(virtualPath: string): {
        action: Function | null;
        controller: object | null;
    };
    isActionExists(virtualPath: string): boolean;
}
