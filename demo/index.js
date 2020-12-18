const { startServer } = require("../out");
const path = require("path");

let server = startServer({
    rootDirectory: __dirname,
    port: 53646,
    virtualPaths: {
        "node_modules": path.join(__dirname, "node_modules")
    }
})


