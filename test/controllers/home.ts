import { controller, action, createParameterDecorator, formData } from '../../dist/index'
import { ConnectionOptions } from 'tls';

// function connection() {

// }

// function createParameterDecorator<T>(createParameter: () => T, disposeParameter: (parameter: T) => void) {
//     return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {

//     }
// }

let connection = createParameterDecorator(
    async function () {
        debugger
        return {}
    },
    function () {
        debugger
    }
)

@controller()
/** 主页模块 */
class HomeController {
    /**
     * 首页
     * @param conn 数据库连接
     * @param data 表单数据
     */
    @action("/")
    index(@connection conn: ConnectionOptions, @formData data: Object) {
        return 'home index'
    }

    @action()
    test(@formData { arg }) {
        return arg
    }
}

exports.default = HomeController