# NODE-MVC

基于 nodejs 的 MVC 框架，可用于开发 nodejs 的微服务。

# 一分钟上手

1. npm i maishu-node-mvc

# 创建 index.ts 文件

```ts 
import { startServer } from 'maishu-node-mvc';
startServer({
    port: 2001,
    rootPath: __dirname
})
```

# 创建 controllers 文件夹

在 controllers 文件夹下创建 home.ts 文件

```ts
import { Controller } from 'maishu-node-mvc';

class Home extends Controller {
    @action("/")
    index() {
        return 'node mvc'
    }
}

```

# 启动程序

把 ts 文件转换为 js 文件，输入命令启动程序

```cmd
node index.js
```

# 在浏览器输入

在浏览器输入 http://localhost:2001/ 显示

```
node mvc
```

# 使用手册

## 服务器启动

使用 **startServer** 启动一个 node mvc 服务。例如：

```js 
const { startServer } = require('maishu-node-mvc')
startServer({
    port: 2001,
    rootPath: __dirname
})
```

完整的参数定义为：

```ts
 {
    port: number;
    rootPath: string;
    bindIP?: string;
    proxy?: {
        [path_pattern: string]: string | ProxyItem;
    };
    controllerDirectory?: string | string[];
    staticRootDirectory?: string;
    authenticate?: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<{
        errorResult: ActionResult;
    }>;
    actionFilters?: ((req: http.IncomingMessage, res: http.ServerResponse) => Promise<ActionResult>)[];
    /** 设置默认的 Http Header */
    headers?: {
        [name: string]: string;
    };
    virtualPaths?: {
        [virtualPath: string]: string;
    };
}
```

参数有点多，我们先来看几个经常用到的：

| 参数名 | 解释 |  |
| -------| ----- |-- |
| port | 服务器监听的端口 | 必填
| rootPath | 文件件的根目录，必须为绝对路径 | 必填
| bindIP | 服务器绑定 IP，可为空 | 可选
| controllerDirectory | 控制器文件夹，绝对路径或者相对路径，如果是相对路径，则为 rootPath 的相对路径，默认值为 controllers | 选填
| staticRootDirectory | 静态文件放置的路径，绝对路径或者相对路径，如果是相对路径，则为 rootPath 的相对路径，默认值为 public | 选填
| proxy | 用于把请求转发到其他服务器 | 选填
| authenticate | 用于对用户身份进行认证 | 选填
| actionFilters | action 过滤器，用于对 action 进行拦截 | 选填

## 注册控制器

所有的控制器，都必须放在控制器文件夹或者其子文件内。注册控制器需要注意的是， 控制器类，必须继承于 Controller 或者使用 controller 装饰器标记。例如：

```ts
import { Controller } from 'maishu-node-mvc';

class Home extends Controller {
    @action("/")
    index() {
        return 'node mvc'
    }
}

```
```ts
import { controller, Controller } from 'maishu-node-mvc';

@controller()
class Home extends Controller {
    @action("/")
    index() {
        return 'node mvc'
    }
}

```

### 控制器的路径

controller 路径，在使用 controller 装饰器时，可以指定 controller 的路径。如果不指定，则为控制器的类名。例如：

```ts
import { Controller } from 'maishu-node-mvc';

@controller()
class Home {

}

```

controller 的路径名为 **Home**。

```ts
import { Controller } from 'maishu-node-mvc';

@controller("/distributor/home")
class Home {

}

```

controller 的路径名为 **/distributor/home**。

### action 的路径

action 路径，在使用 action 装饰器时，可以指定 action 路径，action 装饰器的路径可以使用绝对路径（已**/**开头）和相对路径

    * 使用绝对路径访问路径则为 action 设定的绝对路径。

    * 使用相对路径则为 controller 路径 + action 路径。

* action，controller 都不指定路径，访问路径为控制器的默认路径加上 action 的默认路径，例如：

    ```ts
    class Home extends Controller {
        @action()
        index() {
            return 'node mvc'
        }

        @action()
        productList() {
            return "product list";
        }
    }
    ```

    控制的默认路径为类名 **Home** ，index action 的默认路径名为方法名 **index** ，所以 index action 的访问路径，为 **Home/index** ；productList action 的默认路径为方法名 **productList** ，所以 productList action 的访问路径为 **Home/productList** 。

* action 路径参数为绝对路径（已**/**开头），那么访问的路径则为指定的绝对路径，例如：

    ```ts
    import { controller, Controller } from 'maishu-node-mvc';

    @controller()
    class Home extends Controller {
        @action("/")
        index() {
            return 'node mvc'
        }

        @action("/distributor/product/list")
        productList() {
            return "product list";
        }
    }

    ```

    其中的 index，productList action 的访问路径分别为 **/** 和 **/distributor/product/list**

* action 路径参数为为相对路径（不已**/**开头），例如：

     ```ts
    import { controller, Controller } from 'maishu-node-mvc';

    @controller("/distributor")
    export class Home extends Controller {
        @action()
        index() {
            return 'node mvc'
        }

        @action("product/list")
        productList() {
            return "product list";
        }
    }

    ```

     其中的 index，productList action 的访问路径分别为 **/distributor/index** 和 **/distributor/product/list**

### action 返回的结果

默认情况情况下，action 返回给浏览器的结果可以分为两种情况：

* 字符串，返回给浏览器的类型为 **text/plain; charset=UTF-8**

* 对象，返回给浏览器的类型为 **application/json; charset=UTF-8**

例如：

```ts
export class Test extends Controller {
    @action()
    index() {
        return 'Hello World'
    }

    @action("/j")
    j() {
        return { a: 10, b: 10 }
    }
}
```

我们在来看一个例子：

```ts
export class Test extends Controller {
    @action()
    index() {
        return '<html><body><h1>Hello World</h1><body><html>'
    }
}
```

我们在浏览器看到的结果是：

```html
<html><body>Hello World</body></html>
```

这是因为返回给浏览器的类型为 **text/plain; charset=UTF-8**，我们都知道，要浏览器识别为 html ，需要制定 **content-type** 类型为 **text/html; charset=UTF-8** 。

使用 Controller 类中的 content 方法即可指定 **content-type** 类型。例如：

```ts
export class Test extends Controller {
    @action()
    index() {
        return this.content("<html><body><h1>Hello World</h1><body><html>","text/html; charset=UTF-8")
    }
}
```

Controller 类方法：

| 名称 | 含义 |
|------|------|
| content| 指定返回给浏览器内容的类型 |
| json| 指定返回给浏览器内容的类型为 json |
| redirect | 重定向到指定的链接
| proxy | 请求转发

## 使用路由

node-mvc 内置了路由功能，使用的是 **url-pattern** ，该类库网址是 **https://github.com/snd/url-pattern** 。

关于路由的使用，我们先来看一个例子：

```ts
export class Test extends Controller {
    @action("/product/:id")
    product(@routeData { id }) {
        return id;
    }
}
```

在浏览器输入：http://localhost:1234/product/1122 ，可以看到浏览器输出结果为：

```
1122
```

其中的 routeData 装饰器，除了用来获取路由解释的结果。还可以获取 url 参数和表单参数。

例如：

```ts
export class Test extends Controller {
    @action("/product/:id")
    product(@routeData { id, name }) {
        return `id: ${id}, name: ${name}`;
    }
}
```

在浏览器输入：http://localhost:1234/product/1122?name=apple，可以看到浏览器输出结果为：

```
id: 1122, name: apple
```

其中的 **name** 来自 url 参数 


## 内置装饰器

. controller

. action

. routeData






