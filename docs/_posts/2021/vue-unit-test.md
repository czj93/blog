---
title: Vue项目Jest单元测试实践
date: 2021-10-15
author: czj
lang: zh-cn
tags:
  - vue
  - unit test
  - jest
summary: 
---



## 安装





## 常见问题

1.  jest 无法匹配到业务模块下`__tests__`里的测试文件

   > 修改 vue-cli 默认生成的 jest 配置

   ```js
   module.exports = {
       // testMatch: ['**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)']
   	testMatch: ['**/tests/unit/**/*.spec.(js|jsx|ts|tsx)', '**/__tests__/*.(js|jsx|ts|tsx)']
   }
   ```

2. shallowMount 挂载组件报错，全局组件未注册

   ```
   [Vue warn]: Unknown custom element: <a-button> - did you register the component correctly? For recursive components, make sure to provide the "name" option
   ```

   > 可以通过 stubs 将子组件存根， 但会引入新的问题，stubs 一般用来去掉自定义 子组件，不太适合这种情况，而且 stubs 会给 子组件添加一级  <${component name}-stub>

   ```js
   import { shallowMount } from '@vue/test-utils'
   import Button from 'ant-design-vue/lib/button'
   // Component 中引用了 Button, Button 是全局注册的
   const wrapper =  shallowMount(Component, {
       stubs: {
   		'a-button': Button,
   	}
   })
   wrapper.html()
   // a-button 被包裹了 wave-stub
   // ... <wave-stub><button disabled="disabled" type="button" class="ant-btn ant-btn-text"><span>edit</span></button></wave-stub> ...
   
   // 为了判断按钮是否可以编辑
   test('button is disabled', () => {
       const btn = wrapper.findComponent(Button)
       except(btn.exist()).toBe(true)
       except(btn.find('button').attributes('disabled')).toBe('disabled')
   })
   ```

   html 结构的问题并不会影响测试，断言不应该依赖于dom属性，在Vue中，所有的视图的变化都源于数据的变动，应该直接使用 `data`、`props` 写断言

   所以正确的写法是

   ```js
   test('button is disabled', () => {
       const btn = wrapper.findComponent(Button)
       except(btn.exist()).toBe(true)
       except(btn.props().disabled).toBe(true)
   })
   ```



​		**shallowMount 配合 stubs 才会出现包裹 <${component name}-stub> 的情况，使用 mount 并不会，这里的最佳实践应该是使用 mount 挂载组件**

1. 多语言

   > 通过 mocks 模拟 $t 方法

   ```js
   import { shallowMount } from '@vue/test-utils'
   import Component from './Component'
   
   shallowMount(Component, {
   	mocks: {
   		$t(key) {
   			const langs = {
   				...
   			}
   			return langs[key] || key
   		}
   	},
   })
   ```

2. 引用 node_modules 里的组件会报错

   > Cannot use import statement outside a module





## 资料

2. [Vue测试指南](https://lmiller1990.github.io/vue-testing-handbook/zh-CN/stubbing-components.html)
2. [Vue Test Utils](https://vue-test-utils.vuejs.org/zh/)
3. [Jest](https://www.jestjs.cn/docs/getting-started)
4. [Jest结合Vue-test-utils使用的初步实践](https://blog.csdn.net/duola8789/article/details/80434962)

