#!/usr/bin/env node

const { DataSourceSelectArguments } = require('maishu-toolkit');
const yargs = require("yargs");
const path = require("path");
const fs = require("fs");
const { startServer } = require("../out");

var argv = require('yargs')
    .describe({ p: "服务器端口" })
    .describe({ d: "文档夹路径" }).demandOption(["d"])
    .default({ p: 9868 })
    .usage("Usage: $0 -d <website path> [options] ")
    .check((argv, options) => {
        argv.d = typeof argv.d == "string" ? argv.d : "";
        argv.p = typeof argv.p == "number" ? argv.p : Number.parseInt(argv.p);

        if (!argv.d) {
            throw new Error("文件夹路径不允许为空")
        }

        if (!path.isAbsolute(argv.d))
            argv.d = path.join(__dirname, argv.d);

        if (!fs.existsSync(argv.d))
            throw new Error(`路径 ${argv.d} 不存在`);

        return true;
    })
    .argv;

console.log(argv.d)
let rootPath = argv.d;
if (!path.isAbsolute(rootPath)) {
    rootPath = path.join(__dirname, rootPath);
}

startServer({
    rootDirectory: rootPath,
    port: argv.p,
    virtualPaths: {
        "node_modules": path.join(rootPath, "node_modules")
    }
});

