declare module "zombie" {
    class Browser {
        visit(url: string): void;
        source: string;
    }

    export = Browser;
}