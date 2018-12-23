const { controller, action } = require('../../dist/index')

@controller()
class Test {
    @action()
    index() {
        return 'Hello World'
    }
}

exports.default = Test