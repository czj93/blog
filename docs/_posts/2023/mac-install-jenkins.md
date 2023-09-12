---
title: MAC 安装 Jenkins
date: 2023-09-12
author: czj
lang: zh-cn
summary: homebrew 在 Mac pro 上安装 Jenkins

---

安装环境：MacBook Pro Apple M2

## 安装步骤

### 安装Homebrew

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 安装Jenkins

```sh
brew install jenkins-lts
```


### 启动Jenkins

```sh
# 启动
brew services start jenkins-lts

# 重启
brew services restart jenkins-lts
```

启动成功后访问 [http://localhost:8080](http://localhost:8080)


## 问题

### 流水线中执行 shell 脚本，报错 docker: command not found
宿主机中存在 `docker`, 流水线中执行 `docker` 相关的命令报错， docker: command not found

问题原因： `docker` 无法访问是因为没有配置 `PATH` 环境变量

解决方法： 在 `Jenkins` 中配置 `PATH` 环境变量
```sh
# 获取 PATH
echo $PATH
```
将 PATH 配置到 系统管理 -> 系统配置 -> 全局属性 中

![Jenkins PATH 环境变量配置](~@images/jenkins-path-config.png)


### 内网无法通过 IP + 端口访问 Jenkins, localhost:8080 可以访问

问题原因是：`homebrew` 将 `httpListenAddress` 设置为了 `127.0.0.1`，导致局域网内无法访问


解决办法：将以下两个文件中的 `httpListenAddress` 改为 `0.0.0.0`
`/opt/homebrew/opt/jenkins-lts/homebrew.mxcl.jenkins-lts.plist`
`/Users/[user]/Library/LaunchAgents/homebrew.mxcl.jenkins-lts.plist`
[user] 替换成本机的用户名


```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
<?xml version="1.0" encoding="UTF-8"?>
	<string>homebrew.mxcl.jenkins-lts</string>
	<key>LimitLoadToSessionType</key>
	<array>
		<string>Aqua</string>
		<string>Background</string>
<?xml version="1.0" encoding="UTF-8"?>
		<string>LoginWindow</string>
		<string>StandardIO</string>
		<string>System</string>
	</array>
	<key>ProgramArguments</key>
	<array>
		<string>/opt/homebrew/opt/openjdk@17/bin/java</string>
		<string>-Dmail.smtp.starttls.enable=true</string>
		<string>-jar</string>
		<string>/opt/homebrew/opt/jenkins-lts/libexec/jenkins.war</string>
		<string>--httpListenAddress=127.0.0.1</string>
		<string>--httpPort=8080</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
</dict>
</plist>
```

改完后重启服务

```sh
brew services restart jenkins-lts
```

[参考资料](https://www.jianshu.com/p/01c904dbea20)