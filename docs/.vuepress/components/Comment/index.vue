<template>
  <div class="comment-wrap">
    <div class="comment-title">
      <span>评论列表</span>
      <span class="btn-comment" @click="commentHandle">评论</span>
    </div>
    <czj-comment
      ref="comment"
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
  created() {
    const token = localStorage.getItem('czj-token')
    if(token) this.token = token
  },
  methods: {
    loginHandle() {
      this.loginVisible = true
    },
    loginedHandle(token) {
      this.token = token
    },
    commentHandle() {
      this.$refs.comment.doComment()
    }
  }
}
</script>
<style>
.comment-wrap {
  margin-top: 16px;
}
.comment-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  margin-bottom: 8px;
  line-height: 30px;
  border-bottom: 2px solid #2c3e50;
}
.czj-comment {
  padding: 0 16px;
}
.btn-comment {
  cursor: pointer;
  font-size: 14px;
}
.btn-comment:hover {
  color: #1989fa;
}
</style>