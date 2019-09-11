import { ControllerType } from "./attributes";
import { ServerContext } from "./server-context";
export declare type ActionInfo = {
    controllerType: ControllerType<any>;
    memberName: string;
    actionPath: string;
};
export declare function createAPIControllerType(getActionInfos: () => ActionInfo[], serverContext: ServerContext): {
    new (): {
        list(): Promise<{
            path: string;
            controller: string;
            action: string;
        }[]>;
        serverContext: ServerContext | null;
        content(value: string, statusCode: number): import("./action-results").ContentResult;
        content(value: string, type: string, statusCode?: number | undefined): import("./action-results").ContentResult;
        json(obj: any, statusCode?: number | undefined): import("./action-results").ContentResult;
        redirect(targetUrl: string): import("./action-results").RedirectResult;
        proxy(targetUrl: string): import("./action-results").ProxyResut;
    };
    typeName: string;
};
