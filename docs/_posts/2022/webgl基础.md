---
title: webgl基础
date: 2022-8-17
author: czj
lang: zh-cn
tags:
summary: 创建webgl程序的基础步骤

---



[WebGL 基础概念](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-fundamentals.html)

[WebGL工作原理](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-how-it-works.html)

[WebGL 着色器和GLSL](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-shaders-and-glsl.html)



步骤

1.  获取canvas元素, webgl 上下文

   ```js
   const canvas = document.querySelector("canvas")
   const gl = canvas.getContent("webgl")
   ```

2. 创建着色器程序

   1. 创建顶点着色器

      1. 创建一个顶点着色器

         ```js
         const shader = gl.createShader(gl.VERTEX_SHADER)
         ```

      2. 创建顶点着色器程序代码

         ```js
         const source = `
         	// 一个属性值，将会从缓冲中获取数据
             attribute vec4 a_position;
             uniform vec2 u_resolution;
         
             // 所有着色器都有一个main方法
             void main() {
         
                 // 从像素坐标转换到 0.0 到 1.0
                 vec2 zeroToOne = a_position.xy / u_resolution;
         
                 // 再把 0->1 转换 0->2
                 vec2 zeroToTwo = zeroToOne * 2.0;
         
                 // 把 0->2 转换到 -1->+1 (裁剪空间)
                 vec2 clipSpace = zeroToTwo - 1.0;
         
                 gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
             }
         `
         ```

      3. 顶点着色器添加程序

         ```js
         gl.shaderSource(shader, source)
         ```

      4. 编译着色器程序

         ```js
         gl.compileShader(shader)
         ```

      5. 判断着色器程序是否编译成功，并获取编译失败信息

         ```js
         const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
         if (!success) {
             const lastError = gl.getShaderInfoLog(shader);
             console.error(`
         		*** Error compiling shader ***
         		${lastError}
         		${source.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n')}
         	`)
             gl.deleteShader(shader);
             return null;
         }
         ```

         

   2. 创建片段着色器

      1. 创建一个片段着色器

         ```js
         const shader = gl.createShader(gl.FRAGMENT_SHADER)
         ```

      2. 创建片段着色器程序代码

         ```js
         const fragementShaderSource = `
             // 片断着色器没有默认精度，所以我们需要设置一个精度
             // mediump是一个不错的默认值，代表“medium precision”（中等精度）
             precision mediump float;
         
             void main() {
             	// gl_FragColor是一个片断着色器主要设置的变量
             	gl_FragColor = vec4(0.1098, 0.38039, 0.5, 0.92156); // 返回“ 蓝色 ”
             }
         `
         ```
      
      3. 顶点着色器添加程序
      
         ```js
         gl.shaderSource(shader, source)
         ```
      
      4. 编译着色器程序
      
         ```js
         gl.compileShader(shader)
         ```
      
      5. 判断着色器程序是否编译成功，并获取编译失败信息
      
         ```js
         const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
         if (!success) {
             const lastError = gl.getShaderInfoLog(shader);
             console.error(`
         		*** Error compiling shader ***
         		${lastError}
         		${source.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n')}
         	`)
             gl.deleteShader(shader);
             return null;
         }
         ```
      
         
      
      ​    
      
   3.  创建着色器程序

   ```js
   const program = gl.createProgram()
   ```

   

   4. 着色器程序添加顶点着色器

      ```js
      gl.attachShader(program, vertexShader)
      ```

      

   5. 着色器程序添加片段着色器

      ```js
      gl.attachShader(program, fragementShader)
      ```

      

   6. 链接着色器程序

      ```js
      gl.linkProgram(program)
      ```

   7. 从着色器中获取变量在缓冲的位置

      ```js
      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
      const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
      ```

   8. 创建数据缓冲

      ```js
      const positionBuffer = gl.createBuffer()
      ```

   9. 绑定缓冲的数据源

      ```js
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      ```

   10. 创建顶点数据，写入到缓冲

       ```js
       const positions = [
           10, 20,
           80, 20,
           10, 30,
       ]
       gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
       ```

   11. 设置viewport的宽高

       ```js
       gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
       ```

   12. 清空画布

       ```js
       gl.clearColor(0, 0, 0, 0)
       gl.clear(gl.COLOR_BUFFER_BIT)
       ```

   13. 将着色器程序添加到当前的渲染状态中

       ```js
       gl.useProgram(program);
       ```

   14. 激活顶点变量数据，绑定数据，设置数据获取参数

       ```js
       // 激活顶点变量数据
       // 必须打开后才能在 着色器中获取到对应的属性变量
       gl.enableVertexAttribArray(positionAttributeLocation)
       // 给缓冲绑定数据
       gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
       // 指定gpu数据读取规则
       // void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
       // index: 数据在缓冲中的起始位置
       // size: 每次迭代读取数据的长度
       // type: 数据的类型，不同的类型数据长度不同
       // normalized: 是否对数据做归一化
       // stride: 每次迭代后移动的位置
       // offset: 从缓冲的起始位置 + offset的位置开始
       gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
       ```

   15. 绘制图形

       ```js
       // void gl.drawArrays(mode, first, count);
       // mode 指定绘制图元的方式
       // offset 绘制数据起点的偏移
       // count 绘制的次数
       var primitiveType = gl.TRIANGLES;
       var offset = 0;
       var count = 3;
       gl.drawArrays(primitiveType, offset, count);
       ```



源码

```js

// 创建shader
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

// 创建着色器程序
function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}


  // Get A WebGL context
  var canvas = document.querySelector('canvas');
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Get the strings for our GLSL shaders
  var vertexShaderSource = `
    // an attribute will receive data from a buffer
    attribute vec4 a_position;

    // all shaders have a main function
    void main() {

        // gl_Position is a special variable a vertex shader
        // is responsible for setting
        gl_Position = a_position;
    }
  `;
  var fragmentShaderSource = `
    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default
    precision mediump float;

    void main() {
        // gl_FragColor is a special variable a fragment shader
        // is responsible for setting
        gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
    }
  `;

  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [
    0, 0,
    0, 0.5,
    1, 0,
    0, 0,
    0, -0.5,
    -0.5, 0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // code above this line is initialization code.
  // code below this line is rendering code.

  // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);

```

