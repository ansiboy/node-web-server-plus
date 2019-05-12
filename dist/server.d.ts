import nodeStatic = require('maishu-node-static');
export interface Config {
    port: number;
    bindIP?: string;
    rootPath: string;
    proxy?: {
        [path_pattern: string]: string;
    };
    requestUrlRewrite?: {
        [url_pattern: string]: string;
    };
    controllerDirectory?: string;
    staticRootDirectory?: string;
    staticExternalDirectories?: string[];
}
export declare function startServer(config: Config): {
    staticServer: nodeStatic.Server;
};
export declare let formData: (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
