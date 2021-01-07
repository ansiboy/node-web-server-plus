# Node Web Server Plus

前言：作者在 nodejs 开发的时候发现一个问题，就是没有一个好用一点的 Web Server（类似于 IIS） ，有时候写个简单的东西，都要安装一大堆东西。于是作者开发一款 Node Web Server 。
然后发现还是不够好用，但是又不想把 Node Web Server 的代码搞得太复杂，于是对 Node Web Server 进行二次封装，开发了这个名为 Node Web Server Plus 的软件。

[Node Web Server](https://github.com/ansiboy/node-web-server) 的加强版本，再 Node Web Server 的基础上集成更多的功能。

1. 提供命令行启动
1. 提供了配置文件进行设置
1. 集成了 Babel，把 ts，js 转换为 amd js
1. 集成了 [MVC](https://github.com/ansiboy/node-web-server-mvc) 功能
1. 集成了 Less，Less 转 CSS
1. 提供了插件加载机制

## 安装使用

软件提供了 npm 的安装方式，在控制台输入下面的命令

```
npm i -g maishu-nwsp
```

软件提供了命令行的方式来使用

```
nwsp -d <website path> -p <port>
```

-d 必填，后面的参数 \<website path\> 为网站文件夹
-p 可选，后面的参数 \<port> 为网站端口，默认值为 9868

### 网站目录

一个典型的网站文件夹应该如下：

```
根目录
├── controllers
|   └── home.js
├── node_modules
├── public
|   └── dynamic
|   └── index.html
└── package.json
```

- controllers 文件夹用来放置控制器文件
- public 文件夹为公开的文件夹，可以通过 http 请求进行访问
- dynamic 用于存放动态脚本文件，关于动态脚本文件，参考 [Node Web Server](<(https://github.com/ansiboy/node-web-server)>)

**示例**

下面的示例演示一个最为简单的网页显示

创建一个名为 demo 的文件夹如下：

```
demo
├── public
|   └── index.html
```

index.html 文件

```html
<html>
  <head> </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
```

运行命令

```
nwsp -d demo
```

在浏览器输入 http://127.0.0.1:9868 可以看到

```
Hello World
```

## TS 文件的转换

文件夹如下

```
demo
├── public
|   └── index.html
|   └── index.ts
```

index.html 文件

```html
<html>
  <head></head>
  <body>
    <script src="./index.ts"></script>
  </body>
</html>
```

index.ts 文件

```ts
let hello: string = 'Hello'
let world: string = 'World'
document.body.innerHTML = hello + ' ' + world
```

运行命令

```
nwsp -d demo
```

在浏览器输入 http://127.0.0.1:9868 可以看到

```
Hello World
```

在浏览器输入 http://127.0.0.1:9868/index.ts 可以看到

```js
'use strict'

let hello = 'Hello'
let world = 'World'
document.body.innerHTML = hello + ' ' + world
```

## LESS 文件转换

文件夹如下

```
demo
├── public
|   └── index.html
|   └── index.less
```

index.html 文件内容如下：

```html
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="./index.less" />
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
```

index.less 文件内容如下：

```less
@color: red;

h1 {
  color: @color;
}
```

运行命令

```
nwsp -d demo
```

在浏览器输入 http://127.0.0.1:9868 可以看到红色的 ”Hello World“

<div style="color:red">Hello World</div>

## 动态脚本

node-web-server 支持使用 js 编写的动态脚本文件，动态脚本文件需要放在名为特定的文件夹，该文件夹默认为 dynamic，可以同通过配置修改该文件夹路径。


**示例**

文件夹如下

```
demo
├── public
|   └── dynamic
|       └── hello-world.js
```

hello-world.js 文件如下

```js
exports.default = function () {
    return {
        content: "hello world",
        headers: { "Content-Type": "text/plain" }
    }
}
```

在浏览器输入：http://127.0.0.1:9868/dynamic/hello-world.js 可以看到：

```
hello world
```


