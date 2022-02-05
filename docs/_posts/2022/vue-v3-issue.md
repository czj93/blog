---
title: Vue3+typescript+elemnt-plus填坑
date: 2022-2-2
author: czj
lang: zh-cn
tags:
  - Vue
summary: Vue3 typescript elemnt-plus 使用过程问题记录
---

## 遇到的问题


### 1.数据双向绑定不生效

 不使用 `v-model`, 而是通过给组件添加 `value` 和 `input` 事件手动复制，实现双向绑定，但是组件效果与预期不符，输入框内没有内容

```vue
<template>
  <div class="grid grid-cols-4 gap-4px">
    <el-input :value="form.value" @input="inputHandler" />
  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue";
const form = reactive({ value: "" });

const inputHandler = value => {
  form.value = value;
};
</script>
```



改为 v-model 实现，效果符合预期，输入框内会正常显示输入的内容

```vue
<template>
  <div class="grid grid-cols-4 gap-4px">
    <el-input v-model="form.value" />
  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue";
const form = reactive({ value: "" });

const inputHandler = value => {
  form.value = value;
};
</script>
```

