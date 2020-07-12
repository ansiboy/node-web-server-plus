import { Settings } from "./types";
import { WebServer, Settings as WebServerSettings, VirtualDirectory, ProxyConfig, ProxyRequestProcessor } from "maishu-node-web-server";
import { MVCRequestProcessor, MVCConfig, HeadersRequestProcessor, Headers } from "./request-processors";

export function startServer(settings: Settings) {

    let requestProcessorConfigs = {} as any;
    let proxyConfig: ProxyConfig = {
        proxyTargets: settings.proxy || {},
    };
    requestProcessorConfigs[ProxyRequestProcessor.name] = proxyConfig;

    let mvcConfig: MVCConfig = {
        controllersDirecotry: new VirtualDirectory(settings.controllerDirectory || __dirname),
        serverContext: { data: settings.serverContextData }
    }
    requestProcessorConfigs[MVCRequestProcessor.name] = mvcConfig;

    let headers: Headers = settings.headers || {};
    requestProcessorConfigs[HeadersRequestProcessor.name] = headers;

    let server = new MVCServer({
        port: settings.port,
        bindIP: settings.bindIP,
        root: settings.staticRootDirectory,
        requestProcessorConfigs,
        requestProcessorTypes: [HeadersRequestProcessor, MVCRequestProcessor, ...WebServer.defaultRequestProcessorTypes]
    })

    return server;
}

class MVCServer extends WebServer {
    constructor(settings: WebServerSettings) {
        super(settings)
    }
}

