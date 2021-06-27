---
title: nestjs typeorm 使用记录
date: 2021-06-05
author: czj
lang: zh-cn
tags:
  - typeorm
  - nestjs
summary: 这篇文章主要用于记录 typeorm 使用过程中的一些优缺点
---





最近在学习 nestjs 开发，数据库选择了 mysql, 加上 nestjs 官方推荐选择了 typeorm（事实上也没有更多更好的选择）



> TypeORM 是一个[ORM](https://en.wikipedia.org/wiki/Object-relational_mapping)框架，它可以运行在 NodeJS、Browser、Cordova、PhoneGap、Ionic、React Native、Expo 和 Electron 平台上，可以与 TypeScript 和 JavaScript (ES5,ES6,ES7,ES8)一起使用。 它的目标是始终支持最新的 JavaScript 特性并提供额外的特性以帮助你开发任何使用数据库的（不管是只有几张表的小型应用还是拥有多数据库的大型企业应用）应用程序。
>
> 不同于现有的所有其他 JavaScript ORM 框架，TypeORM 支持 [Active Record](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/active-record-data-mapper.md#what-is-the-active-record-pattern) 和 [Data Mapper](https://github.com/typeorm/typeorm/blob/master/docs/zh_CN/active-record-data-mapper.md#what-is-the-data-mapper-pattern) 模式，这意味着你可以以最高效的方式编写高质量的、松耦合的、可扩展的、可维护的应用程序。
>
> TypeORM 参考了很多其他优秀 ORM 的实现, 比如 [Hibernate](http://hibernate.org/orm/), [Doctrine](http://www.doctrine-project.org/) 和 [Entity Framework](https://www.asp.net/entity-framework)。



![](./images/nestjs-typeorm-01/20210608224942.jpg)

![](./images/nestjs-typeorm-01/20210608225007.jpg)

## 优点

1.  支持 typescript
2.  易于上手（简单的增删改查）



## 缺点

1.  文档不清晰，只有教程式的文档，没有完整的 Api 文档
2.  issue 积压太多
3. 复杂SQL实现麻烦（文档对于构建复杂sql基本帮不上忙）
4. 不支持软删除
5. mysql 中使用 uuid 作为主键insert时会报错(不清楚是不是个人使用姿势不对)
6. 文档中关于Tree一文中的临接表无法使用树实体，文档没有注明，容易产生误解



## 问题记录

1. 无法使用uuid 作为主键， 新增会报错

   ```typescript
   @Entity()
   export class User {
       @PrimaryGeneratedColumn("uuid")
       id: number;
   }
   ```

   

2.  leftJoinAndMapMany 中使用子查询，结果无法正确映射到属性 [issue](https://github.com/typeorm/typeorm/issues/3063), 可以使用 getRawMany 获得原始结果

