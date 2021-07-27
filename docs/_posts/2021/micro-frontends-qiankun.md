---
title: 乾坤（qiankun）微前端实践
date: 2021-07-27
author: czj
lang: zh-cn
tags:
  - micro
summary: 
---





最近公司有个需求需要整合多个独立的项目，这几个项目虽然都是`Vue`技术栈的，但是为了减少工作量，更好的用户体验，决定采用微前端技术架构。



## 快速上手

以下的内容都是基于 `Vue` 技术栈

### 1. 创建主应用

#### 1. 创建主应用

主应用是各个子应用的入口、基座。

本项目采用 [vue-admin-template](http://panjiachen.github.io/vue-admin-template) 创建



#### 2. 安装乾坤

```sh
npm install --save qiankun
```



#### 3.注册子应用

```js
import { registerMicroApps, start } from 'qiankun';


registerMicroApps([
  {
    name: 'app1',
    entry: 'http://localhost:8082',
    container: '#container',
    activeRule: '/app1',
  },
  {
    name: 'app2',
    entry: 'http://localhost:8083',
    container: '#container',
    activeRule: '/app2',
  }
])

start({ sandbox: true })
```



#### 4. 修改配置

```js
// vue.config.js

const assetsCDN = {
  // webpack build externals
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios',
    elementui: 'element-ui',
    qiankun: 'qiankun',
  },
  css: [
    'https://unpkg.com/element-ui/lib/theme-chalk/index.css"'
  ],
  js: [
    'https://unpkg.com/vue@2.6.10/dist/vue.min.js',
    'https://unpkg.com/vuex@2.5.0/dist/vuex.min.js',
    'https://unpkg.com/vue-router@2.8.1/dist/vue-router.min.js',
    'https://unpkg.com/axios@0.21.1/dist/axios.min.js',
    'https://unpkg.com/element-ui/lib/index.js',
    'https://unpkg.com/qiankun@2.4.3/dist/index.umd.min.js'
  ]
}

module.exports = {
	configureWebpack: {
		externals: assetsCDN.externals,
	},
	chainWebpack(config) {
		config.plugin('html').tap(args => {
            args[0].cdn = assetsCDN
            return args
        })
	}
}

```



#### 5.引入CDN资源

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title><%= webpackConfig.name %></title>
 	// 引入CSS
    <!-- require cdn assets css -->
    <% for (var i in htmlWebpackPlugin.options.cdn && htmlWebpackPlugin.options.cdn.css) { %><link rel="stylesheet" href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" /><% } %>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but <%= webpackConfig.name %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- require cdn assets js -->
    <% for (var i in htmlWebpackPlugin.options.cdn && htmlWebpackPlugin.options.cdn.js) { %><script type="text/javascript" src="<%= htmlWebpackPlugin.options.cdn.js[i] %>"></script>
    <% } %>
    <!-- built files will be auto injected -->
  </body>
</html>

```

#### 6. 添加子应用容器

```vue
// /layout/components/AppMain.vue
<template>
  <section class="app-main">
    <router-view :key="key" />
    <div id="container"></div>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.path
    }
  }
}
</script>
```



#### 7.修改APP

```vue
// /src/App.vue
<template>
  <div id="app">
    <Layout />
  </div>
</template>

<script>
import Layout from '@/layout'
export default {
  name: 'App',
  components: {
    Layout
  }
}
</script>
```



### 2.改造子应用

#### 1. 修改入口文件、导出生命周期钩子

```js
// /src/public-path

// 修改子应用资源加载路径
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

// /src/main.js
import './public-path'

// 省略代码....
let instance = null

function render(props = {}) {
  const { container } = props

  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 非微前端方案时 直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('[vue] app2 bootstraped');
}
export async function mount(props) {
  console.log('[vue] app2 props from main framework');
  render(props);
}
export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
  console.log('app2 unmount')
}
```

#### 2.添加微前端模式布局

移除侧边栏、顶栏

```vue
// src/layout/MicroLayout.vue

<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <div class="main-container">
      <app-main />
    </div>
  </div>
</template>

<script>
import { AppMain } from './components'
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'MicroLayout',
  components: {
    AppMain
  },
  mixins: [ResizeMixin],
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
    classObj() {
      return {
        hideSidebar: true,
        openSidebar: false,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: true
      }
    }
  }
}
</script>
// 省略代码....

```



### 3.路由修改

1. 根据环境选择布局
2. 修改子应用的基础路径

```js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import MicroLayout from '@/layout/MicroLayout'

// 根据环境选择布局
const AppLayout = window.__POWERED_BY_QIANKUN__ ? MicroLayout : Layout

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  base: window.__POWERED_BY_QIANKUN__ ? '/app2' : '/',
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
```



#### 4.打包配置修改

1. 修改打包模式
2. 忽略公共依赖
3. 开发服务器支持CROS

```js
// 省略无关代码.....
const packageName = require('./package.json').name

const assetsCDN = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios',
    'elementui': 'element-ui',
    qiankun: 'qiankun',
  }
}

module.exports = {
  devServer: {
    // 静态资源支持 CROS
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  configureWebpack: {
    // 修改打包模式为 umd
    output: {
      libraryTarget: 'umd',
      library: `${packageName}-[name]`,
      jsonpFunction: `webpackJsonp_${packageName}`
    },
    // 忽略公共依赖
    externals: assetsCDN.externals,
  },
  chainWebpack(config) {

	// 省略代码.....
  }
}
```



## 乾坤（乾坤）原理解析

// todo





- [基于 qiankun 的微前端最佳实践（万字长文） - 从 0 到 1 篇](https://segmentfault.com/a/1190000022631614)
- [基于 qiankun 的微前端最佳实践（图文并茂） - 应用间通信篇](https://segmentfault.com/a/1190000022583716)
- [万字长文+图文并茂+全面解析微前端框架 qiankun 源码 - qiankun 篇](https://segmentfault.com/a/1190000022275991)
- [微前端之import-html-entry](https://blog.csdn.net/daihaoxin/article/details/106250617)