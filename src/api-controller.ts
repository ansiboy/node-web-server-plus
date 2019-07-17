import { Controller } from "./controller";
import { register, ControllerType } from "./attributes";

export type ActionInfo = {
    controllerType: ControllerType<any>, memberName: string, actionPath: string
}

export function createAPIControllerType(getActionInfos: () => ActionInfo[]) {
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
    register(APIControllerType).action("list", ["/api/action/list"]);

    return APIControllerType;
}