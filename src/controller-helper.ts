import { ContentResult } from "./action-results";

export class ControllerHelper {
    content(value: string, contentType?: string) {
        let r = new ContentResult(value, contentType)
        return r
    }
}