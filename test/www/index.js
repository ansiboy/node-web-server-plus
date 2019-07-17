"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../dist/index");
const path = require("path");
index_1.startServer({
    port: 1234,
    rootPath: __dirname,
    controllerDirectory: [
        path.join(__dirname, 'controllers'),
        path.join(__dirname, 'controllers1')
    ]
    // controllerDirectories: [path.join(__dirname, 'controllers')],
    // staticFileDirectory: path.join(__dirname, 'public')
});
// http.request({
//     path: ''
// })
// function formatString(str, args) {
//     return str.replace(/\$(\d+)/g, function (match, number) {
//         console.log(match)
//         return typeof args[number] != 'undefined' ? args[number] : match;
//     });
// };
// console.log(formatString('AA $0', [1]))
// let regex = new RegExp(`http\:\/\/www.163.com\/(\S+)`)
// let target = 'http://localhost:2635/$1'
// let arr = regex.exec("http://www.163.com/admin")
// if (arr) {
//     target = target.replace(/\$(\d+)/, (match, number) => {
//         return typeof arr[number] != 'undefined' ? arr[number] : match;
//     })
// }
// console.log(arr)
// console.log(target)
//# sourceMappingURL=index.js.map