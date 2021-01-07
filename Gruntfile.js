function modifyVersion() {
    const package = require("./package.json");

    let version = package.version || "1.0.0";
    let arr = version.split(".");
    arr[arr.length - 1] = (Number.parseInt(arr[arr.length - 1]) + 1).toString();
    version = arr.join(".");
    package.version = version;

    const fs = require('fs');
    let data = JSON.stringify(package, null, 4);
    fs.writeFileSync("package.json", data, "utf8");
};
modifyVersion();

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        shell: {
            src: {
                command: `tsc -p src`
            },
            babel: {
                command: "babel src -d out --extensions .ts"
            },
            webpack: {
                command: "webpack"
            }
        }
    });

    grunt.registerTask('default', ["shell:src"]);
}
