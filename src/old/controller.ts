import { ContentResult, RedirectResult, ProxyResut, contentTypes, Headers } from "./action-results";

// type Headers = { [key: string]: string | string[] };
export class Controller {

    static typeName = "node-mvc.Controller";

    content(value: string, statusCode?: number): ContentResult;
    content(value: string, contentType: string, statusCode?: number): ContentResult;
    content(value: string, headers: Headers, statusCode?: number): ContentResult;
    content(value: string, type?: string | number | Headers, statusCode?: number): ContentResult {
        if (typeof type == "number") {
            statusCode = type;
            type = undefined;
        }

        let headers: Headers;
        if (typeof type == "number") {
            headers = {};
        }
        else if (typeof type == "string") {
            headers = { "content-type": type };
        }
        else {
            headers = type || {};
        }
        let r: ContentResult = new ContentResult(value, headers, statusCode);
        return r;
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