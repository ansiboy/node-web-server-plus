"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Browser = require("zombie");
const fs = require("fs");
const path = require("path");
const out_1 = require("../out");
exports.websitePhysicalPath = path.join(__dirname, "www");
function createWebserver(settings) {
    let defaultSettings = {
        rootDirectory: __dirname,
        staticRootDirectory: path.join(__dirname, "www"),
        controllerDirectory: path.join(__dirname, "www", "controllers"),
    };
    settings = Object.assign(settings || {}, defaultSettings);
    let w = out_1.startServer(settings);
    console.log(`Web server port is ${w.port}.`);
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
