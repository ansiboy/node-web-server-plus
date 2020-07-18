import { RequestProcessor, RequestContext, RequestResult, VirtualDirectory } from "maishu-node-web-server";
import { ControllerLoader } from "../controller-loader";
import { MVCRequestContext } from "../types";
import * as errors from "../errors";
import { ActionParameterDecoder, metaKeys } from "../attributes";
import * as http from "http";
import { contentTypes } from "../action-results";

export interface MVCConfig {
    serverContextData?: any,
    controllersDirecotry: VirtualDirectory,
}

export class MVCRequestProcessor implements RequestProcessor {

    #controllerLoader: ControllerLoader;
    #serverContextData: any;

    constructor(config: MVCConfig) {
        if (config == null) throw errors.arugmentNull("config");
        if (config.controllersDirecotry == null) throw errors.arugmentFieldNull("controllersDirecotry", "config");

        this.#serverContextData = config.serverContextData || { logLevel: "all" };
        this.#controllerLoader = new ControllerLoader(config.controllersDirecotry);
    }

    execute(args: RequestContext): Promise<RequestResult> | null {

        let actionResult = this.#controllerLoader.findAction(args.virtualPath);
        if (actionResult == null)
            return null;


        let context = args as MVCRequestContext;
        context.data = this.#serverContextData;
        return this.executeAction(context, actionResult.controller, actionResult.action,
            actionResult.routeData)
            .then(r => {
                let StatusCode: keyof RequestResult = "statusCode";
                let Headers: keyof RequestResult = "headers";
                let Content: keyof RequestResult = "content";

                if (r[Content] != null && (r[StatusCode] != null || r[Headers] != null)) {
                    return r as RequestResult;
                }

                if (typeof r == "string")
                    return { content: r } as RequestResult;

                return { content: JSON.stringify(r), contentType: contentTypes.applicationJSON } as RequestResult;
            })
            .then(r => {
                if (context.logLevel == "all") {
                    r.headers = r.headers || {};
                    r.headers["controller-physical-path"] = actionResult?.controllerPhysicalPath || "";
                    if (typeof actionResult?.action == "function")
                        r.headers["member-name"] = (actionResult?.action as Function).name;
                }
                return r;
            })
    }

    private executeAction(context: MVCRequestContext, controller: object, action: Function, routeData: { [key: string]: string } | null) {

        if (!controller)
            throw errors.arugmentNull("controller")

        if (!action)
            throw errors.arugmentNull("action")

        // if (!req)
        //     throw errors.arugmentNull("req");

        // if (!res)
        //     throw errors.arugmentNull("res");

        routeData = routeData || {};

        let parameterDecoders: (ActionParameterDecoder<any>)[] = [];
        parameterDecoders = Reflect.getMetadata(metaKeys.parameter, controller, action.name) || [];
        parameterDecoders.sort((a, b) => a.parameterIndex < b.parameterIndex ? -1 : 1);
        let parameters: object[] = []
        return Promise.all(parameterDecoders.map(p => p.createParameter(context, routeData))).then(r => {
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