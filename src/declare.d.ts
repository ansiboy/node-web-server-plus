interface Error {
    innerError?: Error
    statusCode?: number
}

type ActionResult = { data: any, contentType?: string, statusCode?: number }