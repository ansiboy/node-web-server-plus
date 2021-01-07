"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const zombie_1 = __importDefault(require("zombie"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const out_1 = require("../out");
exports.websitePhysicalPath = path.join(__dirname, "www");
function createWebserver(settings) {
    let defaultSettings = {
        // rootDirectory: __dirname,
        websiteDirectory: path.join(__dirname, "www"),
        staticPath: "public",
        controllerDirectory: path.join(__dirname, "www", "controllers"),
    };
    settings = Object.assign(defaultSettings, settings || {});
    let w = out_1.startServer(settings);
    console.log(`Web server port is ${w.port}.`);
    return w;
}
exports.createWebserver = createWebserver;
function createBrowser() {
    return new zombie_1.default();
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
