import log4js = require("log4js");
export declare type LogLevel = keyof Pick<log4js.Logger, 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>;
export declare function getLogger(categoryName: string, logLevel?: LogLevel): log4js.Logger;
