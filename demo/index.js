import { startServer } from "../out/index.js";
import * as path from "path";
import { fileURLToPath } from "url";

let filePath = fileURLToPath(import.meta.url);
let __dirname = path.dirname(filePath);

let server = startServer({
    websiteDirectory: __dirname,
    port: 53646,
    virtualPaths: {
        "node_modules": path.join(__dirname, "node_modules")
    }
})


