import { ControllerInfo } from "./attributes";

export interface ServerContext {
    data: any,
    controllerDefines: ControllerInfo[],
}
