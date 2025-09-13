---
title: HTML 和 CSS
---

## 介绍一下一般页面布局的 DOM 结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>标准页面布局</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="header">
    <div class="logo">Logo</div>
    <nav class="nav">
      <a href="#">首页</a>
      <a href="#">关于</a>
      <a href="#">联系</a>
    </nav>
  </header>

  <main class="main">
    <aside class="sidebar">
      <ul>
        <li><a href="#">菜单 1</a></li>
        <li><a href="#">菜单 2</a></li>
      </ul>
    </aside>

    <section class="content">
      <h1>页面标题</h1>
      <p>这里是主要内容区域。</p>
    </section>
  </main>

  <footer class="footer">
    <p>&copy; 2025 我的公司</p>
  </footer>
</body>
</html>
```

## 介绍一下 Doctype

Doctype 是一个文档类型声明。它位于 HTML 文档的最顶部，其核心作用是告诉浏览器当前文档应该使用哪种 HTML 或 XHTML 规范来解析和渲染，以确保页面在不同浏览器中都能以一致的方式正确显示。过去，这个声明可以非常复杂，而从 HTML5 开始，只需要使用 `<!DOCTYPE html>` 就行了。

## 介绍一下 `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

这行代码是**移动端 Web 开发的基石**。它通过告诉浏览器‘这个页面是为移动设备优化的，请将视口的宽度设置为设备的理想宽度，并且初始不要缩放’，从而确保网页在手机和平板上能够正确渲染，而不是显示成缩小版的桌面站点。

在早期，移动浏览器（如 iPhone 的 Safari）默认会将视口宽度设置为一个较大的值（如 980px），然后在一个小屏幕上整体渲染一个桌面版页面，导致文字非常小，用户需要手动缩放才能阅读。`width=device-width` 指令**覆盖了这个默认行为**。它命令浏览器：“请将布局视口（layout viewport）的宽度设置为设备独立像素的宽度（比如 iPhone 13 是 390px）”，而不是一个假设的桌面宽度。这样，我们的流体布局和媒体查询就能基于真实的设备宽度来正确工作。

`initial-scale=1.0` 将**初始缩放级别设置为 100%，即不缩放**。它确保了 CSS 像素与设备独立像素的比例为 1:1，使得页面在加载时就能以预期的尺寸和比例呈现。


## HTML 文件中如何导入 CSS、JS？

### 一、导入 CSS

1. 外部样式表（最推荐）
   放在 `<head>` 内，可缓存、可并行加载
   ```html
   <!-- 标准写法 -->
   <link rel="stylesheet" href="css/main.css">

   <!-- 预加载字体或关键 CSS -->
   <link rel="preload" href="css/critical.css" as="style" onload="this.rel='stylesheet'">
   ```

2. 内嵌样式表（小量关键样式，避免请求）
   ```html
   <style>
     :root{ --brand:#ff6b6b; }
     body{ margin:0; font-family:system-ui,sans-serif; }
   </style>
   ```

3. 行内样式（仅测试或邮件模板，不推荐生产）
   ```html
   <h1 style="color:var(--brand);">Hello</h1>
   ```

### 二、导入 JavaScript

1. 外部模块脚本（ESM，现代浏览器首选）
   ```html
   <!-- 放在 <head> 也无需 defer，type="module" 自动 deferred -->
   <script type="module" src="js/app.js"></script>
   ```

2. 外部普通脚本（兼容旧浏览器）
   ```html
   <!-- 加 defer 不阻塞 HTML 解析，执行顺序按出现先后 -->
   <script defer src="js/vendor.js"></script>
   <script defer src="js/main.js"></script>

   <!-- 无需兼容 IE11 可直接写 <script> 放底部 -->
   ```

3. 内联脚本（小量配置或性能打点）
   ```html
   <script>
     console.time('page');
     window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};
   </script>
   ```

4. 动态导入（代码分割、按需加载）
   ```html
   <script type="module">
     import('./js/dialog.js').then(m => m.open());
   </script>
   ```

### 三、常见坑 & 技巧

- CSS 放 `<head>`，防止“无样式闪烁”（FOUC）。
- JS 默认阻塞解析；加 `defer` 或 `type="module"` 可解。
- 同时支持 ESM 与旧浏览器：
  ```html
  <script type="module" src="js/app.mjs"></script>
  <script nomodule src="js/app-legacy.js"></script>
  ```
- 跨域资源加 `crossorigin`，错误日志更精准：
  ```html
  <link rel="stylesheet" href="https://cdn.example.com/style.css" crossorigin="anonymous">
  <script src="https://cdn.example.com/lib.js" crossorigin="anonymous"></script>
  ```

## 什么是 CSS 渲染阻塞？

CSS 渲染阻塞是指**浏览器为了避免给用户展示未经样式修饰的内容（Flash of Unstyled Content, FOUC），而暂停构建渲染树和渲染页面，直到所需的 CSS 文件下载并解析完成的行为**。这会导致页面的首次渲染时间延迟。

浏览器构建页面的关键步骤是：构建 DOM 树 -> 构建 CSSOM 树 -> 将两者合并成渲染树 -> 布局 -> 绘制。CSSOM 的构建是渲染树构建的前提。因为渲染树需要同时包含 DOM 和 CSSOM 的信息来计算每个节点的最终样式。当浏览器在解析 HTML 时遇到一个 `<link rel="stylesheet">` 标签，它会暂停 DOM 树的构建（尽管 DOM 解析可能仍在继续），去下载并解析这个 CSS 文件，并构建 CSSOM 树。只有在 CSSOM 构建完成后，浏览器才会继续构建渲染树并进行后续的布局和绘制操作。这个‘暂停等待’的过程就是所谓的‘渲染阻塞’。

## 如何减少 CSS 渲染阻塞带来的影响？

1. **优化 CSS 资源本身**：
    - **精简 CSS（Minification）**：移除不必要的空格、注释等，减少文件体积。
    - **压缩（Gzip/Brotli）**：在服务器端开启压缩，进一步减少传输体积。
    - **移除未使用的 CSS**：利用 PurgeCSS 等工具删除代码中未使用的样式。
2. **优化 CSS 的加载方式**：
    - **将 CSS 放在`<head>`中**：尽早发现并加载 CSS 资源，这是最重要的实践。
    - **避免使用`@import`**：`@import`会在 CSS 文件中才发起请求，会显著增加阻塞时间。应使用多个`<link>`标签代替。
    - **使用媒体查询（Media Queries）**：对某些 CSS 资源标记`media`属性，浏览器会优先处理匹配当前环境的 CSS，而将不匹配的（如`media="print"`）标记为低优先级，**从而避免它们阻塞渲染**。

      ```html
      <link href="style.css" rel="stylesheet">
      <link href="print.css" rel="stylesheet" media="print"> <!-- 不阻塞渲染 -->
      <link href="portrait.css" rel="stylesheet" media="orientation:portrait"> <!-- 条件阻塞 -->
      ```

3. **高级优化**：
    - **内联关键 CSS（Critical CSS）**：将首屏内容所需的关键样式直接内嵌到 HTML 的`<style>`标签中，这样浏览器就无需等待外部 CSS 文件即可开始渲染首屏，极大地减少阻塞时间。剩余的非关键 CSS 可以异步加载。
    - **异步加载 CSS**：通过 JavaScript 动态添加`<link>`标签，或使用`preload`等资源提示来更精细地控制加载行为。

## 什么是 FOUC

**FOUC** 是 **Flash of Unstyled Content** 的首字母缩写，中文翻译为 **“无样式内容闪烁”**。

它指的是在网页加载过程中，用户会短暂地看到未经 CSS 样式修饰的原始 HTML 内容（通常是纯文字、链接和按钮，布局混乱），然后页面才突然闪烁一下，应用上正确的样式，恢复正常显示。

这种现象非常影响用户体验，因为它会给人一种页面加载缓慢、不专业或者出了 bug 的感觉。

### 为什么会发生 FOUC？

FOUC 的产生与**浏览器渲染页面的机制**密切相关。其根本原因在于：**CSS 样式表没有在 HTML 内容加载和解析的同时或之前被及时加载和应用**。

具体来说，浏览器的渲染步骤大致如下：
1.  解析 HTML，构建 DOM（文档对象模型）树。
2.  解析 CSS，构建 CSSOM（CSS 对象模型）树。
3.  将 DOM 和 CSSOM 结合，生成渲染树（Render Tree）。
4.  根据渲染树进行布局（Layout），计算每个节点的位置和大小。
5.  将布局后的节点绘制（Paint）到屏幕上。

FOUC 就发生在第 2 步和第 5 步之间。如果 CSS 加载被阻塞或延迟，浏览器会先显示原始的 HTML（步骤 1），等 CSS 终于加载完成后，再重新计算样式、布局并绘制，这就导致了内容的“闪烁”。

#### 常见的具体原因包括：

1.  **使用 `@import` 引入 CSS**：`@import` 规则引入的样式表只有在宿主 CSS 文件被下载和解析后才会被发现和加载，这显著延迟了样式应用的时机。
2.  **将 CSS 放在文档底部**：按照 HTML 的解析顺序，如果 `<link>` 标签被放在 `<body>` 的末尾而不是 `<head>` 中，浏览器会先渲染所有已解析的 HTML，最后才看到并加载 CSS。
3.  **JavaScript 阻塞渲染**：浏览器在解析到 `<script>` 标签时会暂停 HTML 的解析（除非标记为 `async` 或 `defer`），先去下载和执行 JavaScript。如果 JavaScript 试图操作尚未加载的样式，或者只是阻塞了 DOM 构建，也会导致渲染延迟。
4.  **旧版本 IE 的特定行为**：Internet Explorer（特别是 IE6/7/8 等旧版本）有一个特殊的行为：如果页面中的某个脚本试图访问某些尚未被加载的元素的样式属性，IE 会先渲染整个页面以确保脚本能获取到正确的值，等所有资源加载完后再重新渲染。这个机制是导致 IE 下 FOUC 的一个著名原因。

### 如何避免和修复 FOUC？

解决 FOUC 的核心思路就是：**确保 CSS 尽可能早地被加载和解析**。

以下是几种有效的方法：

1.  **将 CSS `<link>` 标签放在 `<head>` 中**
    这是最简单也是最重要的方法。让浏览器在解析 HTML 内容 body 之前就先发现并开始加载 CSS。

2.  **避免使用 `@import`**
    使用 `<link>` 标签来链接外部样式表，而不是在 CSS 文件中使用 `@import`。因为 `<link>` 是并行加载的，而 `@import` 是串行的，会拖慢整体加载速度。

3.  **使用 `media` 属性**
    对于非首屏关键 CSS（如打印样式），可以给 `<link>` 标签加上 `media="print"` 等属性。浏览器会以低优先级加载这些样式表，从而避免阻塞关键渲染路径。

4.  **内联关键 CSS (Critical CSS)**
    将首屏内容所必需的关键 CSS 代码直接内嵌到 `<head>` 的 `<style>` 标签中。这样可以确保浏览器无需等待外部 CSS 文件下载，就能立即渲染出带有基本样式的首屏内容。非关键 CSS 可以异步加载。

5.  **用 JavaScript 动态加载 CSS 时隐藏内容**
    在一些特殊情况下（如使用 JavaScript 框架），如果必须异步加载 CSS，可以在加载完成前先使用 JavaScript 将 body 隐藏（例如 `<body style="visibility: hidden;">`），等 CSS 加载完毕后再显示出来。但这种方法要谨慎使用，如果 JavaScript 执行失败，页面可能永远无法显示。

## 介绍一下在 HTML 中导入 JS 时，async 和 defer 的作用

- **默认（无 `async` 和 `defer`）**：阻塞 DOM 的构建，接受完成后就执行（所以要把 `<script>` 到 `<body>` 的末尾，即紧挨着 `</body>` 之前，而不是 `<head>` 中）
- **`async`** ：不阻塞，接受完成就执行（不管文件中的书写顺序），一般独立的脚本就用这个（例如 Google Analysis）
- **`defer`**：不阻塞，确保 DOM 已经加载之后再执行，尊重文件中的声明顺序

## 介绍一下常用的 HTML 元素

- **块级元素**（默认独占一行）
  - `div` —— 通用盒子
  - `p` —— 段落
  - `h1...h6` —— 标题
  - `ul / ol / li` —— 列表
  - `section / header / footer` —— 语义区段

- **行内元素**（默认同行排列）
  - `span` —— 通用小段
  - `a` —— 链接
  - `img` —— 图片
  - `strong / em` —— 加粗/强调
  - `input / label` —— 表单控件

可参考：

- [行级内容 - MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Inline-level_content)
- [块级内容 - MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Block-level_content)

## 介绍一下 BFC、IFC、GFC、FFC

- **BFC（Block Formatting Context，块格式化上下文）** 是一个独立的布局环境，块级元素（如 `div`）在其中垂直排列，独占一行。通过 `overflow: hidden`、`float` 或 `display: flow-root` 等方式触发（注意 `display` 的默认值是 `block`，但并不足以触发 BFC），能*包裹浮动元素*、*阻止外边距合并*，常用于解决父元素高度塌陷问题。
- **IFC（Inline Formatting Context，内联格式化上下文）** 负责**内联元素**（如文本、`span`）的水平排列和换行，默认由块级容器生成。它控制文本对齐（如 `vertical-align`）、行高和换行逻辑，适合图文混排场景。
- **GFC（Grid Formatting Context，网格格式化上下文）** 通过 `display: grid` 触发，提供*二维网格布局*能力，可定义行列结构（如 `grid-template-columns`），适合复杂的响应式页面设计，例如仪表盘布局。
- **FFC（Flex Formatting Context，弹性格式化上下文）** 通过 `display: flex` 触发，以*一维弹性布局*为核心，支持子元素的灵活伸缩（`flex-grow`）和对齐（`justify-content`），常用于导航栏、按钮组等需要动态分配空间的场景。

## 父元素高度坍塌问题是什么？解决方案有哪些？

在 **子元素浮动或绝对定位** 时，父元素无法正确计算自身高度，表现为高度变为 0，即“消失”或“坍塌”。解决方案是触发**BFC（块格式化上下文）**，使父元素重新计算高度。常用方法有：

- 设置 `overflow: hidden` 或 `overflow: auto`：触发 BFC，包裹浮动元素，但可能隐藏溢出内容。
- 使用 `display: flow-root`：触发 BFC，包裹浮动元素，兼容性较好。

## 介绍一下 CSS “盒模型”

**盒模型（Box Model）**：在网页布局中，每一个元素（无论是块级元素还是内联元素）都可以被看作是一个矩形的“盒子”。这个盒子由内到外依次由四个部分构成：

- 内容（Content）
- 内边距（Padding）
- 边框（Border）
- 外边距（Margin）

## 介绍一下各种 `box-sizing`

- `content-box` 是默认值。如果你设置一个元素的宽为 100px，那么这个元素的内容区会有 100px 宽，并且任何边框和内边距的宽度都会被增加到最后绘制出来的元素宽度中。
- `border-box` 告诉浏览器：你想要设置的边框和内边距的值是包含在 width 内的。也就是说，如果你将一个元素的 width 设为 100px，那么这 100px 会包含它的 border 和 padding，内容区的实际宽度是 width 减去 (border + padding) 的值。大多数情况下，这使得我们更容易地设定一个元素的宽高。

全局设置 border-box 是一种非常普遍和推荐的最佳实践，通常会在 CSS 开头这样写：

```css
* {
  box-sizing: border-box;
}
```

## `margin-top` 和 `top` 的区别是什么？

- `margin-top`：推走它下面的元素。
- `top`：移动它自己（通常需要 position 非 static）。

## 怎么让一个元素水平、垂直居中？

- **Flex 布局**：父元素设置 `display: flex`，并设置 `justify-content: center` 和 `align-items: center`。
- **绝对定位**：
  - 父元素设置 `position: relative`，子元素设置 `position: absolute` 和 `top: 50%`、`left: 50%`，再通过 `transform: translate(-50%, -50%)` 调整居中。
  - 如果子元素确定宽高，例如 `width: 50px; height: 10px;`，可以通过 `margin-left: -25px; margin-top: -5px;` 简化，或者设置 `top: 0; left: 0; right: 0; bottom: 0; margin: auto;`。
- **Grid 布局**：
  - 父元素设置 `display: grid`，并设置 `place-items: center`。或者，
  - 父元素设置 `display: grid`，子元素设置 `justify-self: center` 和 `align-self: center`。
- **表格布局**：父元素设置 `display: table`，子元素设置 `display: table-cell` 和 `vertical-align: middle`。

## 介绍一下各种 `position`

- `static`（默认值）：元素遵循正常的文档流。top, right, bottom, left 和 z-index 属性无效。
- `relative`：元素先放置在正常的文档流中（和 static 一样占据空间）。然后，相对于其原本在文档流中的位置进行偏移（使用 top, right, bottom, left，例如使用 top: 20px 来让其从原位置向下移动 20px）。它原本占据的空间不会被其他元素填充，从而在偏移后可能会与其他元素重叠。
- `absolute`：元素脱离正常的文档流，不再占据原本的空间。元素的位置相对于最近的非 static（通常是 relative, absolute, fixed 或 sticky）定位的祖先元素进行定位。如果找不到这样的祖先元素，则相对于初始包含块（通常是 `<html>` 或 `<body>` 标签） 进行定位。top, right, bottom, left 属性决定了元素相对于这个参照物的最终位置。
- `fixed`：元素脱离正常的文档流。元素的位置相对于浏览器视口（viewport） 进行定位。这意味着它不会随着页面滚动而移动。top, right, bottom, left 属性决定了它在视口中的位置。

## 介绍一下 `inset`

`inset` 是 CSS 逻辑属性，是 `top`, `right`, `bottom`, `left` 四个属性的简写。它的语法与 `margin` 和 `padding` 的简写方式完全一致。

- `inset: 0;` → `top: 0; right: 0; bottom: 0; left: 0;`
- `inset: 10px 20px;` → `top: 10px; right: 20px; bottom: 10px; left: 20px;`
- `inset: 10px 20px 30px;` → `top: 10px; right: 20px; bottom: 30px; left: 20px;`
- `inset: 10px 20px 30px 40px;` → `top: 10px; right: 20px; bottom: 30px; left: 40px;`

## 介绍一下各种 `display`

- Outside Display（外部显示类型）
  - `block`: 块级元素，独占一行，宽度默认撑满父容器，例如 `<div>`、`<p>`、`<h1>`
  - `inline`: 行内元素，不换行，宽高无效，margin/padding 仅左右有效，例如 `<span>`、`<a>`、`<strong>`
  - `inline-block`: 行内块，既在一行内，又可设置宽高，例如自定义按钮、图标
  - `none`: 元素从文档中移除，不占空间，例如隐藏元素

- Inside Display（内部显示类型）
  - `flex`: 弹性布局，子元素成为 flex item，支持主轴、交叉轴对齐
  - `grid`: 网格布局，子元素成为 grid item，支持二维布局
  - `table`: 表格布局，模拟 `<table>` 行为，语义差，少用
  - `flow`: 默认文档流布局，就是普通块级/行内布局
  - `flow-root`: 创建 BFC（块级格式化上下文），清除浮动、防止 margin 合并

- 列表相关
  - `list-item`: 像 `<li>` 一样，生成主块和标记框，可用于自定义列表样式

- 实验性或少用
  - `contents`: 元素本身不生成盒子，子元素照常渲染，用于语义包装，不影响布局
  - `ruby`: 用于注音文本（如中文拼音、日文假名），极少用

- 双值语法（CSS Display Level 3）
  - `block flex`: 外部是块级，内部是 flex
  - `inline grid`: 外部是行内，内部是 grid

## `opacity`、`visibility`、`display` 的区别是什么？

`opacity`、`visibility` 和 `display` 三者都能控制元素的可见性，但效果和机制完全不同：

- **`opacity`** 通过透明度调整元素可见性。设置为 `0` 时，元素会*完全透明*、但依然*占据布局空间*，且*仍能响应点击等事件*。它支持平滑的过渡动画（比如淡入淡出），子元素会继承透明度。
- **`visibility`** 的 `hidden` 值会让元素*不可见*、*保留布局位置*、且*不响应事件*。与 `opacity` 不同，它的子元素无法覆盖隐藏状态（除非单独设置子元素为 `visible`）。虽然也支持部分动画，但仅限于可见性切换。
- **`display: none`** 则*彻底移除元素*，*既不占据空间也不响应事件*，还会触发页面重排（其他元素会重新布局）。它不支持动画，适合需要完全删除元素的场景。

关键区别在于：

- **布局影响**：`opacity` 和 `visibility` 保留空间，而 `display: none` 直接移除元素。
- **交互能力**：`opacity` 元素仍可交互，其他两者则不可。
- **动画兼容性**：`opacity` 最适合动画，`visibility` 次之，`display` 无法动画。

使用建议：

- 需要**淡入淡出效果**时，优先用 `opacity`（常搭配 `visibility` 禁用交互）。
- 临时隐藏但**保留布局**（如折叠面板），用 `visibility: hidden`。
- **彻底隐藏且优化性能**（如移除冗余元素），选择 `display: none`。

| 属性               | 值        | 可见性 | 占据空间 | 响应事件 | 支持动画    | 子元素继承      | 性能影响     | 适用场景        |
| ---------------- | -------- | --- | ---- | ---- | ------- | ---------- | -------- | ----------- |
| **`opacity`**    | `0`      | ❌   | ✅    | ✅    | ✅ 平滑过渡  | ✅ 继承透明度    | 🟡 重绘    | 淡入淡出动画、悬停效果 |
| **`visibility`** | `hidden` | ❌   | ✅    | ❌    | 🟡 有限支持 | 🟡 可被子元素覆盖 | 🟡 重绘    | 临时隐藏、保留布局   |
| **`display`**    | `none`   | ❌   | ❌    | ❌    | ❌       | ❌ 元素被移除    | 🔴 重排+重绘 | 条件渲染、性能优化   |

## 介绍一下 CSS 中的各种长度单位

- 绝对单位（不随屏幕或字体变化）
  - `px`：像素，最常用的固定单位，精确但缺乏弹性。
  - `pt`：点，1 pt = 1/72 in，印刷场景常用，浏览器中 16 px ≈ 12 pt。
  - `pc`：派卡，1 pc = 12 pt，印刷排版单位，网页很少用。
  - `in`：英寸，1 in = 96 px，仅用于打印样式表。
  - `cm` / `mm`：厘米 / 毫米，1 cm = 37.8 px，打印样式表可见。

- 字体相对单位（以当前元素或祖先元素的 font-size 为基准）
  - `em`：相对于**自身**或**父元素**的 font-size，可嵌套累积，需谨慎。
  - `rem`：相对于**根元素**（html）的 font-size，避免嵌套副作用，响应式首选。
  - `ex`：相对于当前字体 x 高度（小写字母 x 的高度），排版微调时偶尔用。
  - `ch`：相对于当前字体数字 0 的宽度，等宽字体布局时实用（如设定 80 字符换行）。

- 视口相对单位（随窗口大小变化，天生响应式）
  - `vw`：视口宽度的 1 %，100 vw = 可视区全宽。
  - `vh`：视口高度的 1 %，100 vh = 可视区全高。
  - `vmin`：vw 与 vh 中**较小**值的 1 %，适用于“正方形随屏适配”。
  - `vmax`：vw 与 vh 中**较大**值的 1 %，用于全屏遮罩或背景。

- 容器相对单位（容器查询时代的新单位，需支持 CQ 的浏览器）
  - `cqw` / `cqh`：容器宽度 / 高度的 1 %。
  - `cqi` / `cqb`：容器内联 / 块方向的 1 %，自动跟随书写模式。
  - `cqmin` / `cqmax`：上述最小或最大值，类似 vmin/vmax，但基于容器。

- 角度/时间/分辨率单位（专用场景，非长度，但常一起出现）
  - `deg` / `rad` / `grad` / `turn`：角度，用于 transform、渐变。
  - `s` / `ms`：秒 / 毫秒，用于 transition/animation 时间。
  - `dpi` / `dpcm` / `dppx`：分辨率，用于媒体查询 Retina 屏。

## 如何实现响应式布局？

我主要通过使用 **CSS 媒体查询（Media Queries）**、**流式布局（Fluid Layouts）** 和 **相对单位（Relative Units）** 来实现响应式界面。核心思想是使页面布局和元素能够根据不同的设备屏幕尺寸自动调整，从而为所有用户提供最佳的浏览体验。

---

实现响应式界面（RWD）是一个系统工程，我通常采用一种多策略结合的方法，主要基于以下四个核心支柱：

**1. 流体网格（Fluid Layouts）**

- **做法**：放弃传统的固定像素（`px`）宽度，改用 **相对单位** 如百分比（`%`）、视口宽度（`vw`）、视口高度（`vh`）来定义容器的宽度、间距等。
- **目的**：使布局能够像液体一样，随着父容器或视口（Viewport）大小的变化而平滑地伸缩，为布局调整打下基础。


**2. 弹性媒体（Flexible Media）**

- **做法**：确保所有图片、视频等媒体元素也是可伸缩的。我通常会设置 `max-width: 100%;` 和 `height: auto;`。
- **目的**：防止媒体元素的固定尺寸破坏流动布局，确保它们始终包含在其父容器内。


**3. CSS 媒体查询（Media Queries）**

- **做法**：这是响应式的‘开关’。使用 `@media` 规则，在特定的**断点（Breakpoints）** 处应用不同的 CSS 样式。我通常采用 **移动优先（Mobile-First）** 的设计原则，即先为小屏幕编写基础样式，再使用 `min-width` 媒体查询为逐渐增大的屏幕添加或覆盖样式。
- **目的**：在布局发生质变的关键点（例如屏幕宽度从手机变为平板），通过改变 CSS 规则来大幅调整布局结构（如将单列变为多列）、调整字体大小或显示/隐藏某些元素。


**4. 现代 CSS 布局技术（Modern CSS Layouts）**

- **Flexbox**：我使用它来进行**一维布局**，完美解决元素在一条线上的对齐、分布和空间分配问题，比如导航栏、卡片组件。
- **CSS Grid**：我使用它来进行**二维布局**，定义行和列，轻松创建复杂的整体页面结构，这是构建主布局的理想选择。
- **目的**：这些布局技术本质就是为响应式而生的，它们比传统的浮动（Float）或定位（Position）布局要灵活和强大得多，能极大地减少媒体查询的使用次数。

**在我的 Astro 博客项目中的具体实践：**

- **工具**：我使用 **Tailwind CSS** 框架，它内置了完整的移动优先的响应式工具类（如 `md:flex`, `lg:w-1/2`），让我能直接在 HTML 中快速实现上述所有理念。
- **视口元标签**：我确保在每个 HTML 文件的 `<head>` 里都包含了 `<meta name="viewport" content="width=device-width, initial-scale=1.0">`，这是响应式设计的**前提**，它告诉移动浏览器应该以设备的实际宽度来渲染页面。
- **测试**：我使用 Chrome DevTools 的设备模拟器进行主要断点的测试，并在真实的手机和平板设备上进行最终验证。

**总结来说，** 我的响应式策略不是单一技术，而是一个组合拳：**用流体网格和弹性媒体实现平滑缩放，用媒体查询在关键点进行布局重构，并用 Flexbox 和 Grid 等现代布局技术作为实现的强大工具。**

## 请解释什么是 CSS 动画，以及两种主要的实现方式？

CSS 动画是一种不依赖 JavaScript，直接使用 CSS 样式来实现元素状态变化和运动效果的技术。它能创建平滑的视觉过渡和动态效果，极大地增强用户界面的交互体验和吸引力。

CSS 动画主要有两种实现方式：

1. **过渡（Transitions）**：用于**简单的状态变化**。当元素的 CSS 属性值发生改变时，它允许这个变化在一段时间内平滑地发生，而不是瞬间完成。例如，按钮在鼠标悬停时颜色逐渐改变。
2. **动画（Animations）**：用于**更复杂、精细的序列**。它通过定义`@keyframes`规则来创建包含多个中间步骤的动画，可以控制循环次数、方向等，无需外部触发就能自动运行。例如，一个不断旋转的加载图标。

简单来说，**过渡是响应式的，由事件触发（如悬停）；而动画是主动的，可以自行运行并包含更多细节**。两者都是提升现代网页视觉表现力的核心工具。

## 请详细说明 CSS Transition 的属性及其作用？

CSS Transition（过渡）是一组用于控制简单动画效果的属性，它决定了元素属性变化时的平滑方式和过程。它的核心思想是“补间”，即在起始状态和结束状态之间自动生成中间帧。

其主要属性有四个：

- **`transition-property`**：
  - **作用**：指定哪些 CSS 属性应该应用过渡效果。
  - **示例**：`width`, `background-color`, `transform`。可以使用`all`表示所有可动画属性都生效。

- **`transition-duration`**：
  - **作用**：定义过渡效果持续的时间。**这是必需属性**，如果值为 0，则不会有任何动画。
  - **示例**：`1s`（1 秒）或`500ms`（500 毫秒）。

- **`transition-timing-function`**：
  - **作用**：定义动画的速度曲线，即动画在持续时间内的节奏变化。
  - **常用值**：`ease`（默认，慢-快-慢）、`linear`（匀速）、`ease-in`（慢开始）、`ease-out`（慢结束）。

- **`transition-delay`**：
  - **作用**：设定在属性变化之后，过渡效果开始执行之前的等待时间。
  - **示例**：`0.5s`表示变化发生后延迟半秒才开始动画。

这些属性通常被**简写**在一起，顺序为：`property duration timing-function delay`。例如：
`transition: transform 0.3s ease-out, background-color 0.5s linear;`

## 什么是`@keyframes`？如何定义一个 CSS Animation？

`@keyframes`是定义 CSS Animation（动画）序列的核心规则。你可以把它想象成一个时间轴，在这个时间轴上的不同点（用百分比表示）定义元素应该具有的样式。浏览器会自动填充这些关键帧之间的所有中间状态，从而形成流畅的动画。

定义一个 CSS 动画分为两步：

**第一步：使用`@keyframes`规则定义动画序列。**

你需要给它起一个名字，然后在其中设置关键帧。

```css
@keyframes slide-in {
  /* 起始状态 (0%) */
  from {
    transform: translateX(-100%);
  }
  /* 结束状态 (100%) */
  to {
    transform: translateX(0);
  }
}
```

或者使用百分比来定义更复杂的过程：

```css
@keyframes bounce {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-30px); }
  100% { transform: translateY(0); }
}
```

**第二步：将动画应用于元素。**

通过`animation-*`系列属性将定义好的关键帧动画绑定到元素上。最关键的属性是：

- **`animation-name`**：你定义的`@keyframes`名称（如`slide-in`）。
- **`animation-duration`**：动画周期时长（**必须设置**，否则默认为 0）。

一个简单的应用示例：

```css
.box {
  animation-name: slide-in;
  animation-duration: 2s;
}
```

当然，你还可以使用简写形式：`animation: slide-in 2s;`

## 在进行 CSS 动画开发时，有哪些重要的性能优化建议？

让动画保持流畅是提升用户体验的关键，糟糕的动画会导致卡顿，让人感觉网站很慢。以下是一些最重要且简单的性能优化建议：

1. **优先使用`transform` 和`opacity` 属性**：
   - 这是**最重要的一条规则**。修改这两个属性不会触发浏览器昂贵的**重排**（Layout）和**重绘**（Paint）过程。它们只会在合成（Compositing）阶段由 GPU 来处理，因此效率极高，非常流畅。
   - **应该用**：`transform: translate()`, `scale()`, `rotate()` 和 `opacity`。
   - **应避免**：动画那些影响布局的属性，如`width`, `height`, `margin`, `left`, `top`等。

2. **利用硬件加速**：
   - 通过使用`transform: translateZ(0)`或`will-change: transform`这样的声明，可以提示浏览器该元素将要进行动画变化。浏览器通常会提前将其提升到一个新的图层（layer）并用 GPU 来渲染，从而获得更平滑的性能。

3. **尊重用户偏好**：
   - 有些用户对动画敏感，可能会感到眩晕。我们应该使用**媒体查询**`@media (prefers-reduced-motion: reduce)`来检测用户是否在系统中设置了减少动画的选项，并为这些用户提供无动画的替代方案。这不仅关乎性能，更关乎**可访问性**和包容性。
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

## 有哪些可动画属性？

1. **变换（Transform）属性：**
   - `translateX`, `translateY`, `translateZ`, `translate3d`
   - `scaleX`, `scaleY`, `scaleZ`, `scale3d`
   - `rotateX`, `rotateY`, `rotateZ`, `rotate`
   - `skewX`, `skewY`
   - **性能提示：这是性能最好的一类，强烈推荐使用。**

2. **外观与颜色属性：**
   - `color`, `background-color`, `border-color`
   - `opacity`（透明度）
   - `visibility`（注意：它是在离散值间切换，但浏览器会智能地处理其过渡）
   - `box-shadow`

3. **布局与尺寸属性：**
   - `width`, `height`, `max-width`, `min-height`
   - `top`, `right`, `bottom`, `left`
   - `margin`, `padding`
   - `gap`
   - **性能警告：动画这些属性会触发浏览器昂贵的重排（reflow）过程，应尽量避免。**

4. **字体与文本属性：**
   - `font-size`, `line-height`
   - `letter-spacing`, `word-spacing`

5. **其他属性：**
   - `flex-grow`, `flex-shrink`
   - `z-index`（虽然它是整数，但动画有效）
   - `background-position`
   - `border-width`

## 如何实现 0.5px 的边框

1. **使用 `transform`**：兼容性好，实现效果纯正

   ```css
   .element {
     position: relative;
   }

   .element::after {
     content: "";
     position: absolute;
     top: 0;
     left: 0;
     width: 200%;
     height: 200%;
     border: 1px solid #3498db;
     transform: scale(0.5);
     transform-origin: 0 0;
     box-sizing: border-box;
     pointer-events: none;
   }
   ```

2. **使用 `box-shadow`**：实现简单，但不同浏览器渲染效果可能不一致，且不支持圆角

   ```css
   .element { box-shadow: 0 0 0 0.5px #e74c3c; }
   ```

3. **使用 `linear-gradient`**：可实现单边或多边边框，灵活性强，但代码复杂，兼容性一般
   ```css
   .element {
     position: relative;
     background-clip: padding-box;
   }

   .element::before {
     content: "";
     position: absolute;
     top: 0;
     right: 0;
     bottom: 0;
     left: 0;
     z-index: -1;
     margin: -0.5px;
     border-radius: inherit;
     background: linear-gradient(to bottom, #2ecc71, #2ecc71);
   }
   ```

4. **使用 `border-image`**：代码简洁，但兼容性、灵活度欠佳

   ```css
   .element {
     border: 0.5px solid transparent;
     border-image: linear-gradient(to bottom, #9b59b6, #9b59b6) 1 stretch;
   }
   ```

## 介绍一下 `flex: x y z;`

`flex: x y z;` 是 CSS Flexbox 布局中对 `flex-grow`、`flex-shrink`、`flex-basis` 三个属性的复合缩写。完整形式下：

- **x** 对应 `flex-grow`（扩展能力）
- **y** 对应 `flex-shrink`（收缩能力）
- **z** 对应 `flex-basis`（基准尺寸）

默认值为 `flex: 0 1 auto`，即不允许扩展、允许收缩、基准尺寸为基于内容的自动尺寸。

该属性支持简写，具体的规则可参看下面的参考文档。此处列出一些常用的：

1. `**flex: 1**` → 等价于 `flex: 1 1 0%`（等分布局首选）
2. `**flex: auto**` → 等价于 `flex: 1 1 auto`（基于内容尺寸扩展）
3. `**flex: none**` → 等价于 `flex: 0 0 auto`（完全固定尺寸）

> [!tip]
> `flex-basis` 值为 `0%` 和 `auto` 的区别：
>
> - `flex-basis: 0%` 强制忽略内容宽度，以剩余空间为分配基准；
> `flex-basis: auto` 则优先考虑内容固有尺寸。

## 介绍一下 CSS 中如何限制文本行数，以及超长显示省略号

默认情况下，文本会自动换行。如果容器不够大，则会溢出。

为了实现单行文本、超长截断并显示省略号，需要：

- 使用 `white-space: nowrap;` 来阻止换行；
- 使用 `overflow: hidden;` 来隐藏溢出的内容；
- 使用 `text-overflow: ellipsis;` 来设置超长样式为省略号。

下面是另一种方式，并且该方式支持任意行数：

```css
.line-clamp-NUMBER {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: NUMBER;
}
```

在线演示：[Tailwind Play](https://play.tailwindcss.com/TwAUEpZdKz)
