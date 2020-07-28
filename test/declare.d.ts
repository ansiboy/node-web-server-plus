declare module "zombie" {
    class Browser {
        visit(url: string): Promise<void>;
        source: string;
        response: {
            headers: Headers
        };
    }

    interface Headers {
        get(name: string): string;
    }

    export = Browser;
}