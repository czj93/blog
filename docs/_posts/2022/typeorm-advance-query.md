---
title: Typeorm查询操作注意事项
date: 2022-2-28
author: czj
lang: zh-cn
tags:
  - Mysql
  - Typeorm
summary: Typeorm联表查询、及相关注意事项
---

### 联表查询没有关联的实体

两个实体间如果不通过 `OneToOne`， `ManyToOne`， `OneToMany` 建立关联关系，可以通过  `leftJoinAndSelect`，`leftJoinAndMapOne` 实现连表查询



#### leftJoinAndMapOne

​	联查出来的实体添加到目标对象的指定属性上

​	可以使用 `getManyAndCount()`，`getMany()`，`getOne()` 获取转化后的实体结果



#### leftJoinAndSelect

​	联查出来的结果直接添加到结果中

​	无法使用 `getManyAndCount()`，`getMany()`，`getOne()` 获取转化后的实体结果，因为查的结果没有对应的实体

​	只能使用 `getRawMany()`，`getRawOne()` 获取原始结果

​	可以通过 `select` 选择指定的字段并重命名



### Select

> 创建 SELECT 查询并选择给定的数据。 如果存在，则替换所有先前的选择。

如果有多个列表要添加可以通过 `select` 一次性添加多个，或者 `addSelect` 逐个添加



```js
import { ShopEntity } from '@app/modules/shop/entities/shop.entity';

await this.orderGoodsRepository
      .createQueryBuilder('orderGoods')
      .leftJoinAndSelect(ShopEntity, 'shop', 'orderGoods.shopId = shop.id')
      .select('orderGoods.shopId', 'shopId')
      .addSelect(
        `
        SUM(orderGoods.number) as totalNumber,
        SUM(orderGoods.unitPrice) as totalAmount,
        (SUM((orderGoods.unitPrice - orderGoods.purchasePrice) * orderGoods.number)) as totalNetProfit
      `,
      )
      .addSelect('shop.shopName', 'shopName')
      .orderBy('totalAmount', 'DESC')
      .groupBy('orderGoods.shopId')
      .printSql()
      .getRawMany()
```



### 如何查询指定日期范围

https://segmentfault.com/q/1010000039847499/a-1020000039851225

`Typeorm` 中的 `Between` 函数不支持时间类型

```js
import { Repository, Between } from 'typeorm';

// 查询2022-2月份的销售金额、销售数量
await this.orderGoodsRepository
      .createQueryBuilder('orderGoods')
      .select('SUM(orderGoods.number)', 'totalNumber')
      .addSelect('SUM(orderGoods.unitPrice)', 'totalAmount')
      .addSelect(
        'SUM((orderGoods.unitPrice - orderGoods.purchasePrice) * orderGoods.number)',
        'totalNetProfit',
      )
      .where(
        'DATE(orderGoods.orderTime)',
        Between('2022-2-1', '2022-2-28'),
      )
      .printSql()
      .getRawOne();
```



改为

```js

await this.orderGoodsRepository
      .createQueryBuilder('orderGoods')
      .select('SUM(orderGoods.number)', 'totalNumber')
      .addSelect('SUM(orderGoods.unitPrice)', 'totalAmount')
      .addSelect(
        'SUM((orderGoods.unitPrice - orderGoods.purchasePrice) * orderGoods.number)',
        'totalNetProfit',
      )
      .where(
        'orderGoods.orderTime Between :start AND :end',
    	{
            start: '2022-2-1',
            end: '2022-2-28'
        }
      )
      .printSql()
      .getRawOne();
```



资料：

- [[typeorm查询两个没有关联关系的实体](https://www.cnblogs.com/zzk96/p/11397223.html)](https://www.cnblogs.com/zzk96/p/11397223.html)

