# 使用手册

## 服务器启动

使用 **startServer** 启动一个 node mvc 服务。例如：

<code path="../sample-codes/manual/sample-1.ts"></code>

完整的参数定义为：

```ts
 {
   port?: number,
    bindIP?: string,
    controllerDirectory?: string | VirtualDirectory,
    staticRootDirectory?: string | VirtualDirectory,
    proxy?: { [path_pattern: string]: string | ProxyItem },
    rootPath: string,
    serverName?: string,
    /** 设置默认的 Http Header */
    headers?: { [name: string]: string }
    virtualPaths?: { [virtualPath: string]: string },
    logLevel?: LogLevel,
    serverContextData?: any,
    fileProcessors?: { [fileExtention: string]: FileProcessor },
    requestResultTransforms?: RequestResultTransform[],
}
```

| 参数名              | 解释                                                               | 是否必填 |
| ------------------- | ------------------------------------------------------------------ | -------- |
| port                | 服务器监听的端口                                                   | 可空     |
| rootPath            | 文件夹的根目录，必须为绝对路径                                     | 必填     |
| bindIP              | 服务器绑定 IP，可为空                                              |
| controllerDirectory | 控制器文件夹，绝对路径，默认值为 rootPath 下的 controllers 文件夹  | 选填     |
| staticRootDirectory | 静态文件放置的路径，绝对路径，默认值为 rootPath 下的 static 文件夹 | 选填     |
| headers             | 设置默认的 http header                                             | 可空     |
| virtualPaths        | 虚拟路径                                                           | 可空     |

## 注册控制器

所有的控制器，都必须放在控制器文件夹或者其子文件内。注册控制器需要注意的是， 控制器类，必须使用 controller 装饰器标记。例如：

<code path="../sample-codes/web/controllers/home.ts"></code>

### 控制器的路径

在使用 controller 装饰器时，可以指定控制器的路径。如果不指定，则为控制器的类名。例如：

<code path="../sample-codes/manual/controllers/controller-default-path.ts"></code>

controller 的路径名为 **Home**。

<code path="../sample-codes/manual/controllers/controller-special-path.ts"></code>

controller 的路径名为 **/distributor/home**。

### 行为的路径

在使用 action 装饰器时，可以指定行为的路径，action 装饰器的路径可以使用绝对路径和相对路径

- 使用绝对路径访问路径则为行为设定的绝对路径。

- 使用相对路径则为控制器路径 + 行为路径。

- 行为，控制器都不指定路径，访问路径为控制器的默认路径加上行为的默认路径，例如：

<code path="../sample-codes/manual/controllers/action-default-path.ts"></code>

控制的默认路径为类名 **Home** ，index action 的默认路径名为方法名 **index** ，所以 index action 的访问路径，为 **Home/index** ；productList action 的默认路径为方法名 **productList** ，所以 productList action 的访问路径为 **Home/productList** 。

- action 路径参数为绝对路径（已**/**开头），那么访问的路径则为指定的绝对路径，例如：

<code path="../sample-codes/manual/controllers/action-special-path.ts"></code>

其中的 index，productList action 的访问路径分别为 **/** 和 **/distributor/product/list**

- action 路径参数为为相对路径（不已**/**开头），例如：

```ts
import { controller, Controller } from 'maishu-node-mvc'

@controller('/distributor')
export class Home extends Controller {
  @action()
  index () {
    return 'node mvc'
  }

  @action('product/list')
  productList () {
    return 'product list'
  }
}
```

其中的 index，productList action 的访问路径分别为 **/distributor/index** 和 **/distributor/product/list**
