const { controller, action } = require('../dist/index')

@controller()
class Test {
    index() {
        return 'Hello World'
    }
}

exports.default = Test