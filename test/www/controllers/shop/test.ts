import { controller, action } from '../../../../out/'
@controller()
export default class TestController {
    @action("/shop/test")
    index() {
        return "shop test index"
    }
}
