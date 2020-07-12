import { controller, action, createParameterDecorator, routeData } from '../../../out'
import { ConnectionOptions } from 'tls';
import { actionPaths } from '../actionPaths';

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
export class HomeController {

    /**
     * 首页
     * @param conn 数据库连接
     * @param data 表单数据
     */
    @action(actionPaths.home.index)
    index(@connection conn: ConnectionOptions, @routeData data: Object) {
        return 'home index'
    }

    @action()
    test(@routeData { arg }) {
        return arg
    }

    @action(`${actionPaths.home.distributor}/*`)
    distributor() {
        return {}
    }

    @action(`${actionPaths.home.product}/:id`)
    product(@routeData { id }) {
        return { id }
    }

    @action(`${actionPaths.home.redirect}/:module(/*)`)
    redirect(@routeData data) {
        return data
    }
}
