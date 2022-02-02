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



### 2. 安装运行Mysql

安装 Mysql 镜像

```sh
docker pull mysql
```

运行 Mysql

```shell
docker run -itd --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql
```