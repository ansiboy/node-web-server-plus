interface Error {
    innerError?: Error
    statusCode?: number
}

type ActionResult = { data: any, contentType?: string, statusCode?: number }

declare module 'is-class' {
    function isClass(obj: Function): boolean;
    export = isClass;
}