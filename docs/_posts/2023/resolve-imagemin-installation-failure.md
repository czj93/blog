---
title: 解决imagemin包安装失败 
date: 2023-4-20
author: czj
lang: zh-cn
summary: 解决因为国内网络（GFW）问题,导致的imagemin安装失败

---

安装npm依赖包是遇到一下报错

```
error /**/*/node_modules/mozjpeg: Command failed.
Exit code: 1
Command: node lib/install.js
Arguments: 
Directory: /**/*/node_modules/mozjpeg
Output:
connect ETIMEDOUT 185.199.109.133:443
mozjpeg pre-build test failed
compiling from source
Error: Command failed: /bin/sh -c ./configure --enable-static --disable-shared --disable-dependency-tracking --with-jpeg8  --prefix="/**/*/node_modules/mozjpeg/vendor" --bindir="/**/*/node_modules/mozjpeg/vendor" --libdir="/**/*/node_modules/mozjpeg/vendor"
configure: error: no nasm (Netwide Assembler) found

```

=mozjpeg= 是一个用于图片压缩的库，被 =imagemin= 依赖

```js
// mozjpeg/lib/index.js
const path = require('path');
const BinWrapper = require('bin-wrapper');
const pkg = require('../package.json');

const url = `https://raw.githubusercontent.com/imagemin/mozjpeg-bin/v${pkg.version}/vendor/`;

module.exports = new BinWrapper()
	.src(`${url}macos/cjpeg`, 'darwin')
	.src(`${url}linux/cjpeg`, 'linux')
	.src(`${url}win/cjpeg.exe`, 'win32')
	.dest(path.join(__dirname, '../vendor'))
	.use(process.platform === 'win32' ? 'cjpeg.exe' : 'cjpeg');

```

mozjpeg 安装后会向 githubusercontent 下载文件，由于某些众所周知的原因，导致下载失败了。

但是 mozjpeg 中这个地址是被写死了，不像其他的包提供了环境变量可以自由修改。


解决办法：

在 package.json 中添加以下配置，使用 yarn 安装依赖即可

通过 yarn resolutions 将 bin-wrapper包 替换成 bin-wrapper-china
bin-wrapper-china 会将下载链接进行替换

```json
// package.json
{
  "resolutions": {
    "bin-wrapper": "npm:bin-wrapper-china"
  }
}

```

参考资料

- [https://classic.yarnpkg.com/en/docs/selective-version-resolutions/]
- [yarn resolutions RFC](https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md)
- [如何让 YARN 支持 CNPM 的完整加速](https://www.cnblogs.com/Chary/p/13862863.html)