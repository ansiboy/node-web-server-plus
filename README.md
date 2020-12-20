# Node Web Server Plus

[Node Web Server](https://github.com/ansiboy/node-web-server) 的加强版本，再 Node Web Server 的基础上集成更多的功能。

1. 提供命令行启动
1. 集成了 Babel，把 ts，js 转换为 amd js
1. 集成了 [MVC](https://github.com/ansiboy/node-web-server-mvc) 功能
1. 集成了 JSON5，JSON5 转 JSON
1. 集成了 Less，Less 转 CSS
1. 提供了插件加载机制

## 安装

```
npm i -g maishu-node-mvc
```

## 使用

```
nwsp -d <website path> -p <port>
```

-d 必填，后面的参数 \<website path\> 为网站文件夹
-p 可选，后面的参数 \<port> 为网站端口，默认值为 9868

## 网站目录

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

## ts 文件的转换






