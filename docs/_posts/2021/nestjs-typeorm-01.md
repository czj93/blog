---
title: nestjs typeorm 使用记录
date: 2021-06-05
author: czj
lang: zh-cn
tags:
  - typeorm
  - nestjs
summary: 这篇文章主要用于记录 typeorm 使用过程中的各种坑及吐槽....
---





最近在学习 nestjs 开发，数据库选择了 mysql, 加上 nestjs 官方推荐选择了 typeorm（事实上也没有更多更好的选择）



> TypeORM 是一个[ORM](https://en.wikipedia.org/wiki/Object-relational_mapping)框架，它可以运行在 NodeJS、Browser、Cordova、PhoneGap、Ionic、React Native、Expo 和 Electron 平台上，可以与 TypeScript 和 JavaScript (ES5,ES6,ES7,ES8)一起使用。 它的目标是始终支持最新的 JavaScript 特性并提供额外的特性以帮助你开发任何使用数据库的（不管是只有几张表的小型应用还是拥有多数据库的大型企业应用）应用程序。
>
> 不同于现有的所有其他 JavaScript ORM 框架，TypeORM 支持 [Active Record](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/active-record-data-mapper.md#what-is-the-active-record-pattern) 和 [Data Mapper](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/active-record-data-mapper.md#what-is-the-data-mapper-pattern) 模式，这意味着你可以以最高效的方式编写高质量的、松耦合的、可扩展的、可维护的应用程序。
>
> TypeORM 参考了很多其他优秀 ORM 的实现, 比如 [Hibernate](http://hibernate.org/orm/), [Doctrine](http://www.doctrine-project.org/) 和 [Entity Framework](https://www.asp.net/entity-framework)。



![](D:\blog\docs\_posts\2021\images\nestjs-typeorm-01\20210608224942.jpg)

![](D:\blog\docs\_posts\2021\images\nestjs-typeorm-01\20210608225007.jpg)



## 1.关于文档

[Typeorm官方文档]: https://typeorm.io/#/

在我看来 Typeorm 的文档是阻碍我升入使用的最大障碍。

Typeorm 的文档类似与一个 Tutorial，介绍了 Typeorm 中的一些的概念，以及一些常规的使用方法。

其他很多开框架也都有类似的文档。但是 Typeorm 只有这个，没有其他的了。

Tutorial 并不能覆盖开发中的所有问题。也无法详细的描述 Typeorm 所支持的 Api 及 参数。

Typeorm 中多对 api 的使用仅仅只有一个示例。



文档不够全面是一方面，文档并不是那么准确。

#### 关于树实体文档

[文档]: https://typeorm.io/#/tree-entities

这部分介绍了 Typeorm 中支持的 4 种树结构，末尾介绍了树实体的使用。

邻接表也包含在这部分中，然而照着文档去实现邻接表树，结果却是报错。

经过一翻查找，原来 Tree 实体并不支持邻接表，当是文档中并没有注明。

[issue]: https://github.com/typeorm/typeorm/issues/2540

Github 的 issue 中也有人有相同的问题，但是文档却一直没有改进。。。。



#### leftJoinAndMapOne

看文档我还以为，没有通过 `Typeorm` 建立关联关系的的实体也能通过 `leftJoinAndMapOne` 联查。

事实是，你不能。可以查询，但是结果并不能生成我们想要的实体结构。

通过 `getRawMany` `getRawOne` 接口能获取到数据，但并不是我们想要的 实体结构，使用并不方便，使用 orm 的意义也就不存在了。





到目前为止，为了实现一个评论功能，在 typeorm 这一关上卡了好久，问题不断 无处可查（只能是个人水平太差了），国内相关的资料也很少，官方文档就更指望不上了，查找 Issue 还有一些希望。