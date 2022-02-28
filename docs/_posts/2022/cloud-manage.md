---
title: 云服务器配置管理
date: 2022-2-2
author: czj
lang: zh-cn
tags:
  - cloud
summary: 
---



## 安装软件

### 1. 安装运行 nginx

安装 nginx 镜像

```sh
docker pull nginx
```

运行镜像

其中 8080 是宿主机端口号， 80是容器内部端口

```shell
docker run --name nginx -p 8080:80 -d nginx
```

​	[[Docker安装Nginx挂载数据卷](https://www.cnblogs.com/cyan-orange/p/15359852.html)](https://www.cnblogs.com/cyan-orange/p/15359852.html)

​	新版本的 nginx 镜像配置文件地址为 /etc/nginx/conf.d/



### 2. 安装运行Mysql

安装 Mysql 镜像

```sh
docker pull mysql
```

运行 Mysql

```shell
docker run -itd --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql
```



### 3. 安装Node.js

通过安装 nvm 来安装node.js

[nvm README](https://github.com/nvm-sh/nvm)



#### 3.1 安装nvm

```sh
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```



```sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```



#### 3.2 安装node

安装最新版本的node

```sh
nvm install node # "node" is an alias for the latest version
```

安装指定版本的node

```sh
nvm install 14.7.0
```

查看已安装版本

```sh
nvm ls
```

应用指定版本

```
nvm use 14.7.0
```

