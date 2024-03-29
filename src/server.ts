import { Settings } from "./types.js";
import { WebServer, getLogger } from "maishu-node-web-server";

import { JavaScriptProcessor } from "maishu-nws-js";
import { Json5Processor } from "./processors/json5-processor.js";
import { LessProcessor } from "./processors/less-processor.js";
import * as errors from "./errors.js";
import * as fs from "fs";
import * as http from "http";
import { loadPlugins } from "./load-plugins.js";
import { MVCRequestProcessor } from "maishu-nws-mvc";

export async function startServer(settings: Settings, mode?: "static" | "mvc") {


    let pkg = await import("../package.json");
    let logger = getLogger(pkg.name, settings.log?.level);
    logger.info(`${startServer.name}: Current mode is ${mode}.`);

    mode = mode || "mvc";

    if (settings.websiteDirectory == null)
        throw errors.arugmentFieldNull("rootDirectory", "settings");

    if (typeof settings.websiteDirectory == "string" && !fs.existsSync(settings.websiteDirectory))
        throw errors.physicalPathNotExists(settings.websiteDirectory);

    let server = new WebServer(settings);
    let rootDirectory = server.websiteDirectory;

    let staticFileProcessor = server.requestProcessors.staticProcessor;//.find(StaticFileProcessor);


    var javaScriptProcessor = new JavaScriptProcessor();
    javaScriptProcessor.babelOptions = {
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

    server.requestProcessors.fileProcessor.processors[".js"] = javaScriptProcessor;
    server.requestProcessors.fileProcessor.processors[".jsx"] = javaScriptProcessor;
    server.requestProcessors.fileProcessor.processors[".ts"] = javaScriptProcessor;
    server.requestProcessors.fileProcessor.processors[".tsx"] = javaScriptProcessor;

    var json5Processor = new Json5Processor();
    server.requestProcessors.fileProcessor.processors[".json"] = json5Processor;
    server.requestProcessors.fileProcessor.processors[".json5"] = json5Processor;

    var lessProcessor = new LessProcessor();
    server.requestProcessors.fileProcessor.processors[".less"] = lessProcessor;
    server.requestProcessors.fileProcessor.processors[".css"] = lessProcessor;
    server.requestProcessors.fileProcessor.processors[".scss"] = lessProcessor;


    if (settings.headers) {
        var headersProcessor = server.requestProcessors.headersProcessor;
        console.assert(headersProcessor != null, "Can not find headers processor.");
        headersProcessor.headers = headersProcessor.headers || {};
        for (let key in settings.headers) {
            headersProcessor.headers[key] = settings.headers[key];
        }

        let outputError = server.outputError;
        server.outputError = function (err: Error | string, res: http.ServerResponse) {
            for (let key in settings.headers) {
                res.setHeader(key, settings.headers[key]);
            }
            outputError.apply(this, [err, res]);
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
        let proxyProcessor = server.requestProcessors.proxyProcessor;
        proxyProcessor.proxyTargets = settings.proxy;
    }

    let mvcProcessor = new MVCRequestProcessor();
    server.requestProcessors.fileProcessor.processors[""] = mvcProcessor;
    settings.controllerDirectory = settings.controllerDirectory || "controllers";
    mvcProcessor.controllerDirectories = [settings.controllerDirectory];
    mvcProcessor.contextData = settings.contextData || settings.serverContextData;


    loadPlugins(rootDirectory, logger, server);

    if (settings.processors != null) {
        let requestProcessors = server.requestProcessors.items;
        for (let i = 0; i < requestProcessors.length; i++) {
            let requestProcessor = requestProcessors[i];
            let name = requestProcessor.constructor.name;
            let shortName: string | null = null;
            if (name.endsWith("Processor")) {
                shortName = name.substr(0, name.length - "Processor".length);
            }

            let processorProperties: any | null = null;
            if (shortName != null) {
                processorProperties = settings.processors[shortName];
            }
            if (processorProperties == null) {
                processorProperties = settings.processors[name];
            }

            processorProperties = processorProperties || {};
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

        staticFileProcessor.staticPath = rootDirectory.findDirectory("public") != null ? "public" : "static";
        javaScriptProcessor.directoryPath = staticFileProcessor.staticPath === null ? undefined : staticFileProcessor.staticPath;
        lessProcessor.directoryPath = staticFileProcessor.staticPath;
    }

    return server;
}



