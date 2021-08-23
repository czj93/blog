---
title: Vue3 使用注意事项
date: 2021-08-22
author: czj
lang: zh-cn
tags:
  - vue3
summary: 从 vue2 升级 vue3 的需要注意的地方vo
---



### v-model 非兼容升级，默认属性修改

​	`v-model` 自定义组件的 prop 和事件默认名称已更改

​	属性 `value` 改为 `modelValue`

​	事件名 `input` 改为 `update:modelValue`

​	[文档地址](https://v3.cn.vuejs.org/guide/migration/v-model.html#%E6%A6%82%E8%A7%88)



```vue
# vue2
<ChildComponent v-model="pageTitle" />
<!-- 是以下的简写: -->
<ChildComponent
  :value="pageTitle"
  @input="pageTitle = $event"
/>

# vue3
<ChildComponent v-model="pageTitle" />
<!-- 是以下的简写: -->
<ChildComponent
  :modelValue="pageTitle"
  @update:modelValue="pageTitle = $event"
/>
```



### vue2 中的 refs 在 vue3 setup的使用

```vue
<template>
	<div>
        <!--- 添加 ref 属性 --->
    	<Child ref="child" ></Child>
    </div>
</template>
<script setup lang="ts" >
import { ref, onMounted } from 'vue'

// 创建一个 于 ref 属性同名的 ref 代理对象
const child = ref()

onMounted(() => {
    // child.value
})

</script>
```



> 以上方式似乎无法正确获取通过 `setup script` 定义的子组件实例

```vue
// child.vue
<script setup lang="ts" >
    import { reactive } from 'vue'
	const state = reactive({})
</script>

// child.vue
<script lang="ts" >
    import { defineComponent } from 'vue'
    
    export default defineComponent({
        data() {
            return {
                state: {}
            }
        }
    })
</script>
```



### 组件状态的调试

`Vue3` 的响应式系统改为 `Proxy` 实现后，

我们通过获取的访问的对象都是 代理对象，通过 console.log 打印调试，打印的结果都是

![](D:\Code\personal\blog\docs\_posts\2021\images\cefb41939cea764917df6410a23cb3ae.png)

没办法直观看到原始对象的值

需要通过 `toRaw` 、`unRef` 得到代理对象的原始对象

```vue
<script setup lang="ts">
import { reactive, toRaw } from 'vue'

let state = reactive({ a: 1 })

console.log(state)
// [[Handler]]: Object
// [[Target]]: Object
// [[IsRevoked]]: false

console.log(toRaw(state)) // { a: 1 }
</script>
```



