const { controller, action, register } = require('../../dist/index')

class Test2 {
    check() {
        return 'Test2 check'
    }
}

register(Test2, '/test2').action('check')

exports.default = Test2