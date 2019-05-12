import { controller, action, createParameterDecorator, formData } from '../../dist/index'

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
class HomeController {
    @action("/")
    index(@connection conn,@formData data) {
        return 'home index'
    }

    @action()
    test(@formData { arg }) {
        return arg
    }
}

exports.default = HomeController