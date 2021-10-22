"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = exports.createBrowser = exports.createWebserver = exports.websitePhysicalPath = void 0;
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
