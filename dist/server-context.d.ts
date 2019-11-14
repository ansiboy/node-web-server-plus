import { ControllerInfo, Settings } from "./types";
export interface ServerContext {
    controllerDefines: ControllerInfo[];
    settings: Settings;
}
