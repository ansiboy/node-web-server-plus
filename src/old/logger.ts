import log4js = require("log4js");
import * as errors from "./errors";

let categories: log4js.Configuration["categories"] = {
    default: {
        appenders: ['console'], level: 'debug',
    }
}

let appenders: log4js.Configuration["appenders"] = {
    console: {
        type: "console",
        layout: {
            type: "pattern",
            pattern: "%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] %x{projectName} - %m%n%]",
            tokens: {
                projectName(logEvent) {
                    let arr = logEvent.categoryName.split("-");
                    console.assert(arr.length > 1, `Category name format is incorrect.Category name is ${logEvent.categoryName}`);
                    arr.pop();
                    let r = arr.join("-");
                    return r;
                }
            }
        }
    }
}

log4js.configure({ appenders, categories });

export type LogLevel = keyof Pick<log4js.Logger, 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'> | "all" | "off" | 'mark';

export function getLogger(categoryName: string, logLevel?: LogLevel) {

    if (!categoryName) throw errors.arugmentNull("categoryName");

    if (logLevel == null)
        logLevel = 'all';

    categoryName = `${categoryName}-${logLevel}`;
    if (categories[categoryName] == null) {
        categories[categoryName] = {
            appenders: ['console'], level: logLevel
        }

        log4js.configure({ appenders, categories });
    }

    let logger = log4js.getLogger(categoryName);
    return logger;
}