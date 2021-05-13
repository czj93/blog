---
title: TypeScript装饰器介绍
date: 2021-05-12
author: czj
tags:
  - ts
  - decorator
summary: 关于 typescript 中装饰器原理及使用
---

装饰器（Decorator）ES7中的新特性。可以用于修饰 `类`，`方法`，`属性`，`参数`。

给类添加属性、方法。



## 安装Typescript

使用 npm 安装 typescript

```shell
npm install -g typescript
```

安装成功后就可以编写ts代码了

```shell
# 装饰器是一项实验性特性，需要添加配置开启支持
# 将 index.ts 编译成 ES5 代码
tsc --target ES5 --experimentalDecorators index.ts
```



## 使用装饰器

### 1. Class 上使用

这是 typescipt 中类装饰器的声明

```typescript
declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
```

js 中的 class 只是一个语法糖，类装饰器接收的参数是一个构造函数，并返回一个构造函数。

```typescript
// index.ts
// 声明 hello 函数
function hello(target) {
  // 给原型添加 hello 方法  
  target.prototype.hello = function () {
    console.log('hello!')
  }
}

// 声明一个Person类，并添加 hello 装饰器
@hello
class Person {
  constructor () {}
}

const man: any = new Person()
man.hello()  // hello!
```

编译index.ts

```shell
tsc --target ES5 --experimentalDecorators index.ts
```

没有报错即编译成功，同级目录下将会生成index.js



以下就是编译后的 index.js

```js
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Person = /** @class */ (function () {
    function Person() {
    }
    Person = __decorate([
        say
    ], Person);
    return Person;
}());
function say(target) {
    target.prototype.hello = function () {
        console.log('hello!');
    };
}
var man = new Person();
man.hello();

```

可以把该文件分为两部分，一部分是 tsc 编译后额外添加的代码，另一部分是自己写的编译成ES5的代码

我们将编译器添加的代码格式化后可以得到

```js
// 声明了 __decorate
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
    r = Reflect.decorate(decorators, target, key, desc);
  } else {
    // 遍历传入的装饰器
    for (var i = decorators.length - 1; i >= 0; i--) {
      if (d = decorators[i]) {
        // 传值并执行装饰器函数
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      }
    }
  }
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
```

简单的说__decorate就是用执行装饰器函数

```js
var Person = /** @class */ (function () {
    function Person() {
    }
    Person = __decorate([
        say
    ], Person);
    return Person;
}());
function say(target) {
    target.prototype.hello = function () {
        console.log('hello!');
    };
}
var man = new Person();
man.hello();

// 可以等价为

var Person = /** @class */ (function () {
    function Person() {
    }
    say(Person)
    return Person;
}());
```



未完待续....