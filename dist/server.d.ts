export interface Config {
    port: number;
    bindIP?: string;
    rootPath: string;
    proxy?: {
        [path_pattern: string]: string;
    };
    controllerDirectory?: string;
    staticFileDirectory?: string;
}
export declare function startServer(config: Config): void;
export declare let formData: (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
