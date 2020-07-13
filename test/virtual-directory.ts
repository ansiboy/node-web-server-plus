import { createVirtualDirecotry, } from "../out";
import * as path from "path";
import * as assert from "assert";
import * as fs from "fs";
import { pathConcat } from "maishu-node-web-server";

describe("virtual-directory", function () {

    describe("create virtual directory", function () {

        let b = path.join(__dirname, "www/public/b");
        let c = path.join(__dirname, "www/public/c");

        it("directores", async function () {
            let dir = createVirtualDirecotry(b, c);
            let dirs = dir.directories();
            let names1 = fs.readdirSync(b).filter(n => fs.statSync(pathConcat(b, n)).isDirectory());
            let names2 = fs.readdirSync(c).filter(n => fs.statSync(pathConcat(c, n)).isDirectory());

            assert.equal(names1.length + names2.length, Object.getOwnPropertyNames(dirs).length);
        })

        it("files", function () {

            let dir = createVirtualDirecotry(b, c);
            let files = {};
            fs.readdirSync(b).filter(n => fs.statSync(pathConcat(b, n)).isFile())
                .forEach(n => {
                    files[n] = pathConcat(b, n);
                })
            fs.readdirSync(c).filter(n => fs.statSync(pathConcat(c, n)).isFile())
                .forEach(n => {
                    files[n] = pathConcat(c, n);
                })

            assert.equal(
                Object.getOwnPropertyNames(files).length,
                Object.getOwnPropertyNames(dir.files()).length
            );
        })
    })


})