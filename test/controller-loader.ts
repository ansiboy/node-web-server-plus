// const { ControllerLoader } = require("../dist/controller-loader");
// import { ControllerLoader } from "../out";

// import * as assert from "assert";
// import * as  path from "path";

// import { actionPaths } from "./www/actionPaths";
// import { VirtualDirectory } from "maishu-node-web-server";

// describe("controller-loader", function () {

//     let dir = new VirtualDirectory(path.join(__dirname, "www/controllers"));
//     let controllerLoader = new ControllerLoader(dir);

//     it("find controller", function () {
//         let r1 = controllerLoader.findAction(actionPaths.home.index);
//         assert.notEqual(r1, null);
//         assert.notEqual(r1.controllerPhysicalPath || "", "");
        
//         let r2 = controllerLoader.findAction(`${actionPaths.home.product}/1`);
//         assert.notEqual(r2, null);

//         let r3 = controllerLoader.findAction(`${actionPaths.home.product}`);
//         assert.equal(r3, null);

//         let r4 = controllerLoader.findAction(`${actionPaths.home.distributor}/a`)
//         assert.notEqual(r4, null);
//     })

// })

// describe("controller-loader", function () {
//     let controllerPath = path.join(__dirname, "www/controllers");

//     assert.ok(fs.existsSync(controllerPath));

//     let serverContext: ServerContext = { controllerDefines: [], logLevel: "all" };
//     let loader = new ControllerLoader(serverContext, [controllerPath]);
//     it("home index action，应该返回非空的 action", function () {
//         let r = loader.getAction(actionPaths.home.index, {});
//         assert(r.action != null);
//     })

//     it("home test action，应该返回非空的 action", function () {
//         let r = loader.getAction(actionPaths.home.test);
//         assert(r.action != null);
//     })

//     it("home test action，应该返回空的 action", function () {
//         let r = loader.getAction(actionPaths.home.test + Math.random());
//         assert(r == null);
//     })

//     describe("路由测试", function () {
//         it("distributor actions，应该返回非空的 action", function () {
//             let r = loader.getAction(`${actionPaths.home.distributor}/index`);
//             assert(r.action != null);
//         })

//         it("distributor actions，应该返回非空的 action", function () {
//             let r = loader.getAction(`${actionPaths.home.product}/10`);
//             assert(r.action != null);
//             assert(r.routeData != null);
//             assert.equal(r.routeData["id"], 10);
//         })

//         it("distributor actions，应该返回非空的 action", function () {
//             let r = loader.getAction(`${actionPaths.home.product}/10`);
//             assert(r.action != null);
//             assert(r.routeData != null);
//             assert.equal(r.routeData["id"], 10);
//         })

//         it("distributor actions，应该返回非空的 action", function () {
//             let r = loader.getAction(`${actionPaths.home.redirect}/sales/abc`);
//             assert(r.action != null);
//             assert(r.routeData != null);
//             assert.equal(r.routeData["module"], "sales");
//         })

//     })


//     describe("第二个控制器文件夹测试", function () {
//         it("product list action，应该返回非空的 action", function () {
//             let r = loader.getAction(`/product/list`);
//             assert(r.action != null);
//         })
//     })
// });