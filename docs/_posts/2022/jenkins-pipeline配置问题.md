---
title: Coding Pipeline配置问题
date: 2022-5-15
author: czj
lang: zh-cn
tags:
summary: 使用腾讯云的Coding服务配置持续集成问题记录
---



## 1. 通过SSH远程执行命令

```
stage('部署镜像') {
      steps {
        script {
          def remote = [:]
          remote.name = 't-server'
          remote.host = "${REMOTE_HOST}"
          remote.user = "${REMOTE_USER}"
          remote.password = "${REMOTE_PASSWORD}"
          remote.allowAnyHosts = true

          sshCommand remote: remote, command: """
            if [ -n \"\$(docker ps -q --filter ancestor=${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG})\" ];
            then
              docker stop \$(docker ps -q --filter ancestor=${DOCKER_FULL_IMAGE});
              docker rm -f \$(docker ps -q -a --filter ancestor=${DOCKER_FULL_IMAGE});
              docker rmi -f ${DOCKER_FULL_IMAGE};
            fi

            docker pull ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG};
            docker run --name ${TCR_REPOSITORY_NAME} -d -p 8082:80 ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG};
          """
        }
      }
    }
```



## 2. npm build 构建失败

```sh
npm run build
```

> [2022-05-15 15:26:37] + npm run build
>
> [2022-05-15 15:26:37] 
>
> [2022-05-15 15:26:37] > timeline-web@0.1.0 build /******/workspace
>
> [2022-05-15 15:26:37] > rimraf dist && cross-env vite build
>
> [2022-05-15 15:26:37] 
>
> [2022-05-15 15:26:38] internal/modules/cjs/loader.js:638
>
> [2022-05-15 15:26:38]     throw err;
>
> [2022-05-15 15:26:38]     ^
>
> [2022-05-15 15:26:38] 
>
> [2022-05-15 15:26:38] Error: Cannot find module 'worker_threads'

使用 Vite 构建 Vue3 报错

### 问题原因

**Coding 的JenKins node 运行环境版本太低导致的**

### 解决方案

升级 nodejs 版本

 在 Pipeline 的 agent 中指定node镜像版本

```
pipeline {
	agent {
		docker {
			image 'node:16.15'
		}
	}
	
	stages {
		// ...
	}
}
```



配置 agent 后，构建问题解决了，但是又引入了新的问题 **构建 docker 镜像报错**

```sh
docker build -t ${DOCKER_IMAGE} .
```

> docker: not found

问题原因不详



经过一番查找，发现 agent 还可以配置在指定的 stage 中

```
pipeline {
	agent any
	stages {
		//...
		
		stage('编译') {
          agent {
            docker {
              image 'node:16.15'
            }
          }
          steps {
            sh "npm run build"
          }
        }
	}
}
```

经过测试发现 node 版本正常，但又引入了新的问题

> [2022-05-15 17:30:19] + npm run build
>
> [2022-05-15 17:30:19] npm ERR! code ENOENT
>
> [2022-05-15 17:30:19] npm ERR! syscall open
>
> [2022-05-15 17:30:19] npm ERR! path /******/workspace@2/package.json
>
> [2022-05-15 17:30:19] npm ERR! errno -2
>
> [2022-05-15 17:30:19] npm ERR! enoent ENOENT: no such file or directory, open '/******/workspace@2/package.json'
>
> [2022-05-15 17:30:19] npm ERR! enoent This is related to npm not being able to find a file.



通过和之前的日志对比，发现执行构建命令的工作目录变了，当前的工作目录下不存在源码



知道问题所在，寻找解决办法就有了头绪

1. 通过命令切回到上一个 stage 的工作目录
2. 不切换工作目录



尝试通过 cd 命令切换到原来的工作目录无果，似乎两个stage的运行环境并不存在联系



查找 Jenkins Pipeline 的文档，发现`agent`似乎有可以解决该问题的配置

	1.  `customWorkspace` 指定工作目录
 	2.  `reuseNode`  一个布尔值，默认为false。如果为true，则在同一工作空间中，而不是完全在新节点上运行Pipeline顶层指定的节点上的容器。此选项适用于docker和dockerfile，并且仅在agent的每个stage内才有效果。



由于使用的是 Coding 的服务，无法获取到完整的工作空间路径

所以采用 reuseNode 设置，测试后可以使用

以下就是最终的配置

```
pipeline {
	agent any
	stages {
		//...
		
		stage('编译') {
          agent {
            docker {
              image 'node:16.15'
              reuseNode true
            }
          }
          steps {
            sh "npm run build"
          }
        }
	}
}
```

