import Browser = require('zombie');
import * as fs from "fs";
import * as path from "path";
import { startServer, Settings } from "../out";

export let websitePhysicalPath = path.join(__dirname, "www");
export function createWebserver(settings?: Partial<Settings>) {
    let defaultSettings: Settings = {
        rootPath: __dirname,
        staticRootDirectory: path.join(__dirname, "www"),
        controllerDirectory: path.join(__dirname, "www", "controllers"),
    }

    settings = Object.assign(settings || {}, defaultSettings);

    let w = startServer(settings as Settings);
    console.log(`Web server port is ${w.port}.`);

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