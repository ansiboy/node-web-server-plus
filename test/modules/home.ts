import { controller, action } from '../../dist/index'

@controller()
class HomeController {
    @action("/")
    index() {
        return 'home index'
    }

    @action()
    test({ arg }) {
        return arg
    }
}

exports.default = HomeController