import { join } from "path";

import { controller, action } from '../../../dist/index';

@controller()
class Test {
    @action()
    index() {
        return 'Hello World'
    }

    @action()
    j() {
        return { a: 10, b: 10 }
    }
}

exports.default = Test