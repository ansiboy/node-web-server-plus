import { controller, action } from 'maishu-node-mvc';

@controller()
export class Home {
    @action("/")
    index() {
        return 'node mvc'
    }
}
