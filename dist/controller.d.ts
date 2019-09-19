import { ContentResult, RedirectResult, ProxyResut } from "./action-results";
import { ServerContext } from "./server-context";
export declare class Controller {
    static typeName: string;
    serverContext: ServerContext | null;
    content(value: string, statusCode: number): ContentResult;
    content(value: string, type: string, statusCode?: number): ContentResult;
    json(obj: any, statusCode?: number): ContentResult;
    redirect(targetUrl: string): RedirectResult;
    proxy(targetUrl: string, method?: string): ProxyResut;
}
