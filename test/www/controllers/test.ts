import { join } from "path";

import { controller, action, Controller, routeData } from '../../../out/index';

export class Test extends Controller {
    @action()
    index() {
        return this.content("<html><body><h1>Hello World</h1><body><html>", "text/html; charset=UTF-8")
    }

    @action("/j")
    j() {
        return { a: 10, b: 10 }
    }

    @action("/product/:id")
    product(@routeData { id, name }) {
        return `id: ${id}, name: ${name}`;
    }
}
