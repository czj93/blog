---
title: HbuilderX H5套壳打包App报错，打开页面白屏
date: 2023-05-21
author: czj
lang: zh-cn
tags: 
  - exception
summary:  h5 使用 vite 构建打包，浏览器中可以正常访问，打包到 App 中会报错，导致页面白屏

---


手机安装App打开后页面白屏，没有其他报错信息。
查看编辑器控制台，有报错信息
异常信息
  ```
  Uncaught SyntaxError: Unexpected token import at http://192.168.31.97:3004/assets/index-957f836b.js:1
  ```
  
  修改 vite.config.ts
  
 ```ts
import legacy from '@vitejs/plugin-legacy'
 export default {
   plugins: [
     legacy({
       targets: ['chrome 53']
     })
   ]
 }
 
 ```
  
  