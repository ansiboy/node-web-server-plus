import { join } from "path";

const { controller, action } = require('../../dist/index')

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