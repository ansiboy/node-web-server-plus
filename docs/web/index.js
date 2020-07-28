"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maishu_node_mvc_1 = require("maishu-node-mvc");
const path = require("path");
maishu_node_mvc_1.startServer({
    port: 1234,
    controllerDirectory: path.join(__dirname, "controllers")
});
