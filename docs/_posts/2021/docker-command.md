---
title: docker常用命令
date: 2021-06-30
author: czj
lang: zh-cn
tags:
  - docker
summary: docker常用命令介绍
---



原文： https://www.cnblogs.com/DeepInThought/p/10896790.html



## 容器启动

```shell
##新建并启动容器，参数：-i  以交互模式运行容器；-t  为容器重新分配一个伪输入终端；--name  为容器指定一个名称
docker run -i -t --name mycentos
##后台启动容器，参数：-d  已守护方式启动容器
docker run -d mycentos

##启动一个或多个已经被停止的容器
docker start redis
##重启容器
docker restart redis
```

## 查看容器

```shell
##查看正在运行的容器
docker ps
##查看正在运行的容器的ID
docker ps -q
##查看正在运行+历史运行过的容器
docker ps -a
##显示运行容器总文件大小
docker ps -s

##显示最近创建容器
docker ps -l
##显示最近创建的3个容器
docker ps -n 3
##不截断输出
docker ps --no-trunc 
```

## 容器停止、删除

```shell
##停止一个运行中的容器
docker stop redis
##杀掉一个运行中的容器
docker kill redis
##删除一个已停止的容器
docker rm redis
##删除一个运行中的容器
docker rm -f redis
##删除多个容器
docker rm -f $(docker ps -a -q)
docker ps -a -q | xargs docker rm
## -l 移除容器间的网络连接，连接名为 db
docker rm -l db 
## -v 删除容器，并删除容器挂载的数据卷
docker rm -v redis
```

## 镜像查看

```shell
#列出本地images
docker images
##含中间映像层
docker images -a

##只显示镜像ID
docker images -q
##含中间映像层
docker images -qa  

##显示镜像摘要信息(DIGEST列)
docker images --digests
##显示镜像完整信息
docker images --no-trunc

##显示指定镜像的历史创建；参数：-H 镜像大小和日期，默认为true；--no-trunc  显示完整的提交记录；-q  仅列出提交记录ID
docker history -H redis
```

## 镜像搜索

```shell
##搜索仓库MySQL镜像
docker search mysql
## --filter=stars=600：只显示 starts>=600 的镜像
docker search --filter=stars=600 mysql
## --no-trunc 显示镜像完整 DESCRIPTION 描述
docker search --no-trunc mysql
## --automated ：只列出 AUTOMATED=OK 的镜像
docker search  --automated mysql
```

## 镜像下载

```shell
##下载Redis官方最新镜像，相当于：docker pull redis:latest
docker pull redis
##下载仓库所有Redis镜像
docker pull -a redis
##下载私人仓库镜像
docker pull bitnami/redis
```



## mysql 安装与使用

```sh
# 安装docker
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

# 当前用户添加docker组
sudo usermod -aG docker [用户名]

# 拉取最新docker镜像
docker pull mysql:latest

# 创建并运行mysql容器
docker run -itd --name database -p 3306:3306 -e MYSQL_ROOT_PASSWORD=[密码] mysql

# 查看运行中的docker容器
docker ps

# 进入容器
docker exec -it database bash

# 启动已停止容器
docker start database
```



其他资料：

1. [Docker 入门教程](https://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)



<ClientOnly>
  <Comment-index article-id="docker-command" />
</ClientOnly>