"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let specialChars = [':', '?', '*', '(', ')'];
/**
 * 判断指定的路径是否为路由字符串
 * @param path 指定的路径
 */
function isRouteString(path) {
    for (let i = 0; i < path.length; i++) {
        if (specialChars.indexOf(path[i]) >= 0)
            return true;
    }
    return false;
}
exports.isRouteString = isRouteString;
