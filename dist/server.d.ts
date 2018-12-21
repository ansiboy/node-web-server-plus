export interface Config {
    port: number;
    bindIP?: string;
    rootPath?: string;
    areas?: {
        [area: string]: string | {
            [controller: string]: string;
        };
    };
}
export declare function startServer(config: Config): void;
export declare const contentTypes: {
    application_json: string;
    text_plain: string;
};
export declare class ContentResult {
    data: string;
    statusCode: number;
    contentType: string;
    constructor(data: string, contentType: string, statusCode?: number);
}
