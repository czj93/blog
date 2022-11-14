---
title: Git Rebase 使用入门
date: 2022-11-14
author: czj
lang: zh-cn
tags:
summary: Git Rebase命令使用入门,常见的命令和使用场景
---



## Git Rebase

> Rebase命令在另一个分支基础之上重新应用，用于把一个分支的修改合并到当前分支。



### 代替合并

为什么要用rebase替代merge, rebase 可以让 commit 记录更加清爽,避免产生额外的合并记录.



案例:

现在有两个分支 **master**, **feature**, 提交记录如下,现在要求将**master**上的最新提交合并到 **feature** 分支上.

```
          A---B---C feature
         /
    D---E---F---G master
```

执行命令

```sh
git rebase master
```

如果遇到冲突, **rebase** 过程会暂停下来, 等待用户解决冲突

手动解决冲突后执行 `git add` , 将冲突解决后的代码添加到暂存区

执行  `git rebase --continue`  继续 

过程中可以执行 `git rebase --abort`取消 rebase



最终结果

```
                  A'--B'--C' topic
                 /
    D---E---F---G master
```

> 注意: 这里 A,B,C 和 A',B',C' 并不是一个相同的提交,他们的提交内容是一致的,但是生成的 commit ID 是不同的.
>
> 所以要将 topic 推送到远程的话, 会有报错,提示有为拉取的提交, 因为本地没有 A, B, C 的提交, 而远程存在
>
> 所以需要通过 强制推送来覆盖远程分支, 这里是最容易发生错误的一个环节
>
> 使用 `git push --force-with-lease` 会使强制推送变得更安全 



### Rebase拉取

```sh
git pull -r
```



### 合并过程中的提交

通常拉取 feature 分支开发新需求过程中会有不止一个提交记录,其中有的提交记录对于最终的结果而言没有太大的意义. 如果直接合并到 主分支, 会让主分支的提交记录变得十分的混乱. 通过使用 rebase 我们可以自由的选择需要将那些提交记录压缩掉.这里的压缩是指将多个提交合并到一个中,最终只产生一个提交记录

```
// n 是一个常数, 代表需要操作的提交数
// HEAD~2 即对当前分支的最近2个提交进行操作
git rebase -i HEAD~n
```

执行往后你将看到

```sh
pick c0ffeee 这是提交A
pick 5928aea 这是提交B
pick 04d0fda 这是提交C

# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified). Use -c <commit> to reword the commit message.
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#

```

具体的参数含义可以参考上面的提示

当前的操作界面是 `vim` 编辑器, 按 i 键进入编辑状态, `Esc` 键退出编辑状态,进入命令状态, 再输入 `:wq` ( 冒号 w q  ) 即可保存( write )退出 ( quit )

```sh
pick c0ffeee 这是提交A
s 5928aea 这是提交B
s 04d0fda 这是提交C
```

将内容改成如上, 即将 `5928aea` `04d0fda` 两个提交合并到 `c0ffeee` 中

保存退出后将进去一个新的 vim 编辑页面, 这个页面是用来输入 提交信息的

可以用 # 注释掉不需要的提交信息,或者重新编辑提交内容都可, 保存退出后, 开始合并

合并前的内容如果已经推送到远程了, 那么你也要用 强制推送 才能将合并后的内容推送到远程