import { Controller } from '../../../dist/index';
export declare class Test extends Controller {
    index(): import("../../../dist").ContentResult;
    j(): {
        a: number;
        b: number;
    };
    product({ id, name }: {
        id: any;
        name: any;
    }): string;
}
