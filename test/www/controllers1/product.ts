import { Controller, action } from "../../../dist";

export default class ProductController extends Controller {
    @action("/product/list")
    async list() {
        return [];
    }
}