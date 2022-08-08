pipeline {
  agent any
  environment {
    // ccr.ccs.tencentyun.com/czj-hub/thiny_erp_web:latest

    // ccr.ccs.tencentyun.com
    DOCKER_REGISTRY_HOSTNAME = "${TCR_REGISTRY_HOSTNAME}"
    DOCKER_REGISTRY_CREDENTIAL = "${TCR_REGISTRY_CREDENTIAL}"
    // latest
    DOCKER_IMAGE_TAG = "${TCR_IMAGE_TAG}"
    // thiny_erp_web:latest
    DOCKER_IMAGE = "${TCR_REPOSITORY_NAME}:${TCR_IMAGE_TAG}"
    // czj-hub/thiny_erp_web
    DOCKER_REPOSITORY_NAME = "${TCR_NAMESPACE_NAME}/${TCR_REPOSITORY_NAME}"
    // ccr.ccs.tencentyun.com/czj-hub/thiny_erp_web:latest
    DOCKER_FULL_IMAGE = "${TCR_REGISTRY_HOSTNAME}/${DOCKER_REPOSITORY_NAME}"
  }
  stages  {
    stage("检出") {
      steps {
        checkout(
          [$class: 'GitSCM',
          branches: [[name: GIT_BUILD_REF]],
          userRemoteConfigs: [[
            url: GIT_REPO_URL,
              credentialsId: CREDENTIALS_ID
            ]]]
        )
      }
    }

    // 下述演示的过程依赖于模板示例代码内容，您可以根据自己的实际情况调整构建过程

    stage('安装依赖') {
      steps {
        sh "npm install"
      }
    }

    stage('编译') {

      steps {
        sh "npm run build"
      }
    }

    stage('构建镜像') {
      steps {
        // 确保仓库中有可用的 Dockerfile
        sh "docker build -t ${DOCKER_IMAGE} ."
      }
    }

    stage('推送镜像') {
      // steps {
      //   script {
      //     docker.withRegistry("https://${DOCKER_REGISTRY_HOSTNAME}", "${DOCKER_REGISTRY_CREDENTIAL}") {
      //       docker.image("${DOCKER_REPOSITORY_NAME}:${DOCKER_IMAGE_NAME}").push()
      //     }
      //   }
      // }

      steps {
        script {
          try {
            withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDENTIAL}", usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS')]) {
              sh "echo ${REGISTRY_PASS} | docker login -u ${REGISTRY_USER} --password-stdin ccr.ccs.tencentyun.com"
              sh "docker images"
              // docker tag thiny_erp_web:latest ccr.ccs.tencentyun.com/czj-hub/thiny_erp_web:latest
              sh "docker tag ${DOCKER_IMAGE} ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG}"
              // docker push ccr.ccs.tencentyun.com/czj-hub/thiny_erp_web:latest
              sh "docker push ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG}"
            }
          } catch(err) {
            echo err.getMessage()
          }
        }
      }
    }

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
            docker run --name ${TCR_REPOSITORY_NAME} -d -p 8081:80 ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG};
          """

          // sshCommand remote: remote, command: "docker rm -f $(docker ps -q -a --filter ancestor=${DOCKER_FULL_IMAGE})"

          // sshCommand remote: remote, command: "docker rmi -f ${DOCKER_FULL_IMAGE}"

          // sshCommand remote: remote, command: "docker pull ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG}"

          // sshCommand remote: remote, command: "docker run --name thiny_erp_web -d -p 8082:80 ${DOCKER_FULL_IMAGE}:${DOCKER_IMAGE_TAG}"
        }
      }
    }
  }
}
