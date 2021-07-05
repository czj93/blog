<template>
  <div class="login-wrap">
    <div class="tabs">
      <span :class="{ active: activeTab === 1 }" @click="activeTab = 1">密码登录</span>
      <span :class="{ active: activeTab === 2 }" @click="activeTab = 2">第三方登录</span>
    </div>
    <template v-if="activeTab === 1">
      <div class="form-item">
        <span class="form-item-label">用户名：</span>
        <input v-model="username" class="form-input-wrap" type="text" placeholder="请输入用户名">
      </div>
      <div class="form-item">
        <span class="form-item-label">密&nbsp;&nbsp;&nbsp;&nbsp;码：</span>
        <input v-model="password" class="form-input-wrap" type="password" placeholder="请输入密码">
      </div>
      <div class="btn" @click="accountLogin">登 录</div>
    </template>
    <template v-else>
      <div class="tac">
        <a :href="`https://github.com/login/oauth/authorize?client_id=b469a6f3a77aeef6aea1&redirect_uri=${redirect_uri}`">点击Github第三方登录</a>
      </div>
    </template>
    <span class="close" @click="$emit('close')">关闭</span>
  </div>
</template>
<script>
export default {
  name: 'Login',
  props: {
    baseUrl: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      username: '',
      password: '',
      activeTab: 1,
      redirect_uri: '',
    }
  },
  created() {
    this.redirect_uri = encodeURIComponent(`https://caozj.cn/blog/redirect?url=${location.href}`)
    this.codeLogin()
  },
  methods: {
    codeLogin() {
      const { code } = this.$route.query
      if(code) {
        fetch(`${this.baseUrl}/oauth/login?code=${code}`, {
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(data => {
          this.loginSuccess(data)
        })
      }
    },
    accountLogin() {
      const { username, password } = this
      if(!username || !password) return alert('请输入账号密码')
      fetch(`${this.baseUrl}/user/login`, {
        method: 'post',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })
      .then(response => response.json())
      .then(data => {
        this.loginSuccess(data)
      })
    },
    loginSuccess(data) {
      if(data.success) {
        localStorage.setItem('czj-token', data.result)
        this.$emit('logined', data.result)
        this.$emit('close')
      } else {
        alert(data.message)
      }
    }
  }
}
</script>
<style scoped>
.login-wrap {
  position: fixed;
  top: 50%;
  left: 50%;
  padding: 16px 30px;
  background: #fff;
  border-radius: 8px;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px #ccc;
  z-index: 999;
}
.form-item {
  margin-bottom: 16px;
}
.form-input-wrap {
  line-height: 28px;
  padding: 0 8px;
}
.form-input-wrap:focus {
  outline-color: #1989fa;
}
.tabs {
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.tabs span {
  padding: 8px 16px;
  cursor: pointer;
}
.tabs span.active {
  color: #1989fa;
}
.btn {
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  background: #1989fa;
  text-align: center;
  cursor: pointer;
}
.btn:hover {
  background: #1473d2;
}
.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  cursor: pointer;
}
.close:hover {
  color: #1989fa;
}
</style>
