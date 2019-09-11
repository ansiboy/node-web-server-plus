const { ControllerLoader } = require("../dist/controller-loader");

const assert = require("assert");
const path = require("path");
const fs = require("fs");

const { actionPaths } = require("./www/actionPaths");

describe("controller-loader", function () {
    let controllerPath = path.join(__dirname, "www/controllers");

    assert.ok(fs.existsSync(controllerPath));

    let loader = new ControllerLoader({}, [controllerPath]);
    it("home index action，应该返回非空的 action", function () {
        let r = loader.getAction(actionPaths.home.index);
        assert(r.action != null);
    })

    it("home test action，应该返回非空的 action", function () {
        let r = loader.getAction(actionPaths.home.test);
        assert(r.action != null);
    })

    it("home test action，应该返回空的 action", function () {
        let r = loader.getAction(actionPaths.home.test + Math.random());
        assert(r.action == null);
    })

    describe("路由测试", function () {
        it("distributor actions，应该返回非空的 action", function () {
            let r = loader.getAction(`${actionPaths.home.distributor}/index`);
            assert(r.action != null);
        })

        it("distributor actions，应该返回非空的 action", function () {
            let r = loader.getAction(`${actionPaths.home.product}/10`);
            assert(r.action != null);
            assert(r.routeData != null);
            assert.equal(r.routeData["id"], 10);
        })

        it("distributor actions，应该返回非空的 action", function () {
            let r = loader.getAction(`${actionPaths.home.product}/10`);
            assert(r.action != null);
            assert(r.routeData != null);
            assert.equal(r.routeData["id"], 10);
        })

        it("distributor actions，应该返回非空的 action", function () {
            let r = loader.getAction(`${actionPaths.home.redirect}/sales/abc`);
            assert(r.action != null);
            assert(r.routeData != null);
            assert.equal(r.routeData["module"], "sales");
        })

    })


    describe("第二个控制器文件夹测试", function () {
        it("product list action，应该返回非空的 action", function () {
            let r = loader.getAction(`/product/list`);
            assert(r.action != null);
        })
    })
});