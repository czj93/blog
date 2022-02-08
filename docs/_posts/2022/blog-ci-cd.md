---
title: 通过Github action + docker实现CI/CD
date: 2022-2-8
author: czj
lang: zh-cn
summary: 通过Github action + docker + 云服务器实现博客的自动打包部署
---



## 1. 准备工作

1. 准备一台云服务器

   我选择的是腾讯云的轻量型服务器（2核4G）3年222元，比较实惠

   系统镜像选择了 CentOS+Docker

2. 新建一个 VuePress 项目，并删除Github



## 2. 重置服务器密码

腾讯云的服务器购买时不需要设置Root账户密码，需要通过控制台重置密码的操作重新设置密码，用于后续 Github action 远程登录服务器。

*重置密码需要先关机*



## 3. 开启腾讯云的容器服务

容器服务是用于存储 docker 镜像的，腾讯有提供个人免费版，对于存储镜像数量有限制，但是足够个人开发使用。

> 镜像仓库分企业版和个人版，腾讯云是通过同一个平台来管理的，将地域切到广州，就可以选择个人版镜像仓库



1. 创建命名空间
2. 创建镜像仓库

## 4. Github 配置 Secrets

打开 github 项目

进入 settings>Secrets>Actions, 点击 New repository secret

secret 包含 Name 和 Value 两字段

创建一下secret：

| Name                 |                    | Value                            |
| -------------------- | ------------------ | -------------------------------- |
| DOCKER_HUB_HOST      |                    | ccr.ccs.tencentyun.com           |
| DOCKER_HUB_NAMESPACE | 镜像仓库的命名空间 | 填写步骤3创建的命名空间          |
| DOCKER_HUB_PASSWORD  | 镜像仓库的密码     | 步骤3 中设置的密码               |
| DOCKER_HUB_USERNAME  | 镜像仓库的用户名   | 步骤3 中会给到，忘了到控制台查看 |
| IMAGE_NAME           | 镜像名称           | 步骤3 中创建的镜像仓库名称       |
| REMOTE_HOST          | 云服务器的 公网IP  | 查看控制台                       |
| REMOTE_USER          | 云服务器的用户名   | root                             |
| SERVER_PASSWORD      | 云服务器密码       | 查看步骤2                        |



## 5. 创建Nginx配置文件

项目根目录下新建 delopy 目录

创建 default.config 文件

```nginx
# default.config

# 开启gzip
gzip on;
# 启用gzip压缩的最小文件；小于设置值的文件将不会被压缩
gzip_min_length 1k;
# gzip 压缩级别 1-10 
gzip_comp_level 2;
# 进行压缩的文件类型。
gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
# 是否在http header中添加Vary: Accept-Encoding，建议开启
gzip_vary on;


server {
    listen       80;
    server_name  localhost;

    location / {
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

}
```



## 5. 创建Dockerfile

项目根目录下新建文件 `Dockerfile`

```dockerfile
FROM nginx

WORKDIR /usr/share/nginx/html
COPY deploy/default.conf /etc/nginx/conf.d/
COPY docs/.vuepress/dist/ /usr/share/nginx/html
EXPOSE 80
```



## 6. 创建 Github Actions 配置文件

项目根目录下新建 `.github` 目录，目录下新建 `workflows`,  workflows 下新建一个名为`main.yml` 的文件

 

```yaml
# This is a basic workflow to help you get started with Actions

name: Deploy

# Controls when the action will run. Triggers the workflow on push or pull request
# events but only for the master branch
on:
  push:
    branches: [ main ]

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
    # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v1
      with:
        node-version: '12.x'
    # 使用 npm  缓存
    - name: Cache node modules
      uses: actions/cache@v2
      id: cache
      env:
        cache-name: cache-node-modules
      with:
        # npm cache files are storeed in '~/.npm' on Linux/Mac os
        path: node_modules
        key: ${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

    # 安装依赖
    - name: Install dependencies
      if: steps.cache.outputs.cache-hit != 'true'
      run: npm install

    # 打包
    - name: Build project
      run: npm run build

    # build docker images
    - name: Build docker images
      run: docker build -t ${{secrets.IMAGE_NAME}}:latest ./

    - name: Login to Tencent registry
      run: docker login --username=${{secrets.DOCKER_HUB_USERNAME}} --password=${{secrets.DOCKER_HUB_PASSWORD}} ${{secrets.DOCKER_HUB_HOST}}

    - name: Image Add Tag
      run: docker tag ${{secrets.IMAGE_NAME}}:latest ${{secrets.DOCKER_HUB_HOST}}/${{secrets.DOCKER_HUB_NAMESPACE}}/${{secrets.IMAGE_NAME}}:latest

    - name: Push Image
      run: docker push ${{secrets.DOCKER_HUB_HOST}}/${{secrets.DOCKER_HUB_NAMESPACE}}/${{secrets.IMAGE_NAME}}:latest

  run-image:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
    - name: Deploy docker
      uses: appleboy/ssh-action@master
      with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
            # key: ${{ secrets.SERVER_SSH_KEY }}
          password: ${{ secrets.SERVER_PASSWORD }}
          port: 22
          script: |
            ## TODO: 初次部署会报错，由于不存在旧版镜像导致 stop、rm等命令参数不全
            # 停止旧版镜像
            docker stop $(docker ps -q --filter ancestor=${{secrets.DOCKER_HUB_HOST}}/${{secrets.DOCKER_HUB_NAMESPACE}}/${{secrets.IMAGE_NAME}})
            # 删除旧版容器
            docker rm -f $(docker ps -q -a --filter ancestor=${{secrets.DOCKER_HUB_HOST}}/${{secrets.DOCKER_HUB_NAMESPACE}}/${{secrets.IMAGE_NAME}})
            # 删除旧版镜像
            # TODO: docker images -q 获取镜像id命令存在错误，改为通过名称删除，通过id删除和镜像名称删除的区别？？
            #docker rmi -f $(docker images -q ancestor=${{secrets.DOCKER_HUB_HOST}}/${{secrets.DOCKER_HUB_NAMESPACE}}/${{secrets.IMAGE_NAME}}:latest)
            docker rmi -f ${{secrets.DOCKER_HUB_HOST}}/${{secrets.DOCKER_HUB_NAMESPACE}}/${{secrets.IMAGE_NAME}}
            # 拉取 latest 版镜像
            docker pull ${{secrets.DOCKER_HUB_HOST}}/${{secrets.DOCKER_HUB_NAMESPACE}}/${{secrets.IMAGE_NAME}}:latest
            # 运行 latest 版镜像
            docker run --name ${{secrets.IMAGE_NAME}} -d -p 8081:80 ${{secrets.DOCKER_HUB_HOST}}/${{secrets.DOCKER_HUB_NAMESPACE}}/${{secrets.IMAGE_NAME}}:latest

```

配置完以上内容后，将代码 push 到 Github, 会自动启动构建部署

部署成功后通过访问 **http://[公网IP]:8081** 查看



## 7. 可能出现的问题及解决办法

1. Action 报错

   首次部署，Deploy docker 步骤会报错，导致部署失败，原因上面注释中有些

   **解决办法：**

   登录服务器 手动拉取镜像，启动镜像*（后续看看怎么优化一下脚本）*



2. 部署时间很长

   由于 Gihub Action 的服务器不在国内，导致镜像上传腾讯云镜像仓库的时间非常长

   **解决办法**：

   等

   

3. 部署成功，浏览器中无法访问

   可能是你的云服务器8081端口未开放

   **解决办法：**

   进入云服务控制台，打开防火墙，添加一条规则

   | 应用类型 | 来源      | 协议 | 端口 | 策略 |
   | :------- | :-------- | :--- | :--- | :--- |
   | 自定义   | 0.0.0.0/0 | TCP  | 8081 | 允许 |

