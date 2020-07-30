import { Settings } from "./types";
import {
    WebServer, Settings as WebServerSettings, VirtualDirectory, ProxyConfig, ProxyRequestProcessor, textFileProcessor,
    StaticFileProcessorConfig, StaticFileRequestProcessor, pathConcat
} from "maishu-node-web-server";
import { MVCRequestProcessor, MVCConfig, HeadersRequestProcessor, Headers } from "./request-processors";
import * as fs from "fs";
import * as errors from "./errors";


export function startServer(settings: Settings) {

    if (!settings.rootPath && !fs.existsSync(settings.rootPath))
        throw errors.physicalPathNotExists(settings.rootPath);

    if (settings.staticRootDirectory == null && settings.rootPath != null) {
        let staticPath = pathConcat(settings.rootPath, "static");
        if (fs.existsSync(staticPath)) {
            settings.staticRootDirectory = pathConcat(settings.rootPath, "static");
        }
    }

    if (settings.controllerDirectory == null && settings.rootPath != null) {
        let controllerPath = pathConcat(settings.rootPath, "controllers");
        if (fs.existsSync(controllerPath)) {
            settings.controllerDirectory = pathConcat(settings.rootPath, "controllers");
        }
    }

    let r: WebServerSettings = {
        port: settings.port,
        bindIP: settings.bindIP,
        websiteDirectory: settings.staticRootDirectory,
        requestProcessorConfigs: createequestProcessorConfigs(settings),
        requestProcessorTypes: defaultRequestProcessorTypes,
        requestResultTransforms: settings.requestResultTransforms
    }

    let server = new WebServer(r);
    if (settings.virtualPaths) {
        for (let virtualPath in settings.virtualPaths) {
            if (virtualPath[0] != "/")
                virtualPath = "/" + virtualPath;

            server.websiteDirectory.setPath(virtualPath, settings.virtualPaths[virtualPath]);
        }
    }

    return server;
}


export let defaultRequestProcessorTypes = [HeadersRequestProcessor, MVCRequestProcessor, ...WebServer.defaultRequestProcessorTypes];
export function createequestProcessorConfigs(settings: Pick<Settings, "controllerDirectory" | "proxy" | "fileProcessors" | "headers" | "logLevel" | "serverContextData">) {
    let requestProcessorConfigs = {} as any;
    let proxyConfig: ProxyConfig = {
        proxyTargets: settings.proxy || {},
    };
    requestProcessorConfigs[ProxyRequestProcessor.name] = proxyConfig;

    let controllersDirecotry: VirtualDirectory;
    if (settings.controllerDirectory == null) {
        controllersDirecotry = new VirtualDirectory(__dirname);
    }
    else if (typeof settings.controllerDirectory == "string") {
        controllersDirecotry = new VirtualDirectory(settings.controllerDirectory);
    }
    else {
        controllersDirecotry = settings.controllerDirectory;
    }

    let mvcConfig: MVCConfig = {
        controllersDirecotry,
        serverContextData: settings.serverContextData,//{ data: settings.serverContextData, logLevel: settings.logLevel || "all" },
    }
    requestProcessorConfigs[MVCRequestProcessor.name] = mvcConfig;

    let headers: Headers = settings.headers || {};
    requestProcessorConfigs[HeadersRequestProcessor.name] = headers;

    let staticConfig: StaticFileProcessorConfig = {
        fileProcessors: Object.assign({
            "less": textFileProcessor
        }, settings.fileProcessors)
    }
    requestProcessorConfigs[StaticFileRequestProcessor.name] = staticConfig;

    return requestProcessorConfigs;
}

