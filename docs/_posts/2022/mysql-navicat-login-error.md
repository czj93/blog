---
title: Mysql连接Navicat报2059错误
date: 2022-1-31
author: czj
lang: zh-cn
tags:
  - Mysql
  - error
summary: 
---



报错原因

> mysql8 之前的版本中加密规则是mysql_native_password,而在mysql8之后,加密规则是caching_sha2_password



解决办法：更改加密规则

1. 进入mysql容器

```sh
docker exec -it mysql /bin/bash
```



2. 登录mysql

```sh
mysql -u root -p

use mysql;
```



3. 修改密码

```sh

#更改加密方式
ALTER USER 'root'@'%' IDENTIFIED BY 'password' PASSWORD EXPIRE NEVER; 

#更新用户密码
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'password';

#刷新权限
FLUSH PRIVILEGES;
```



root、%、password 都是占位符，自行替换自己的内容

root:  mysql的用户名

password:   mysql的密码

%：   对应的host, ( localhost、IP )  %表示对所有IP开放



参考文档

​	[Navicat 连接MySQL 8.0.11 出现2059错误](https://www.cnblogs.com/lifan1998/p/9177731.html)