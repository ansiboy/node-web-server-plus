import { join } from "path";

import { controller, action, Controller } from '../../../dist/index';

class Test extends Controller {
    @action()
    index() {
        return 'Hello World'
    }

    @action("/j")
    j() {
        return { a: 10, b: 10 }
    }
}

exports.default = Test