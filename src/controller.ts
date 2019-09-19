import { ContentResult, RedirectResult, ProxyResut, contentTypes } from "./action-results";
import { ServerContext } from "./server-context";

export class Controller {

    static typeName = "node-mvc.Controller";

    serverContext: ServerContext | null = null;

    content(value: string, statusCode: number): ContentResult;
    content(value: string, type: string, statusCode?: number): ContentResult;
    content(value: string, type?: string | number, statusCode?: number): ContentResult {
        if (typeof type == "number") {
            statusCode = type;
            type = undefined;
        }
        let r = new ContentResult(value, type, statusCode);
        return r
    }
    json(obj: any, statusCode?: number) {
        let str = JSON.stringify(obj)
        return this.content(str, contentTypes.applicationJSON, statusCode);
    }
    redirect(targetUrl: string) {
        let r = new RedirectResult(targetUrl);
        return r
    }
    proxy(targetUrl: string, method?: string) {
        let r = new ProxyResut(targetUrl, method);
        return r
    }
}