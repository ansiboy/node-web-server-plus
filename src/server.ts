import { Settings } from "./types";
import {
    WebServer, Settings as WebServerSettings, pathConcat, StaticFileProcessor, HeadersProcessor, VirtualDirectory
} from "maishu-node-web-server";

import * as fs from "fs";
import * as errors from "./errors";
import { MVCRequestProcessor } from "maishu-node-web-server-mvc";

export function startServer(settings: Settings) {

    if (settings.rootDirectory == null)
        throw errors.arugmentFieldNull("rootDirectory", "settings");

    if (typeof settings.rootDirectory == "string" && !fs.existsSync(settings.rootDirectory))
        throw errors.physicalPathNotExists(settings.rootDirectory);

    var rootDirectory = typeof settings.rootDirectory == "string" ? new VirtualDirectory(settings.rootDirectory) : settings.rootDirectory;
    if (settings.staticRootDirectory == null) {
        let staticRootDirectory = rootDirectory.findDirectory("static");
        if (staticRootDirectory)
            settings.staticRootDirectory = staticRootDirectory;
    }

    if (settings.controllerDirectory == null) {
        let controllerDirectory = rootDirectory.findDirectory("controllers");
        if (controllerDirectory)
            settings.controllerDirectory = controllerDirectory;
    }

    let r: WebServerSettings = {
        port: settings.port,
        bindIP: settings.bindIP,
        websiteDirectory: settings.staticRootDirectory,
    }

    let server = new WebServer(r);
    // if (settings.requestResultTransforms)
    //     server.contentTransforms.push(...settings.requestResultTransforms);

    if (settings.controllerDirectory) {
        var mvcProcessor = new MVCRequestProcessor({
            controllersDirectory: settings.controllerDirectory,
            serverContextData: settings.serverContextData,
        });

        var staticFileProcessor = server.requestProcessors.filter(o => o instanceof StaticFileProcessor)[0];
        console.assert(staticFileProcessor != null, "Can not find static file processor");
        var staticFileProcessorIndex = server.requestProcessors.indexOf(staticFileProcessor);
        server.requestProcessors.splice(staticFileProcessorIndex, 0, mvcProcessor);
    }

    if (settings.headers) {
        var headersProcessor = server.requestProcessors.filter(o => o instanceof HeadersProcessor)[0] as HeadersProcessor;
        console.assert(headersProcessor != null, "Can not find headers processor.");
        headersProcessor.headers = headersProcessor.headers || {};
        for (let key in settings.headers) {
            headersProcessor.headers[key] = settings.headers[key];
        }
    }



    if (settings.virtualPaths) {
        for (let virtualPath in settings.virtualPaths) {
            let physicalPath = settings.virtualPaths[virtualPath];
            if (virtualPath[0] != "/")
                virtualPath = "/" + virtualPath;

            server.websiteDirectory.setPath(virtualPath, physicalPath);
        }
    }

    return server;
}


// export let defaultRequestProcessorTypes = [HeadersRequestProcessor, MVCRequestProcessor, ...WebServer.defaultRequestProcessorTypes];
// export function createequestProcessorConfigs(settings: Pick<Settings, "controllerDirectory" | "proxy" | "fileProcessors" | "headers" | "logLevel" | "serverContextData">) {
//     let requestProcessorConfigs = {} as any;
//     let proxyConfig: ProxyConfig = {
//         proxyTargets: settings.proxy || {},
//     };
//     requestProcessorConfigs[ProxyRequestProcessor.name] = proxyConfig;

//     let controllersDirecotry: VirtualDirectory;
//     if (settings.controllerDirectory == null) {
//         controllersDirecotry = new VirtualDirectory(__dirname);
//     }
//     else if (typeof settings.controllerDirectory == "string") {
//         controllersDirecotry = new VirtualDirectory(settings.controllerDirectory);
//     }
//     else {
//         controllersDirecotry = settings.controllerDirectory;
//     }

//     let mvcConfig: MVCConfig = {
//         controllersDirecotry,
//         serverContextData: settings.serverContextData,//{ data: settings.serverContextData, logLevel: settings.logLevel || "all" },
//     }
//     requestProcessorConfigs[MVCRequestProcessor.name] = mvcConfig;

//     let headers: Headers = settings.headers || {};
//     requestProcessorConfigs[HeadersRequestProcessor.name] = headers;

//     let staticConfig: StaticFileProcessorConfig = {
//         fileProcessors: Object.assign({
//             "less": textFileProcessor
//         }, settings.fileProcessors)
//     }
//     requestProcessorConfigs[StaticFileRequestProcessor.name] = staticConfig;

//     return requestProcessorConfigs;
// }

