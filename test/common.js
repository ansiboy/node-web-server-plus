"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maishu_node_web_server_1 = require("maishu-node-web-server");
const Browser = require("zombie");
const fs = require("fs");
const path = require("path");
exports.websitePhysicalPath = path.join(__dirname, "www");
function createWebserver(settings) {
    // let settings: Settings = { root: new VirtualDirectory(pathConcat(__dirname, "website")) };
    settings = settings || {};
    settings = Object.assign(settings, {
        root: new maishu_node_web_server_1.VirtualDirectory(exports.websitePhysicalPath)
    });
    let w = new maishu_node_web_server_1.WebServer(settings);
    console.log(`Web server port is ${settings.port}.`);
    return w;
}
exports.createWebserver = createWebserver;
function createBrowser() {
    return new Browser();
}
exports.createBrowser = createBrowser;
function readFile(physicalPath) {
    if (physicalPath == null)
        throw new Error(`Argument physicalPaht is null.`);
    if (fs.existsSync(physicalPath) == false)
        throw new Error(`File ${physicalPath} is not exists.`);
    let buffer = fs.readFileSync(physicalPath);
    let source = buffer.toString();
    return source;
}
exports.readFile = readFile;
