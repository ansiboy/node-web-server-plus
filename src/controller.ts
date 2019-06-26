import { ContentResult, RedirectResult, ProxyResut, contentTypes } from "./action-results";

export class Controller {
    content(value: string, type?: string): ContentResult {
        let r = new ContentResult(value, type)
        return r
    }
    json(obj: any) {
        let str = JSON.stringify(obj)
        return this.content(str, contentTypes.applicationJSON)
    }
    redirect(targetUrl: string) {
        let r = new RedirectResult(targetUrl)
        return r
    }
    proxy(targetUrl: string) {
        let r = new ProxyResut(targetUrl)
        return r
    }
}