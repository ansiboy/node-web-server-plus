import { Settings } from "./types";
import {
    WebServer, HeadersProcessor,
    getLogger, StaticFileProcessor, processorPriorities, ProxyProcessor, RequestProcessor
} from "maishu-node-web-server";

import { JavaScriptProcessor } from "maishu-nws-js";
import { Json5Processor } from "./processors/json5-processor";
import { LessProcessor } from "./processors/less-processor";
import * as errors from "./errors";
import * as fs from "fs";
import { loadPlugins } from "./load-plugins";
import { MVCRequestProcessor } from "maishu-nws-mvc";

export function startServer(settings: Settings, mode?: "static" | "mvc") {

    let packagePath = "../package.json";
    let pkg = require(packagePath);
    let logger = getLogger(pkg.name, settings.log?.level);

    mode = mode || "mvc";
    logger.info(`${startServer.name}: Current mode is ${mode}.`)

    if (settings.websiteDirectory == null)
        throw errors.arugmentFieldNull("rootDirectory", "settings");

    if (typeof settings.websiteDirectory == "string" && !fs.existsSync(settings.websiteDirectory))
        throw errors.physicalPathNotExists(settings.websiteDirectory);

    let server = new WebServer(settings);
    let rootDirectory = server.websiteDirectory;

    let staticFileProcessor = server.requestProcessors.find(StaticFileProcessor);
    console.assert(staticFileProcessor != null);
    staticFileProcessor.options.contentTypes[".svg"] = "image/svg+xml";
    staticFileProcessor.options.contentTypes[".webp"] = "image/webp";
    logger.info(staticFileProcessor.contentTypes);

    var javaScriptProcessor = new JavaScriptProcessor();
    server.requestProcessors.add(javaScriptProcessor);

    var json5Processor = new Json5Processor();
    server.requestProcessors.add(json5Processor);

    var lessProcessor = new LessProcessor();
    server.requestProcessors.add(lessProcessor);

    javaScriptProcessor.options.babel = {
        "\\S+.js$": {
            "presets": [
                ["@babel/preset-env", {
                    "targets": { chrome: 58 }
                }],
            ],
            plugins: [
                ["@babel/plugin-transform-modules-amd", { noInterop: true }]
            ]
        },
        "\\S+.ts$": {
            "presets": [
                ["@babel/preset-env", {
                    "targets": { chrome: 58 }
                }]
            ],
            plugins: [
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-transform-typescript", { isTSX: false }],
                ["@babel/plugin-transform-react-jsx", { "pragma": "React.createElement", "pragmaFrag": "React.Fragment" }],
                ["@babel/plugin-transform-modules-amd", { noInterop: true }],
            ]
        },
        "\\S+.tsx$": {
            "presets": [
                ["@babel/preset-env", {
                    "targets": { chrome: 58 }
                }]
            ],
            plugins: [
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-transform-typescript", { isTSX: true }],
                ["@babel/plugin-transform-react-jsx", { "pragma": "React.createElement", "pragmaFrag": "React.Fragment" }],
                ["@babel/plugin-transform-modules-amd", { noInterop: true }],

            ]
        },
    }

    if (settings.headers) {
        var headersProcessor = server.requestProcessors.find(HeadersProcessor);
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

    if (settings.proxy) {
        let proxyProcessor = server.requestProcessors.find(ProxyProcessor);
        proxyProcessor.options.proxyTargets = settings.proxy;
    }

    let mvcProcessor = new MVCRequestProcessor();
    mvcProcessor.priority = processorPriorities.ProxyRequestProcessor + 10;
    server.requestProcessors.add(mvcProcessor);
    settings.controllerDirectory = settings.controllerDirectory || "controllers";
    mvcProcessor.options.controllersDirectories = [settings.controllerDirectory];
    mvcProcessor.contextData = settings.contextData || settings.serverContextData;


    loadPlugins(rootDirectory, logger, server);

    if (settings.processors != null) {
        for (let i = 0; i < server.requestProcessors.length; i++) {
            let requestProcessor = server.requestProcessors.item(i);
            let name = requestProcessor.constructor.name;
            let processorProperties = settings.processors[name];
            for (let prop in processorProperties) {
                if ((requestProcessor as any)[prop]) {
                    (requestProcessor as any)[prop] = processorProperties[prop];
                }
            }
        }
    }

    if (mode == "mvc") {
        let staticDir = rootDirectory.findDirectory("public") || rootDirectory.findDirectory("static");
        let nodeModulesDir = rootDirectory.findDirectory("node_modules");
        if (staticDir != null && nodeModulesDir != null) {
            staticDir.setPath("node_modules", nodeModulesDir.physicalPath);
        }

        staticFileProcessor.options.directoryPath = rootDirectory.findDirectory("public") != null ? "public" : "static";
        javaScriptProcessor.options.directoryPath = staticFileProcessor.options.directoryPath;
        lessProcessor.options.directoryPath = staticFileProcessor.options.directoryPath;
    }



    return server;
}



