import { Config } from './server';
export declare class ControllerLoader {
    private areaControllers;
    private rootPath;
    private actions;
    constructor(areas: Config['areas'], rootPath: string);
    private initAreas;
    private loadController;
    getAction(virtualPath: string): Function;
}
