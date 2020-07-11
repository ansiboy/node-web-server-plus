import { controller, action } from '../../../../out/version-2'
@controller()
export default class TestController {
    @action("/shop/test")
    index() {
        return "shop test index"
    }
}
