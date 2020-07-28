import { startServer } from "maishu-node-mvc";
import * as path from "path";

startServer({
    port: 1234,
    controllerDirectory: path.join(__dirname, "controllers")
})