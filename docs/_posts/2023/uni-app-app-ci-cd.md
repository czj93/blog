---
title: uni-app app 持续集成
date: 2023-6-22
author: czj
lang: zh-cn
summary: uni-app 跨端开发App, 在无后端情况下通过持续集成，实现版本发布，支持自动更新

---

使用 uni-app 跨端开发一个 PDA 端的应用（可以理解为安卓App）, 在标准产品上添加客户定制内容。由于原有的产品不支持自动更新客户端版本。每次添加功能，修改bug发版都需要重新下载安装最新的包。这过程中需要开发打包，发版，测试重新安装程序，非常的低效和累赘，不符合工程化精神。


uni-app 和 微信小程序 本身是支持自动更新的。
具体可查看文档 [uni-app 资源在线升级/热更新](https://ask.dcloud.net.cn/article/35667)

uni-app 官方还提供了 资源升级/整包升级 的服务  [App升级中心 uni-upgrade-center](https://uniapp.dcloud.net.cn/uniCloud/upgrade-center.html#)


## 升级方案
通过查看官方文档，为了实现自动升级，需要构建，上传 wgt 升级包，提供一个版本检测接口，并支持升级包下载。

由于资源有限，又想把事情做的简单点，更自动化。

准备在 H5 的 CICD 过程中构建wgt升级包，打入到 docker 镜像中，部署到服务器上。
版本检测通过获取H5端的 manifest.json 文件中的版本号来对比版本。


## 如果自动构建 wgt 升级资源包
查看文档，官方给的方式是 通过 HBuilderX 编辑器来生成。
但是这不符合我的需求, CICD 过程是在Linux 服务器上进行的，无法安装 HBuilderX 来实现自动构建。



翻看文档发现发 uni-app 是有提供 npm 包，支持通过命令行来构建的。
[运行、发布uni-app](https://uniapp.dcloud.net.cn/quickstart.html#%E8%BF%90%E8%A1%8C%E3%80%81%E5%8F%91%E5%B8%83uni-app)

在文档中发现了这么一段
> 目前使用npm run build:app-plus会在/dist/build/app-plus下生成app打包资源。如需制作wgt包，将app-plus中的文件压缩成zip（注意：不要包含app-plus目录），再重命名为${appid}.wgt， appid为manifest.json文件中的appid。

也就是 wgt 文件就是普通的 zip 压缩文件，只是后缀名不同而已。这就简单 linux 支持 zip 压缩解压。

ps: 既然就是 zip 压缩文件，为什么要用 wgt, 搞的人云里雾里的


## 构建 wgt 资源包

生成 app 资源
```sh
npm run build:app
```

生成wgt资源包

```sh
# bash

cd ./dist/build/app

# 打包
zip -r -q -D [appid].zip ./*
# 重命名
mv [appid].zip [appid].wgt
# 移动到h5的静态资源目录下
mv [appid].zip ../h5/static/
# 将 manifest.json 文件移动到h5静态目录下
mv manifest.json ../h5/static/
```

## 构建 docker 镜像及部署

将dist/build/h5 中的内容 和 nginx 一起打包成镜像，并重新部署即可

添加打包脚本
```sh
#!/usr/bin/env bash

cd /dist/build/app

zip -r -q -D [appid].zip ./*

mv [appid].zip [appid].wgt

mv [appid].wgt ../h5/static/

mv manifest.json ../h5/static/
```

在 package.json 中添加打包指令

```
"pack": "sh ./CICD/pack.sh",
```

构建
```sh

yarn

npm run build:h5

npm run build:app

npm run pack

## npm run pack 指令在jenkins 中构建报错
## zip not found

```

由于 zip 指令在jenkins 中无法执行，改到 dockerfile 中来执行打包压缩过程
经过尝试 dockerfile 中依然存在相同的问题

终极解决办法，使用node.js 来打包压缩

添加 archiver
```
{
 “scripts”: {
    "zip": "node ./zip.js"
  },
  “devDependencies”: {
    "archiver": "^5.3.1"
  }
}
```


编写压缩打包代码
```js
const fs = require("fs");
const archiver = require("archiver");

const appid = "__UNI__3C008EF";

const output = fs.createWriteStream(`${appid}.zip`);
const archive = archiver("zip", {});

archive.on("error", function (err) {
    throw err;
});

output.on("close", function () {
    console.log(`打包压缩完成`);
});

archive.pipe(output);
archive.directory("./dist/build/app/", false);
archive.finalize();

```

构建打包

```sh
yarn

npm run build:h5

npm run build:app

npm run zip

mv ./dist/build/app/manifest.json ./dist/build/h5/static/

mv ./__UNI__3C008EF.zip ./dist/build/h5/static/__UNI__3C008EF.wgt
```

## 客户端检测版本并下载升级

```js
    const serverUrl = ‘api-server’;

    // 下载更新包 并 更新
    const downloadApp = (url) => {
      uni.showLoading({ title: '更新中' })
      uni.downloadFile({
        url: url,
        success: (downloadResult) => {
          uni.hideLoading()
          if (downloadResult.statusCode === 200) {
            plus.runtime.install(downloadResult.tempFilePath, {
              force: false
            }, function () {
              console.log('install success...');
              plus.runtime.restart();
            }, function (e) {
              uni.showToast({
                title: "更新失败",
                icon: "none",
              })
			  console.log(e)
              console.error('install fail...');
            });
          }
        }
      });
    }

    // 获取到最新的版本信息
    const getDevVersionData = () => {
      uni.request({
        url: `${serverUrl}/static/manifest.json`,
        success: (result) => {
          var { data } = result
          devVersion.value.value = data.version.name
          devVersion.value.code = data.version.code
          // 对比当前版本 与 服务端最新版本 大小
          if() {
            downloadApp(`${serverUrl}/static/[appid].wgt `)
          }
        }
      })
    }
```