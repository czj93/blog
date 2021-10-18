---
title: 在 Vue 的 slots 中使用 ref 存在的问题
date: 2021-10-18
author: czj
lang: zh-cn
tags:
  - vue
summary: 在 vue2.0 中通过 ref 去获取 slots 插槽中的组件，某写情况下无法获得预期的效果
---



## 问题背景

有个需求需要给 `antd` 的日历组件自定义日历单元格，`antd` 提供了 `slot=dateFullCellRender` 对应的插槽。

现在需要在父组件中获取所有的日历单元格组件的引用，并调用单元格中的方法。

我试图使用 `ref` 来实现。操作过程中发现，ref 并不能解决这个问题，通过 ref 获取到的永远是日历中最后一个单元格的引用。因为 `dateFullCellRender` 这个 slot 在 calendar 组件中是多个的。[Support ref attribute in slots](https://github.com/vuejs/vue/issues/7661#issuecomment-366464392)



```vue
<template>
	<a-calendar>
        <Cell
            ref="cell"
            slot="dateFullCellRender"
            slot-scope="value"
            :date="value"
          />
	</a-calendar>
</template>
<script>
export default {
    name: 'Calendar',
    mounted() {
        console.log(this.$refs.cell)
    },
}
</script>
```



## 解决办法

### 1. 通过 $children 查找组件

​	这种实在是太傻了，强依赖于 calendar 的结构，一旦calendar发生变动，很有可能导致查找出错

```js
this.$refs.calendar.$children[0].$children[1].$children[0].$children
```

可以在此基础上优化一下，可以遍历所有的子组件，通过 `vm.name` 匹配组件



### 2. 通过 ref 获取所有的实例集合

​	该方法页无法直接获取所有的单元格的实例集合，我们可以通过 `ref` 获取其中的某个引用，再通过该实例的`$parent` 获取父元素的引用，通过该父元素获取所有的子元素

```js
const dateCellRefs = this.$refs.cell.$parent.$children
```
