const { startServer } = require("../out");
const path = require("path");

let server = startServer({
    websiteDirectory: path.join(__dirname, "static"),
    port: 53646,
    virtualPaths: {
        "node_modules": path.join(__dirname, "node_modules")
    }
})


