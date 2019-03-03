import { startServer } from '../dist/index'
import path = require('path')
startServer({
    port: 1234,
    controllerDirectories: [path.join(__dirname, 'modules')]
})

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
