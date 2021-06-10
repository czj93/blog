---
title: Vue组件中v-model的使用及原理
date: 2021-06-10
author: czj
lang: zh-cn
tags:
  - vue
summary: 这是一篇旧文，我是写blog 的起点，可惜没有一直坚持下来
---

> 原文地址：https://segmentfault.com/a/1190000009492595

在 [Vue.js][1] 中，经常会使用 [v-model][2] 实现表单的双向数据绑定功能。

使用 [Element][3] 组件时，组件库中的含有输出类型的自定义组件，都会使用v-model指令，该指令绑定的元素就是组件的输出结果。比如 [select选择器][4]

![Element的select组件使用说明](https://image-static.segmentfault.com/151/728/151728545-59202de70f395_fix732)

平常只使用v-model做表单元素的数据绑定，没有仔细研究过这背后的原理，不是很理解自定义组件是怎么实现这个功能的。

查找了一下相关资料，其实 [Vue.js][6] 的官网上有教程有相关的资料。

[使用自定义事件的表单输入组件][7]

v-model 其实是一个语法糖，这背后其实做了两个操作

 1. v-bind 绑定一个 value 属性
 2. v-on 指令给当前元素绑定 input 事件

### 在原生表单元素中 ###

```vue
<input v-model='something'>
```
就相当于
```vue
<input v-bind:value="something" v-on:input="something = $event.target.value">
```

当input接收到新的输入，就会触发input事件，将事件目标的value 值赋给绑定的元素

### 在自定义组件中 ###

```vue
<my-component v-model='something'></my-componment>
```
相当于
```vue
<my-component v-bind:value='something' v-on:input='something = arguments[0]'></my-component>
```
这时候，something接受的值就是input是事件的回掉函数的第一个参数
所以在自定义的组件当中，要实现数据绑定，还需要使用[$emit]去触发input的事件。

```vue
this.$emit('input', value)
```



----------


[1]: https://cn.vuejs.org/
[2]: https://cn.vuejs.org/v2/guide/forms.html
[3]: http://element.eleme.io/#/zh-CN
[4]: http://element.eleme.io/#/zh-CN/component/select
[5]: /img/bVNZvP
[6]: https://cn.vuejs.org/
[7]: https://cn.vuejs.org/v2/guide/components.html#%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6%E7%9A%84%E8%A1%A8%E5%8D%95%E8%BE%93%E5%85%A5%E7%BB%84%E4%BB%B6