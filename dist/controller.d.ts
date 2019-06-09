import { ContentResult, RedirectResult, ProxyResut } from "./action-results";
export declare class Controller {
    content(value: string, type?: string): ContentResult;
    redirect(targetUrl: string): RedirectResult;
    proxy(targetUrl: string): ProxyResut;
}
