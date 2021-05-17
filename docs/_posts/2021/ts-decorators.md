---
title: TypeScript装饰器介绍
date: 2021-05-12
author: czj
tags:
  - ts
  - decorator
summary: 关于 typescript 中装饰器原理及使用
---

装饰器（Decorator）ES7中的新特性。它是一种特殊类型的声明，可以用于修饰 `类`，`方法`，`属性`，`参数`，

给类添加属性、方法，修改行为。使用 **@expression** 。 expression 求职后必须是一个函数，会在运行时被调用。

```js
@get('/update')
update() {
	// ...
}

@delete
delete () {
    // ...
}

// 添加多个装饰器
@get()
@xxx
list() {
    
}
```





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

### 2. 属性装饰器

```typescript
declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
```

属性装饰器有两个参数：

	1. 对于静态成员来说是类的构造器，实例成员是类的原型对象
 	2. 属性名



设置默认值

```typescript
function defaultValue(value) {
    return function (tareget, prop) {
        tareget[prop] = value;
    };
}

class Person {
  @defaultValue(18)
  age: number;
  constructor (age: number) {
    if (age) {
      this.age = age
    }
  }
}

const man1: any = new Person()
const man2: any = new Person(28)

console.log(man1.age) // 18
console.log(man12.age) // 23
```



### 3. 方法装饰器

```typescript
declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
```

入参：

	1. 对于静态成员是类的构造函数， 对于实例成员是类的原型对象
 	2. 函数名
 	3. 该函数的属性描述符



方法装饰器可以用于实现 AOP 编程

```typescript
function log (target: Object, prop: string, desc: PropertyDescriptor) {
  const method = desc.value
  desc.value = function (...args: Array<any>) {
    console.log(`${prop} 执行之前 `)
    const value = method.apply(this, args)
    console.log(`${prop} 执行之后 `)
    console.log(`${prop} 的返回值 ${value} `)
    return value
  }
}

class Person {
  age: number;
  constructor (age: number) {
    if (age) {
      this.age = age
    }
  }

  @log
  getAge(): number {
    console.log('get age')
    return this.age
  }
}

const man: Person = new Person(23)

console.log(man.getAge())
// getAge 执行之前
// get age
// getAge 执行之后
// getAge 的返回值 23
// 23
```



### 4. 参数装饰器

参数装饰器会在函数申明后被调用（并不是在函数执行时，更不是执行前）

```typescript
declare type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
```

参数

	1. 对于静态成员来说是类的构造函数，实例成员是类的原型对象
 	2. 参数名
 	3. 参数在函数参数列表的索引



```typescript
function isNull (target: Object, prop: string, index: number) {
  console.log('is null function')
}

class Person {
  age: number;

  setAge(@isNull age: number) {
    console.log('set age')
    this.age = age
  }
}
console.log('before new Person')
const man: any = new Person()

console.log('before console man name')
console.log(man.name)
// is null function 
// before new Person
// before console man name
// set age
```



## 装饰器的执行顺序

当一个类上同时存在多种装饰器，多个装饰器加在同一个目标上时，它们的执行顺序是







```typescript
function classDecorator (index): ClassDecorator {
  return function (taregt) {
    console.log('class decorator ' + index)
  }
}


function methodDecorator (index: number): MethodDecorator {
  return function (taregt, prop: string, desc: PropertyDescriptor) {
    console.log('method decorator ' + index)
  }
}

function proppertyDecorator (index: number) {
  return function (target, prop: string) {
    console.log(`propperty decorator ${index}`)
  }
}

function paramDecorator(index: number) {
  return function (target, methodName: string, paramIndex: number) {
    console.log(`parameter decorator ${index}`)
  }
}



@classDecorator(2)
@classDecorator(1)
class Test {

  @proppertyDecorator(2)
  @proppertyDecorator(1)
  age: number;

  @methodDecorator(2)
  @methodDecorator(1)
  hello (@paramDecorator(1) str: string, @paramDecorator(2) index: number) {

  }
}


// propperty decorator 1    
// propperty decorator 2    
// parameter decorator 2    
// parameter decorator 1    
// method decorator 1       
// method decorator 2       
// class decorator 1        
// class decorator 2
```



由此可见：

	1. 属性装饰器 > 参数装饰器 > 函数装饰器 > 类装饰器
 	2. 同一个目标同时有多个装饰器时，从下往上执行