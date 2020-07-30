# 快速入门

1. 创建 nodejs 项目文件夹，安装 node-mvc

   ```
   npm i maishu-node-mvc
   ```

   文件夹结构如下

   ```
   根目录
   ├── controllers
   |   └── home.ts
   ├── index.ts
   ├── package.json
   └── tsconfig.json

   ```

1. 创建 index.ts 文件

   <code path="../sample-codes/web/index.ts"></code>

1. 创建 controllers 文件夹

   在 controllers 文件夹下创建 home.ts 文件

   <code path="../sample-codes/web/home.ts"></code>

1. tsconfig.json 文件

   ```json
   {
    "compilerOptions": {
        "target": "es6",
        "module": "commonjs",
        "experimentalDecorators": true
    }
   }
   ```

1. 启动程序

   把 ts 文件转换为 js 文件，输入命令启动程序

   ```cmd
   node index.js
   ```

1. 在浏览器输入

   在浏览器输入 http://localhost:1234/ 显示

   ```
   node mvc
   ```

   
