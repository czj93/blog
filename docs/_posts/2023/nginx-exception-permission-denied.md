---
title: nginx 异常 permission denied
date: 2023-9-14
author: czj
lang: zh-cn
summary: 访问 nginx 中的静态资源，nginx error 日志中报 permission denied

---

## 问题现象
一个微前端应用访问页面后，控制台报 `Uncaught TypeError: Failed to resolve module specifier "./verdor.41f594d6.js". Invalid relative url or base scheme isn't hierarchical`。

> 经过排查根本原因是 `nginx` 报错 `permission denied`, 由于 `nginx` 子线程没有读取资源文件的权限，触发了 `try_files` 策略，返回了不符合预期的资源，导致的报错

## 问题排查

根据页面报错内容猜测是加载资源的路径存在问题。

这个微前端应用的部署架构如下

```

├─index.html `主应用入口`
├─child
│ ├─ocp `子应用 ocp`
│ │  ├─index.html
│ │ 
│ ├─ows `子应用 ows`
│ │  ├─index.html
│ │
│ ├─ols `子应用 ols`
│ │  ├─index.html
│ │

```

经过排查发现主应用在加载子应用（`child/ocp/index.html`）的代码时，总是返回了主应用(`index.html`)的代码

这个应该是触发了 `nginx` 的 `try_files` 机制导致的, 没有加载到目标资源时会默认返回指定的资源

```
server {
    listen 80;
    server_name localhost;

    location / {
        root /www/web;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

但是在当前的服务配置下， `/child/ocp/index.html`是存在资源的

检查 `nginx` 的日志文件，发现存在报错
[nginx-error-log](~@images/nginx-log-error.png)

查看运行的中 `nginx` 进程可以看出 `nginx` 的子线程的用户为 `nobody`, 再查看 `nginx` 资源的文件权限，推测是犹豫权限不匹配导致的访问报错

```sh
ps aux | grep nginx

# root   38037 0.0 0.0 16356  732 ? S 14:44 0:00 nginx: master process /usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
# nobody 38038 0.1 0.0 17912 1876 ? S 14:44 0:19 nginx: worker process
```

## 解决办法
在 `nginx` 中指定 `user` 为 `root`

`user` 配置用于配置运行中的 `nginx` 服务器的 worker 进程的用户。


```nginx.conf

user root;
worker_processes auto;

server {
    # 
}

```

修改配置后使用该命令 `nginx -t` 验证配置文件
配置文件正确的话重启 `nginx`

```
nginx -s reload
```



