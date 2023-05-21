---
title: 腾讯云可持续集成项目搭建
date: 2023-4-9
author: czj
lang: zh-cn
summary: 使用腾讯云的Coding服务通过Jenkinsfile自动化打包并构建镜像，上传腾讯云的镜像服务器并部署

---




## 常见问题

### 设置 Node.js 版本

```js
agent {
    docker {
        image 'node:16.18'
        // stage 依旧在同一工作空间
        reuseNode true
    }
}

```

https://console.cloud.tencent.com/tcr/repository