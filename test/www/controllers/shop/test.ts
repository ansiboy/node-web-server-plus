import { controller, action } from '../../../dist/index'
@controller()
export default class TestController {
    @action("/shop/test")
    index() {
        return "shop test index"
    }
}
