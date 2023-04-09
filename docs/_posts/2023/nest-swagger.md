---
title: NestJS中Swagger的使用
date: 2023-4-9
author: czj
lang: zh-cn
tags:
  - NestJS
summary: 介绍NestJS中Swagger的使用，以及自定义响应装饰器

---

## 自定义Swagger 响应装饰器

    由于 NestJS 中 control 的响应经过拦截器统一处理了格式，Swagger 无法推导出正确的响应类型，需要通过自定义装饰器来生成正确的响应类型

接口响应类型如下：

```ts

interface HttpResultPaginate<T> {
  data: T[];
  pagination: {
    total: number;
    current: number;
    totalPage: number;
    pageSize: number;
  };
}

interface HttResponse<T> {
    code: number;
    success: boolean,
    result:  T | HttpResultPaginate<T>;
}

```

```ts
// @app/common/dto/resultDto.ts
import { ApiProperty } from '@nestjs/swagger';
import { HttpResponse } from '@app/interfaces/http.interface';

export class ResultDto<T> {
  @ApiProperty({
    description: '请求成功失败',
  })
  success: boolean;

  @ApiProperty({
    description: '错误提示',
  })
  message: string;

  @ApiProperty({
    description: '接口响应结果',
  })
  result: HttpResponse<T>;

  @ApiProperty({
    description: '错误堆栈信息',
  })
  debug?: string;
}

```

```ts
// @app/common/dto/PaginationDto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: '总数',
  })
  total: number;

  @ApiProperty({
    description: '当前页数',
  })
  current: number;

  @ApiProperty({
    description: '总页数',
  })
  totalPage: number;

  @ApiProperty({
    description: '每页数量',
  })
  pageSize: number;
}

```

```ts

import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResultDto } from '@app/common/dto/resultDto';
import { PaginationDto } from '@app/common/dto/PaginationDto';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { createMixedDecorator } from '@nestjs/swagger/dist/decorators/helpers';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    createMixedDecorator(DECORATORS.API_EXTRA_MODELS, [
      ResultDto,
      PaginationDto,
    ]),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResultDto) },
          {
            properties: {
              result: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                  pagination: {
                    type: 'object',
                    $ref: getSchemaPath(PaginationDto),
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

```


## 问题

### 使用 getSchemaPath 出现 Could not resolve reference 报错

```ts
@Get('list')
@ApiOperation({
    summary: '用户列表',
})
@ApiExtraModels(ResultDto, PaginationDato)
@ApiPaginatedResponse(UserEntity)
async userList(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
) {
    return this.service.findList(page, pageSize);
}
```

先通过 `ApiExtraModels` 引入 `ApiPaginatedResponse` 中使用的到对象，生成`Swagger`即不会报错

上面的例子中也可以直接在自定义装饰器中主动引入相关对象

```ts
createMixedDecorator(DECORATORS.API_EXTRA_MODELS, [
    ResultDto,
    PaginationDto,
])
```

### 自定义响应 JSON Schema 格式时，定义了基础类型格式时，使用 quicktype-core 自定生成类型时报错 Trying to make an empty union - do you have an impossible type in your schema?

```ts

ApiOkResponse({
    schema: {
        allOf: [
            { $ref: getSchemaPath(ResultDto) },
            {
                properties: {
                    result: {
                        type: 'string'
                        // $ref: getSchemaPath(model),
                    },
                },
            },
        ],
    },
}),

```

暂时找不到解决办法

参考资料
- https://github.com/midwayjs/midway/issues/1847
- https://github.com/nestjs/swagger/issues/480
- [JSON Schema 基础](https://juejin.cn/post/7209698674905350205)
- [OpenAPI 规范](https://openapi.apifox.cn/)
- https://www.jianshu.com/p/1711f2f24dcf