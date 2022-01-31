---
title: Cypress e2e测试
date: 2021-09-13
author: czj
lang: zh-cn
tags:
  - cypress
  - e2e
summary: cypress.js e2e 测试入门
---



## cypress 安装

```sh
# 已存在的项目安装 e2e
vue add e2e-cypress
```



## 常用API

- cy.visit()
- cy.screenshot()
- cy.get()
- cy.find()
- cy.contains()



DOM 操作

- click()
- dbclick()
- rightclick()
- type()
- clear()
- check()
- uncheck()
- select()
- trigger()





## 常用断言

```js
should('have.class', 'active')
```



- have.attr
- have.class
- have.value    元素的value值
- have.length  元素个数
- exist
- not.exist
- contain         包含
- be.visible      是否可见



带断言的命令

- [`cy.visit()`](https://docs.cypress.io/api/commands/visit)期望页面发送`text/html` 带有`200`状态代码的内容。
- [`cy.request()`](https://docs.cypress.io/api/commands/request) 期望远程服务器存在并提供响应。
- [`cy.contains()`](https://docs.cypress.io/api/commands/contains) 期望具有内容的元素最终存在于 DOM 中。
- [`cy.get()`](https://docs.cypress.io/api/commands/get) 期望元素最终存在于 DOM 中。
- [`.find()`](https://docs.cypress.io/api/commands/find) 还期望元素最终存在于 DOM 中。
- [`.type()`](https://docs.cypress.io/api/commands/type)期望元素最终处于可 *键入* 状态。
- [`.click()`](https://docs.cypress.io/api/commands/click)期望元素最终处于 *可操作*  状态。
- [`.its()`](https://docs.cypress.io/api/commands/its) 期望最终找到当前主题的属性。



```js
cy.get('#header a')
  .should('have.class', 'active')
  .and('have.attr', 'href', '/users')
```





## 常见问题

1. 本地通过chrome 94版本跑测试用例，post 请求被拦截， 提示 provisional headers are shown，get 请求正常

   怀疑是请求跨域导致的，但是本地开发服务器是开了代理的，并不跨域

   在非 Cypress 启动的 Chrome 浏览器里访问测试站点，请求是正常的

   [Chrome 跨域设置](https://www.cnblogs.com/jackielyj/p/15179862.html)







资料：

[Cypress 介绍](https://www.cnblogs.com/poloyy/p/12966125.html)