---
2title: Shell条件判断
date: 2022-5-15
author: czj
lang: zh-cn
tags:
summary: Shell条件判断
---



# 1. 条件判断

## 1.1 文件类型判断

​	

| 选项 | 内容                        | 例子 |
| ---- | --------------------------- | ---- |
| -b   | 是否为块文件block           |      |
| -c   | 是否为字符文件char          |      |
| -d   | 是否为目录文件 directory    |      |
| -e   | 文件是否存在，存在为真exist |      |
| -f   | 是否为普通文件file          |      |
| -L   | 是否为符号链接文件link      |      |
| -p   | 是否为管道文件pipe          |      |
| -s   | 是否为空文件spare           |      |

```shell
[ -f test08.txt ] && echo yes || echo no
// yes
```



## 1.2 判断文件权限



| 选项 | 内容                    | 例子 |
| ---- | ----------------------- | ---- |
| -r   | 是否拥有读权限read      |      |
| -w   | 是否拥有写权限write     |      |
| -x   | 是否拥有执行权限execute |      |
| -u   | 是否拥有SUID权限        |      |
| -g   | 是否拥有SGID权限        |      |
| -k   | 是否拥有SBit权限        |      |



```shell
[ -w test08.txt ] && echo yes || echo no
// yes
```



## 1.3 字符串判断



| 表达式 | 内容                     | 例子 |
| ------ | ------------------------ | ---- |
| -z     | 字符串是否为空           |      |
| -n     | 字符串是否为非空         |      |
| ==     | 字符串1是否和字符串2相等 |      |
| !==    | 字符串1是否不等于字符串2 |      |



``` shell
// str1字符串不为空串时值为真
[ -n str1 ] && echo yes || echo no

// str1字符串为空串时值为真
[ -z str1 ] && echo yes || echo no

```



## 1.4 逻辑判断



| 表达式 | 内容   |      |
| ------ | ------ | ---- |
| -a     | 逻辑与 |      |
| -o     | 逻辑或 |      |
| !      | 逻辑非 |      |



```shell
// 如果 变量a不为空 并且 a大于23 则为 真 否则为 假
a=12
[ -n "$a" -a "$a" -gt 23 ] && echo yes || echo no

// no
```



## 1.5 整数大小判断



| 表达式 | 描述             | 例子                                   | 输出 |
| ------ | ---------------- | -------------------------------------- | ---- |
| -eq    | 判断整数是否相等 | [ 23 -eq 24 ] && echo yes \|\| echo no | no   |
| -ne    | 判断是否不相等   | [ 23 -ne 24 ] && echo yes \|\| echo no | yes  |
| -gt    | 是否大于         | [ 23 -gt 24 ] && echo yes \|\| echo no | no   |
| -lt    | 是否小于         | [ 23 -lt 24 ] && echo yes \|\| echo no | yes  |
| -ge    | 是否大于等于     | [ 23 -ge 24 ] && echo yes \|\| echo no | no   |
| -le    | 是否小于等于     | [ 23 -le 24 ] && echo yes \|\| echo no | yes  |
|        |                  |                                        |      |



# 2. Demo

判断镜像是否运行中，如果存在则暂停镜像并删除

再拉取最新的镜像并运行

```shell
if [ -n "$(docker ps -q --filter ancestor=${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG})" ];
            then
              docker stop $(docker ps -q --filter ancestor=${DOCKER_FULL_IMAGE});
              docker rm -f $(docker ps -q -a --filter ancestor=${DOCKER_FULL_IMAGE});
              docker rmi -f ${DOCKER_FULL_IMAGE};
            fi

            docker pull ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG};
            docker run --name ${TCR_REPOSITORY_NAME} -d -p 8082:80 ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG};
```



> -n在[]结构中测试必须要用""把变量引起来。使用一个未被""的字符串来使用! -z

```shell
// 测试机运行着 nginx镜像 的实例
[lighthouse@VM-4-16-centos ~]$ [ -n $(docker ps -q --filter ancestor=nginx) ] && echo yes || echo no
// yes
[lighthouse@VM-4-16-centos ~]$ [ -n $(docker ps -q --filter ancestor=nginx233) ] && echo yes || echo no
// yes
[lighthouse@VM-4-16-centos ~]$ [ -z $(docker ps -q --filter ancestor=nginx233) ] && echo yes || echo no
// yes
[lighthouse@VM-4-16-centos ~]$ [ -z $(docker ps -q --filter ancestor=nginx) ] && echo yes || echo no
// no
[lighthouse@VM-4-16-centos ~]$ [ -n "$(docker ps -q --filter ancestor=nginx)" ] && echo yes || echo no
// yes
[lighthouse@VM-4-16-centos ~]$ [ -n "$(docker ps -q --filter ancestor=nginx233)" ] && echo yes || echo no
// no
```

