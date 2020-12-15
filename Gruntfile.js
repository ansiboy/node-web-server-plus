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
        babel: {
            options: {
                sourceMap: false,
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            "chrome": "58",
                            "ie": "11"
                        }
                    }],
                ],
                "plugins": [
                    "@babel/plugin-transform-typescript"
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'test',
                    src: ['**/*.ts'],
                    dest: 'test_out',
                    ext: ".js"
                }]
            },
        },
        shell: {
            src: {
                command: `tsc -p src`
            },
            test: {
                command: "babel test -d test_out"
            }
        },
    });

    grunt.registerTask('default', ['shell']);
}
