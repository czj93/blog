---
title: Vue v3的变更内容对比 
date: 2022-2-28
author: czj
lang: zh-cn
tags:
  - Vue
summary: 对比Vue V3版本相较于V2的变化
---







## 1. 全局API变更

### 1.1 创建实例方式

Vue2

```js
import Vue from 'vue'
import App from './App.vue'

const vm = new Vue({
	render: h => h(app)
})

vm.$mount('#app')
```

Vue3

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createAPp(App)

app.mount('#app')
```



### 1.2 全局API 变为 实例API

Vue2

```js
import Vue from 'vue'
Vue.config
Vue.config.productionTip
Vue.config.ignoredElements = ['my-el', /^ion-/]
Vue.component('MyComponent', { /* ... */ })
Vue.directive('focus', { /* ... */ })
Vue.mixin({ /* ... */ })
Vue.use(VueRouter)
Vue.prototype.$http = () => {}
Vue.extend({ /* ... */ })
```

Vue3

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config
// Vue.config.productionTip 已删除
app.config.compilerOptions.isCustomElement = tag => tag.startsWith('ion-')
app.component('MyComponent', { /* ... */ })
app.directive('focus', { /* ... */ })
app.mixin({ /* ... */ })
app.use(VueRouter)
app.config.globalProperties.$http = () => {}
// Vue.extend({ /* ... */ }) 已删除
```



### 1.3 默认导出变为命名导出

> 更好的支持 Tree shaking

Vue2

```js
import Vue from 'vue'

const { nextTick, observable } = Vue

nextTick(() => {
    /* ... */
})
```



Vue3

```js
import { nextTick, reactive } from 'vue'

nextTick(() => {
    /* ... */
})
```



## 2. 模板指令变更

### 2.1 v-model

Vue2

```vue
<component v-model="value" />

// 等于

<component @input="value = $event" :value="value" />
```

自定义v-model

```js
export default {
	model: {
        prop: 'checked',
        event: 'change'
    }
}
```

Vue3

```vue
<component v-model="value" />

// 等于

<component :modelValue="value" @update:modelValue="value = $event" />
```

自定义 v-model

```vue
<template>
	<component v-model:checked="value" />
</template>
<script setup>
defineProps({
    checked: Boolean
})
defineEmits([ 'update:title' ])
</script>
```



### 2.2 .sync 修饰符

vue2

```vue
<component title.sync="title" />
// 等于
<component :title="title" @update:title="title = $event" />
```

Vue3

```vue
<component v-model:title="title" />
// 等于
<component :title="title" @update:title="title = $event" />
```



### 2.3 自定义 v-model 修饰符

vue2 不支持



vue3

```vue
<template>
	<MyComponent v-model:title.capitalize="myText" />
</template>
<script setup>
const props = defineProps({
    modelValue: String,
    modelModifiers: { default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

function emitValue(e) {
    let value = e.target.value
    if (props.modelModifiers.capitalize) {
        value = value.charAt(0).toUpperCase() + value.slice(1)
    }
    emit('update:modelValue', value)
}
</script>

// 等同于

<template>
	<input type="text" :value="modelValue" @input="emitValue" />
</template>
```



### 2.4 v-for

> template v-for 中的key不再写在子元素上

vue2

```vue
<template v-for="item in list">
	<div :key="item.id"></div>
</template>
```

vue3

```vue
<template v-for="item in list" :key="item.id">
	<div></div>
</template>
```



### 2.5 v-if 和 v-for

> vue2 中 v-if 和 v-for 同时使用，Vue会报 warning, 不推荐同时使用，建议优先过滤需要遍历的数据
>
> vue3 中 v-if 的优先级高于 v-for



vue2

```vue
<template>
	<div v-for="item in list" v-if="ok">{{ item.prop }}</div>
</template>
<script>
export default {
    data() {
        return {
            list: [/* ... */],
            ok: true,
        }
    },
    render: h => {
        return this.list.map(item => {
            if (item.ok) {
                return <div>{ item.prop }</div>
            }
        })
    }
}
</script>
```



vue3

```vue
<template>
	<div v-for="item in list" v-if="ok">{{ item.prop }}</div>
</template>
<script>
import { ref, defineComponent } from 'vue'

export default defineComponent(function() {
    const list = ref([/* ... */])
    const ok = ref(true)
    
    return () => {
        return (
        	<>
            	{
                    ok.value ? list.value.map(item => {
                    	return <div>{ item.prop }</div>
                	})
        			: null
                }
            </>
        )	
    }
})
</script>
```



### 2.6 v-bind 合并顺序改变

vue2

```vue
<div id="red" v-bind="{ id: 'blue' }"></div>
// 结果
<divid="red"></div>
```

vue3

```vue
<div id="red" v-bind="{ id: 'blue' }"></div>
// 结果
<div id="blue"></div>


<div v-bind="{ id: 'blue' }" id="red"></div>
// 结果
<div id="red"></div>
```



### 2.7 v-on.native 修饰符

> Vue3 中被删除，未在 emits, defineEmits 中声明的原生事件会绑定到组件的根元素上



vue2

```vue
<MyComponent @close="handleComponentEvent" @click.native="handleNativeClickEvent" />
```

vue3

```vue
<MyComponent @close="handleComponentEvent" @click="handleNativeClickComponent" />

<script setup>
defineEmits(['close'])
</script>
```



## 3. 组件变更

### 3.1 未声明在 emits 中的原生事件会绑定到组件根元素上

### 3.2 异步组件

> 声明 Vue Router 路由时 不应使用 defineAsyncComponent



## 4. 渲染函数变更

### 4.1 渲染函数 h

> h 由库提供 而不是 函数参数

*似乎也是为了 tree shaking*

vue2

```js
export default {
	render(h) {
		return h('div')
	}
}
```

vue3

```js
import { h, defineComponent } from 'vue'

export default defineComponent(function() {
	return () => h('div')
})
```

