import { RequestProcessor, RequestContext } from "maishu-node-web-server";
import * as errors from "../errors";

export type Headers = { [name: string]: string }
export class HeadersRequestProcessor implements RequestProcessor {
    #headers: Headers;

    constructor(headers: Headers) {
        if (headers == null) throw errors.arugmentNull("headers");

        this.#headers = headers;
    }

    execute(args: RequestContext) {
        for (let key in this.#headers) {
            args.res.setHeader(key, this.#headers[key]);
        }
        return null;
    }
}