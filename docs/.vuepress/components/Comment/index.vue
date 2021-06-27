<template>
  <div class="comment-wrap">
    <div class="comment-title">评论</div>
    <czj-comment
      @login="loginHandle"
      :token="token"
      base-url="/api"
      :article-id="articleId"
    />
    <Login v-if="loginVisible" @close="loginVisible = false" @logined="loginedHandle" />
  </div>
</template>
<script>
import Login from '../Login.vue'
import { CzjComment } from 'czj-comment'
require('czj-comment/lib/czj-comment.css')

export default {
  name: 'Comment',
  props: {
    articleId: {
      type: String,
      required: true
    }
  },
  components: {
    Login,
    CzjComment
  },
  data() {
    return {
      token: '',
      loginVisible: false
    }
  },
  methods: {
    loginHandle() {
      this.loginVisible = true
    },
    loginedHandle(token) {
      this.token = token
    }
  }
}
</script>
<style>
.comment-wrap {
  margin-top: 16px;
}
.comment-title {
  font-size: 18px;
  margin-bottom: 8px;
  border-bottom: 2px solid #2c3e50;
}
.czj-comment {
  padding: 0 16px;
}
</style>