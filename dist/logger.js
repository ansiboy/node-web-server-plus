"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
let categories = {
    default: {
        appenders: ['console'], level: 'debug'
    }
};
let appenders = {
    console: { type: "console" }
};
log4js.configure({ appenders, categories });
function getLogger(categoryName, logLevel) {
    if (logLevel == null)
        logLevel = 'info';
    categoryName = `${categoryName}-${logLevel}`;
    if (categories[categoryName] == null) {
        categories[categoryName] = {
            appenders: ['console'], level: logLevel
        };
        log4js.configure({ appenders, categories });
    }
    let logger = log4js.getLogger(categoryName);
    return logger;
}
exports.getLogger = getLogger;
