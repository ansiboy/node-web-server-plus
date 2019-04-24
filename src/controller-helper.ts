import { ContentResult } from "./action-results";

export class ControllerHelper {
    content(value: string, contentType?: string) {
        // contentType = contentType || contentTypes.text_plain
        let r = new ContentResult(value, contentType)
        return r
    }
}