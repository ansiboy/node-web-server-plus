const { startServer } = require("../out");
const path = require("path");

let server = startServer({
    websiteDirectory: __dirname,
    port: 53646,
    virtualPaths: {
        "node_modules": path.join(__dirname, "node_modules")
    }
})


