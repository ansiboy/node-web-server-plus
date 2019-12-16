import { ContentResult, RedirectResult, ProxyResut } from "./action-results";
export declare class Controller {
    static typeName: string;
    content(value: string, statusCode: number): ContentResult;
    content(value: string, type: string, statusCode?: number): ContentResult;
    json(obj: any, statusCode?: number): ContentResult;
    redirect(targetUrl: string): RedirectResult;
    proxy(targetUrl: string, method?: string): ProxyResut;
}
