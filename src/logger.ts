import log4js = require("log4js");

let categories: log4js.Configuration["categories"] = {
    default: {
        appenders: ['console'], level: 'debug'
    }
}

let appenders: log4js.Configuration["appenders"] = {
    console: { type: "console" }
}

log4js.configure({ appenders, categories });

export type LogLevel = keyof Pick<log4js.Logger, 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>;
export function getLogger(categoryName: string, logLevel?: LogLevel) {
    if (logLevel == null)
        logLevel = 'info';

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