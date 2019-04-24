# NODE-MVC

基于 nodejs 的 MVC 框架，可用于开发 nodejs 的微服务。

# 使用

1. npm i maishu-node-mvc

# 创建 index.js 文件

```js 
const { startServer } = require('maishu-node-mvc')
startServer({
    port: 2001,
    rootPath: __dirname
})
```

# 创建 controllers 文件夹

在 controllers 文件夹下创建 home.js 文件

```js
const { register } = require('maishu-node-mvc')
class Home {
    index() {
        return 'node mvc'
    }
}

register(Home).action('index', '/')
```

# 在浏览器输入

在浏览器输入 http://localhost:2001/ 显示

```
node mvc
```



