import { ContentResult, RedirectResult } from "./action-results";

export class Controller {
    content(value: string, type?: string): ContentResult {
        let r = new ContentResult(value, type)
        return r
    }
    redirect(targetUrl: string) {
        let r = new RedirectResult(targetUrl)
        return r
    }
}