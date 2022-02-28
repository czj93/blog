---
title: Git常用命令
date: 2021-07-08
author: czj
lang: zh-cn
tags:
  - git
summary: Git常用命令
---



[Git 教程](https://git-scm.com/book/zh/v2)

[Git的4个阶段的撤销更改](https://segmentfault.com/a/1190000011969554)

[如何撤销 Git 操作](http://www.ruanyifeng.com/blog/2019/12/git-undo.html)

## 初始化

```shell
# git 仓库初始化
git init
```



## 提交

// todo

## 分支合并

// todo

## 撤销、修改

1. 撤销本地工作区的修改

   ```
   # 撤销本地工作区所有修改
   git checkout .
   
   # 撤销指定文件
   git checkout <文件>
   ```

   

2.  撤销已保存到暂存区但未提交的文件

   ```shell
   // 撤销所有
   git reset
   // 撤销指定文件
   git reset <文件>
   ```

2. 撤销提交

   ```shell
   # 撤销提交 提交内容保留到工作区
   git reset --soft <版本号>

   git reset --soft HEAD^
   
   # 撤销提交 回退到指定版本 内容不会保留在工作区
   git reset --hard <版本号>
   ```

   ```shell
   git revert HEAD
   ```

   > 上面命令的原理是，在当前提交后面，新增一次提交，抵消掉上一次提交导致的所有变化。它不会改变过去的历史，所以是首选方式，没有任何丢失代码的风险

3. 修改commit message

   ```shell
   git commit --amend -m "message"
   ```

4. 停止追踪某个文件

   ```shell
   git rm --cached <文件>
   ```

   

## 常见场景及操作

// todo

1. [提交后修改用户信息](https://www.cnblogs.com/zh7791/p/12986083.html)