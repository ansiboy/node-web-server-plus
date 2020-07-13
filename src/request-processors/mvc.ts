import { RequestProcessor, RequestContext, Content, ExecuteResult, VirtualDirectory } from "maishu-node-web-server";
import { ControllerLoader } from "../controller-loader";
import { ServerContext } from "../types";
import * as errors from "../errors";
import { ActionParameterDecoder, metaKeys } from "../attributes";
import * as http from "http";

export interface MVCConfig {
    serverContext?: ServerContext,
    controllersDirecotry: VirtualDirectory,
}

export class MVCRequestProcessor implements RequestProcessor {

    #controllerLoader: ControllerLoader;
    #serverContext: ServerContext;

    constructor(config: MVCConfig) {
        if (config == null) throw errors.arugmentNull("config");
        if (config.controllersDirecotry == null) throw errors.arugmentFieldNull("controllersDirecotry", "config");

        this.#serverContext = config.serverContext || { logLevel: "all" };
        this.#controllerLoader = new ControllerLoader(config.controllersDirecotry);
    }

    execute(args: RequestContext): Promise<ExecuteResult> | null {

        let actionResult = this.#controllerLoader.findAction(args.virtualPath);
        if (actionResult == null)
            return null;

        return this.executeAction(this.#serverContext, actionResult.controller, actionResult.action,
            actionResult.routeData, args.req, args.res)
            .then(r => {
                let StatusCode: keyof ExecuteResult = "statusCode";
                let ContentType: keyof ExecuteResult = "contentType";
                let Content: keyof ExecuteResult = "content";

                if (r[Content] != null && (r[StatusCode] != null || r[ContentType] != null)) {
                    return r;
                }
                return { content: JSON.stringify(r) };
            })
    }

    private executeAction(serverContext: ServerContext, controller: object, action: Function, routeData: { [key: string]: string } | null,
        req: http.IncomingMessage, res: http.ServerResponse) {

        if (!controller)
            throw errors.arugmentNull("controller")

        if (!action)
            throw errors.arugmentNull("action")

        if (!req)
            throw errors.arugmentNull("req");

        if (!res)
            throw errors.arugmentNull("res");

        routeData = routeData || {};

        let parameterDecoders: (ActionParameterDecoder<any>)[] = [];
        parameterDecoders = Reflect.getMetadata(metaKeys.parameter, controller, action.name) || [];
        parameterDecoders.sort((a, b) => a.parameterIndex < b.parameterIndex ? -1 : 1);
        let parameters: object[] = []
        return Promise.all(parameterDecoders.map(p => p.createParameter(req, res, serverContext, routeData))).then(r => {
            parameters = r;
            let actionResult = action.apply(controller, parameters);
            let p = actionResult as Promise<any>;
            if (p == null || p.then == null) {
                p = Promise.resolve(actionResult);
            }
            return p;
        }).finally(() => {
            for (let i = 0; i < parameterDecoders.length; i++) {
                let d = parameterDecoders[i]
                if (d.disposeParameter) {
                    d.disposeParameter(parameters[d.parameterIndex])
                }
            }
        })
    }
}