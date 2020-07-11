import { WebServer, Settings, VirtualDirectory } from "maishu-node-web-server";
import Browser = require('zombie');
import * as fs from "fs";
import * as path from "path";

export let websitePhysicalPath = path.join(__dirname, "www");
export function createWebserver(settings?: Settings) {
    // let settings: Settings = { root: new VirtualDirectory(pathConcat(__dirname, "website")) };
    settings = settings || {};
    settings = Object.assign(settings, {
        root: new VirtualDirectory(websitePhysicalPath)
    })
    let w = new WebServer(settings);
    console.log(`Web server port is ${settings.port}.`);

    return w;
}

export function createBrowser() {
    return new Browser();
}

export function readFile(physicalPath: string | null) {
    if (physicalPath == null)
        throw new Error(`Argument physicalPaht is null.`);

    if (fs.existsSync(physicalPath) == false)
        throw new Error(`File ${physicalPath} is not exists.`);

    let buffer: Buffer = fs.readFileSync(physicalPath);
    let source: string = buffer.toString();
    return source;
}