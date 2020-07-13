import * as errors from "./errors";
import * as fs from "fs";
import { VirtualDirectory, pathConcat } from "maishu-node-web-server";

export function createVirtualDirecotry(...physicalPaths: string[]) {
    if (physicalPaths == null || physicalPaths.length == 0)
        throw errors.arugmentNull("physicalPaths");

    let root = new VirtualDirectory(physicalPaths[0]);
    let dirStack = [...physicalPaths.map(o => ({ physicalPath: o, virtualPath: "/" }))];
    while (dirStack.length > 0) {
        let item = dirStack.pop();
        if (item == null)
            continue;

        let dir = root.findDirectory(item.virtualPath);
        if (dir == null) {
            root.addPath(item.virtualPath, item.physicalPath);
            dir = root.findDirectory(item.virtualPath);
        }

        if (dir == null)
            throw errors.unexpectedNullValue("dir");

        let names = fs.readdirSync(item.physicalPath);
        for (let i = 0; i < names.length; i++) {
            let physicalPath = pathConcat(item.physicalPath, names[i]);
            let virtualPath = pathConcat(item.virtualPath, names[i]);
            if (fs.statSync(physicalPath).isDirectory()) {
                dirStack.push({ physicalPath, virtualPath });
            }
            else if (fs.statSync(physicalPath).isFile()) {
                dir.addPath(virtualPath, physicalPath);
            }
        }
    }

    return root;

}