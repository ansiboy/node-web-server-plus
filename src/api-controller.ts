import { Controller } from "./controller";
import { register } from "./attributes";
import { ControllerType, ActionPath, ControllerInfo } from "./types";

export type ActionInfo = {
    controllerType: ControllerType<any>, memberName: string, actionPath: ActionPath,
    controllerPhysicalPath: string
}

export function createAPIControllerType(getActionInfos: () => ActionInfo[], serverContext: ControllerInfo[]) {
    let APIControllerType = class APIController extends Controller {
        async list() {
            let actionInfos = getActionInfos();
            let r = actionInfos.map(o => ({
                path: o.actionPath,
                controller: o.controllerType.name,
                action: o.memberName,
            }))

            return r;
        }
    }
    register(APIControllerType, serverContext, __filename).action("list", ["/api/action/list"]);

    return APIControllerType;
}