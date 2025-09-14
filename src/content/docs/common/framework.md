---
title: 框架
---

## 介绍并比较一下 MVC 和 MVVM

MVC 是一种将应用分为三个核心部件的架构模式。

- **Model（模型）**：管理和存储数据，以及处理业务逻辑。例如，从服务器获取用户数据。
- **View（视图）**：用户看到的界面（UI）。它从 Model 获取数据并展示出来。例如，一个显示用户信息的 HTML 页面。
- **Controller（控制器）**：接收用户的输入（如点击按钮），调用 Model 进行数据处理，再选择更新的 View 进行展示。

MVVM 是 MVC 的一种演进模式，核心是**数据驱动**，通过**数据绑定**让开发更高效。

- **Model（模型）**：和 MVC 一样，管理数据和业务逻辑。
- **View（视图）**：和 MVC 一样，是用户界面。
- **ViewModel（视图模型）**：这是关键。它是 View 的抽象，包含了 View 所需的数据和命令。它通过**数据绑定**与 View 自动保持同步：Model 的数据变化会自动更新到 View（通过 ViewModel），用户在 View 上的操作（如输入）也会自动更新回 Model（通过 ViewModel）。

| 特性 | MVC | MVVM |
| :--- | :--- | :--- |
| **核心思想** | 关注点分离，通过控制器**手动**协调 | **数据驱动**，通过数据绑定**自动**同步 |
| **通信方式** | **单向**或**环形**：View -> Controller -> Model -> View | **双向数据绑定**：View 和 Model 通过 ViewModel 自动同步 |
| **职责** | Controller 承担了大量逻辑，是“指挥官” | ViewModel 只暴露 View 需要的数据和状态，更“被动” |
| **适用场景** | 传统后端渲染（如 Spring MVC）、jQuery 项目 | 现代 **数据驱动** 的前端框架（如 Vue, React, Angular） |

MVC 需要你**手动**告诉程序去更新视图（`操作 DOM`），而 MVVM 是**自动**的（`修改数据就行`）。MVVM 让前端开发更专注于数据和业务逻辑，而不是繁琐的 DOM 操作。

## 什么是 SPA？介绍一下它与 MPA 的区别、优缺点

**SPA（Single Page Application，单页面应用）** 是一种现代的网页应用程序架构。在这种架构中，用户在浏览器中加载一个初始 HTML 页面后，后续的所有交互和数据更新都通过 JavaScript 动态完成，而无需重新加载整个页面。页面的内容通过 AJAX 或其他方式从服务器获取，并动态渲染到当前页面上。像是 React、Vue 这样的框架都是 SPA 的实现方式。

**MPA（Multi-Page Application，多页面应用）** 是传统的网页架构，每次用户导航到新页面时，都会向服务器请求一个新的 HTML 页面，服务器会生成完整的 HTML 并返回给浏览器。这里说的“传统”只是相对而言，事实上，也存在 Astro 这样的面向 MPA 的现代框架。

SPA 的优点包括：

- 用户体验好：页面切换无需刷新整个页面，提供了类原生的流畅体验，非常适合复杂的交互场景，例如在线编辑器；
- 减少服务器压力：大部分逻辑和渲染工作由前端完成，服务器只需提供数据接口（API），减少了服务器的计算负担。
- 职责明确：前端专注于 UI 和交互，后端专注于数据处理和业务逻辑等

SPA 的缺点包括：

- 首屏加载时间较长：下载大量的前端资源（例如 JavaScript 文件）可能导致加载速度较慢
- SEO 不友好：搜索引擎爬虫可能无法正确抓取页面内容，影响 SEO（但可以通过 SSR 或 SSG 解决这一问题）

MPA 的优点包括：

- SEO 友好：几乎每个页面都是静态 HTML，爬虫抓取友好，非常适合博客、新闻站点等内容驱动型网站
- 首屏加载快：用户访问时，直接加载完整的 HTML 页面，首屏内容展示更快
- 兼容性可能较好

MPA 的缺点包括：

- 用户体验相对较差：每次页面切换必须重新加载整个页面
- 服务器压力大：服务器需要生成完整 HTML 页面，服务器计算压力大
- 传统情形下，前后端耦合度较高

## 介绍一下 SPA 的路由原理

SPA 中的路由是实现页面切换和导航的核心机制，它通过**管理 URL 和页面状态之间的映射**、**通过 JavaScript 动态更新页面内容**来实现页面切换和导航功能。

用户的操作首先会引起 URL 的变化，但这种变化不会引起页面刷新。它可以通过以下两种方式实现：

- **Hash 模式**：利用 URL 中的 `#` 符号。`#` 后面的内容不会被发送到服务器，因此更改 `#` 不会触发页面更新。浏览器提供了 `hashchange` 事件，可以监听 URL 中 `#` 的变化。这种方式兼容性较好，但对 SEO 优化不好。
- **History 模式**：利用 HTML5 的 History API，它允许开发者操作浏览器的历史记录栈，而不刷新页面。主要的操作包括 `pushState(state, title, url)`（向历史记录栈中添加一条新记录）、`replaceState(state, title, url)`（替换当前历史记录）、`popstate` 事件等。但这种方式需要服务器配置支持（例如访问 `/about` 服务器需要返回 SPA 入口文件（如 `index.html`），并且可能兼容性略差。

## 你在项目中用到了 Astro、Nuxt.js、Next.js，能说说你对这些“元框架”（Meta-Framework）的看法吗？它们分别解决了什么问题？

Astro、Nuxt.js 和 Next.js 都是现代前端元框架，核心目标都是 **提升开发体验和应用性能**，但它们侧重点不同。

**Astro** 的核心是**内容优先**。它默认输出静态 HTML，天生利于 SEO 和性能。它的“岛屿架构”让我能按需激活交互式组件，从而在保持极快加载速度的同时，又能拥有动态功能。

**Next.js** 和 **Nuxt.js** 则是 **应用优先** 的框架。它们基于 React 和 Vue，提供了开箱即用的路由、数据获取、渲染等完整解决方案，目标是简化复杂单页面应用（SPA）的开发。

简单来说：

- 如果是内容型网站（如博客、文档站），**Astro** 是更轻、更快的选择。
- 如果是复杂的 Web 应用，**Next.js** 或 **Nuxt.js** 提供的开发体验和功能更全面。

## 什么是服务端渲染（SSR）

**SSR (Server Side Rendering)** 是在服务器上生成完整 HTML 页面（通常是 JS 框架编写的 SPA），再发送到客户端的技术。

核心思想是：浏览器接收到的是 *可以直接显示的 HTML 内容*，而不是必须等待 JS 加载执行后才能显示的内容。

与之对应的技术是 **客户端渲染(Client Side Rendering, CSR)** ：

- CSR：浏览器下载 HTML 骨架 -> 下载 JS -> JS 执行 -> 请求数据 -> 渲染页面
- SSR：浏览器请求 -> 服务器处理（数据 + 渲染）-> 返回完整 HTML 以及可能的初始数据（脱水数据） -> 浏览器渲染 -> 水合（Hydration，JS 代码接管静态的 HTML，并进行添加事件监听器、恢复应用状态等操作，使页面变得可交互）

## SSR 的优缺点是什么？

优势：

- **SEO 优化**：搜索引擎爬虫可直接抓取完整 HTML
- **首屏加载速度（FCP/LCP）**：用户能更快看到页面内容，体验更好，降低跳出率
- **对低性能设备/弱网环境更友好**：浏览器初始工作量减少，因为大部分操作已在服务端完成
- 社交媒体分享效果好，因为能直接显示预览信息

劣势（代价）：

- **更高的服务器负载**：每次请求都需要服务器生成 HTML
- **更复杂的构建和部署**：同时管理和维护服务端和客户端代码
- **更复杂的开发**：需要处理服务器环境特有的问题，考虑组件生命周期、数据获取、状态管理方式上的差异，无法使用浏览器特有 API（如访问 `window`）
- **页面切换可能较慢**：传统 SSR 需要完整刷新
- **TTI (Time To Interactive) 变长**

## SSR 与 CSR 有什么区别？

- SSR 在服务器生成 HTML，用户首屏体验好，SEO 友好；CSR 在浏览器生成页面，交互流畅但首屏慢。
- SSR 服务器压力大，CSR 服务器压力小。
- SSR 适合内容型网站，CSR 适合应用型网站。

现代框架常结合两者优点，如先 SSR 渲染首屏，再 CSR 处理交互。

## 什么情况下应该选择 SSR？

现代框架允许混合使用，根据页面特性灵活选择。

应当选择：

- 当项目 **重视 SEO** 和 **首屏加载速度** 时应选择 SSR，如内容型网站、电商网站、新闻门户等。
- 当目标用户 **可能使用低端设备或弱网环境** 时，SSR 也是好选择。

不应选择：

- 如果是内部管理系统或对 SEO 要求不高的应用，CSR 可能更简单高效。
- 纯静态站点（更应该考虑使用 SSG）

## 常见的 SSR 框架有哪些？

主流 SSR 框架包括：

- Next.js: React 生态最流行
- Nuxt.js: Vue 的 SSR 框架
- Angular Universal: Angular 的 SSR 方案
- SvelteKit: Svelte 的 SSR 框架

这些框架不仅提供 SSR 功能，还支持静态生成（SSG）等现代渲染模式，满足不同场景需求。

## 什么是静态站点生成（SSG）

**SSG (Static Site Generation)** 是在 **构建时（build time）** 生成 HTML 页面的技术。与 SSR 不同，它不需要在每次请求时生成页面。

核心逻辑：构建时生成所有 HTML 页面 -> 部署到 CDN -> 用户请求 -> 直接从 CDN 获取 HTML

优点：

- **极速加载**：HTML 已经生成，可被 CDN 缓存，TTFB 极低
- **服务器压力小**：只需要提供静态文件
- **SEO 友好**：搜索引擎可直接抓取

缺点：

- **数据非实时**：内容更新需要重新构建整个（或部分）站点
- **构建时间开销**：站点页面多时，构建时间可能较长

## 什么是增量静态再生成（ISR）

**ISR (Incremental Static Regeneration)** 是 SSG 的增强版本，允许在运行时，在用户请求后，**按需、增量地重新生成** 特定页面，结合了 SSG 的性能和 SSR 的灵活性。

核心逻辑：

- 初始构建时生成静态页面
- 用户请求 -> 提供缓存的静态页面
- 同时（若配置了 revalidate 且时间已到），在后台重新生成页面
- 下次请求该页面时，提供更新后的版本

优点：

- 兼具 SSG 的速度和部分 SSR 的数据新鲜度
- 无须每次都完整构建，减少构建时间
- 即使新的构建失败，仍可回退到上一个可用版本，保持高可用性

## 什么是 Hydration（水合）？

水合是指 *客户端 JavaScript 为服务器渲染好的静态 HTML 页面附加交互性和状态的过程*。简单说，就是让静态页面“活”起来，变成可以响应用户操作的单页应用，它是连接服务器端渲染和客户端交互的桥梁。

核心要点：

1. **前提**：页面由服务器端渲染（SSR）生成静态 HTML。
2. **过程**：浏览器下载 JS 后，React/Vue 等框架会“接管”现有的 DOM 节点，为其绑定事件监听器、初始化状态（步骤：重建虚拟 DOM，将 VDOM 和真实 DOM 节点进行比较，附加事件监听器）
3. **目标**：将静态页面转变为动态应用。

## 为什么我们需要 Hydration？它解决了什么问题？

主要是为了在保留**服务器端渲染（SSR）** 优点的同时，获得**客户端应用（SPA）** 的交互体验。

SSR 的优点（水合要保留的）：

- **首屏加载快**：用户能立刻看到服务器生成的内容。
- **利于 SEO**：搜索引擎爬虫可以直接抓取完整的页面内容。

SPA 的优点（水合要实现的）：

- **丰富的交互**：页面之后的操作像正常应用一样流畅，无需整页刷新。

水合就是连接这两者的桥梁，解决了 SSR 页面“只能看不能点”的问题。

## Hydration 的基本流程是怎样的？

流程可以简单分为四步：

1. **服务器渲染**：服务器运行前端代码，生成带内容的静态 HTML，发送给浏览器。
2. **立即显示**：浏览器收到 HTML 后立即渲染，用户看到页面。
3. **下载与执行**：浏览器在后台下载页面所需的 JavaScript 包。
4. **“注入”交互**：JS 代码执行，框架（如 React）会：
   - 检查现有的静态 DOM。
   - 将事件处理函数“附加”或“挂载”到对应的元素上。
   - 此后，页面就变得可以交互了。

## Hydration 有什么缺点或需要注意的地方？可以怎么解决？

- **All Or Nothing**：必须等待 **所有** 组件的 JS 代码下载完成后，才能对 **整个** 应用进行 Hydration。所以只要有一个组件加载缓慢，就会阻塞整个页面的交互
- **同步阻塞**：Hydration 过程是同步的、CPU 密集的。在此期间，浏览器主线程被占用，用户无法进行任何操作，导致 TTI（Time To Interactive）体验差。只有 Hydration 完成后，用户才能交互，所以产生了交互延迟问题 —— 用户**看到内容**和**能够操作**页面之间存在一个时间差。

解决方案：

- **流式服务端渲染（Streaming SSR）**：利用 `<Suspense>` 将应用拆分为独立的块。服务器不再等待所有数据，而是先发送 HTML 外壳，在 `<Suspense>` 包裹的组件在服务端准备好后，再将其 HTML 流式传输到客户端，替换掉原来的占位组件
- **选择性水合（Selective Hydration）**：即使 JS 代码还未完全下载，React 也可以对已经可见的部分进行水合。可采用 **渐进式水合（Progressive Hydration）** 的策略，优先水合重要的部分
- **Islands 架构**：只水合有交互的组件

## React 18 中，如果用户在组件 Hydration 之前就点击了它，会发生什么？

React 会在根节点记录这个点击事件，当对应的组件完成 Hydration 后，React 会“重放（Replay）”这个事件，确保用户的交互不会丢失。

## React 中用于 Hydration 的 API 是什么？

在 React 18 之前，使用的是 `ReactDOM.hydrate()`。
在 React 18 及之后，推荐使用新的 **`ReactDOM.hydrateRoot()`** API 来开启并发特性（如渐进式水合）。

```javascript
// 对于 React 18+
import { hydrateRoot } from 'react-dom/client';
const root = hydrateRoot(document.getElementById('root'), <App />);
```

它告诉 React：“不要去创建新的 DOM 节点了，直接去‘激活’这个容器里已有的服务器渲染的 DOM 节点。”

## 综合：React 18 的并发渲染（Concurrent Rendering）是如何优化 Hydration 过程的？

1. Hydration 的痛点
   - 全有或全无
   - 同步阻塞导致的页面无响应
2. 并发特性
   - 并发渲染使 React 任务“可中断”、“可恢复”
   - Hydration 因此可被拆分为小任务
3. 介绍新功能
   - 流式 SSR + `<Suspense>`
   - 选择性水合

## 介绍一下 React Server Components。它和 SSR 的关系是什么？

**React Server Components (RSC)** 是一种 *新型的组件类型*，它 **专门在服务器端运行**，永远不会被发送到客户端，也永远不会进行 Hydration。

核心特性：

- **零 Bundle 大小**：组件代码（包括大型依赖）完全留在服务器端，不增加客户端 JS 包体积。
- **直接访问后端资源**：组件可以直接访问数据库、API、文件系统等后端资源，无需创建额外的 REST/GraphQL 端点。
- **自动代码分割**：框架（如 Next.js）自动处理代码分割，客户端只下载需要的 Client Component 的代码。
- **序列化限制**：它们的渲染输出（主要是 UI 结构和简单数据）会被序列化并发送给客户端。因此，它们不能使用状态（`useState`）、生命周期（`useEffect`）或浏览器 API，也不能包含交互性（如事件处理程序）。

**与 SSR 的关系：互补而非替代**

可以把它们看作是解决不同问题的、可以协同工作的两种技术：

1. **SSR**：
    - **解决的问题**：为 **Client Components** 预先渲染 HTML，改善首屏性能和 SEO。
    - **输出**：静态的 HTML 字符串。
    - **后续步骤**：仍然需要将相关的 JavaScript 发送到客户端进行 **Hydration**，以附加交互性。

2. **RSC**：
    - **解决的问题**：本身是一种新的组件模型，旨在减少客户端 JS、简化数据获取、更紧密地集成前端与后端。
    - **输出**：一种特殊的、描述 UI 的 **数据格式（或协议）**，而不是简单的 HTML。这个数据流可以被 React 在客户端更智能地协调和渲染。
    - **后续步骤**：不需要 Hydration，因为它们是纯静态的。

**协同工作模式（以 Next.js App Router 为例）：**

一个现代 React 应用通常是混合的：

- **Server Component**：用于获取数据、渲染非交互的 UI 部分（如布局、博客文章内容、产品描述）。
- **Client Component**（使用 `'use client'` 指令）：用于渲染需要交互性的部分（如表单、按钮、复杂状态逻辑），这些组件仍然可以通过 SSR 预渲染其初始 HTML。

**流程简化版：**

1. 服务器接收到请求。
2. React 渲染 **Root Server Component**。
3. 在渲染过程中，遇到 **Server Components** 就直接在服务器执行。
4. 遇到 **Client Components** 时，服务器会渲染它们的初始 HTML（这就是 SSR 在起作用），并“标记”出它们的位置。
5. 最终，服务器将 **Server Components 的序列化输出** 和 **Client Components 的预渲染 HTML** 混合在一起，发送给客户端。
6. 客户端 React 接管后，只会对 **Client Components** 进行 Hydration，使其可交互。而 Server Components 的部分已经被静态内容填充，无需任何 JS 即可显示。

RSC 是一种新的组件范式，而 SSR 是一种渲染技术。RSC 的架构天然包含了 SSR（用于其中的 Client Components），但它的目标和范围远大于传统的 SSR。

## 如何评价 TypeScript 在 Vue 项目中的应用价值？使用 TypeScript 给你带来了哪些好处和挑战？

好处有代码补全会更加智能，接口所需参数等信息更加明确；挑战包括对老旧库的兼容可能存在问题，有的类型定义过于复杂、降低了可读性。

我的实践经验包括：核心逻辑、前后端连接的接口等保持强类型，UI 组件使用更宽松的类型定义

## Vue3 的 Composition API 相比 Options API 有什么优势？你在实际项目中是如何运用的？

- 组合式 API 允许我们使用组合函数来实现更简单的逻辑复用。
- 组合式 API 使代码组织更加灵活。不再需要像在选项式 API 中做的那样，把代码放进对应选项；组合式 API 允许我们将处理同一逻辑的代码可以放在一起。
- 组合式 API 对于 TypeScript 的支持会更好。
- 搭配 `<script setup>` 使用组合式 API 会比相同情况下的选项式 API 更高效，对代码压缩也更友好。（这是由于 `<script setup>` 形式书写的组件模板被编译为了一个内联函数，和 `<script setup>` 中的代码位于同一作用域。不像选项式 API 需要依赖 `this` 上下文对象访问属性，被编译的模板可以直接访问 `<script setup>` 中定义的变量，无需从实例中代理。）
- 组合式 API 提供了和 React Hooks 相同级别的逻辑组织能力，但两者还是存在区别的。

## 原生 JS 中的事件处理是怎样的？React 中的事件绑定的实现原理是什么？与原生 JS 有什么不同？

原生 JS 的事件处理是基于浏览器的事件模型，分为**捕获**、**目标**和**冒泡**三个阶段。当事件触发时，浏览器会创建事件对象，并从根节点（如 window）开始捕获，到达目标节点后触发处理函数，再逐级冒泡返回。事件监听器通过 `addEventListener` 绑定，回调函数会被推入任务队列，由事件循环异步执行。开发者需要手动管理事件绑定和移除，否则可能造成内存泄漏，且需处理不同浏览器的兼容性问题。

React 的事件绑定则通过 **合成事件（SyntheticEvent）** 和 **事件委托** 实现。所有事件实际被委托到应用的根节点（React 17+）或 document（旧版本），而非直接绑定到具体 DOM 元素。React 在底层统一管理事件监听，通过事件映射表存储处理函数，触发时根据事件类型和目标元素分发对应的回调。合成事件封装了原生事件对象，提供跨浏览器一致的 API，并复用事件对象以减少内存开销。此外，React 自动绑定类组件方法的 `this`，且在组件卸载时自动清理事件，避免手动移除。

两者的差异主要体现在：

1. **绑定方式**：原生事件直接绑定到 DOM，React 通过事件委托集中管理；
2. **事件对象**：原生返回原生 Event 对象，React 返回合成事件对象；
3. **兼容性**：React 屏蔽了浏览器差异，原生需自行处理；
4. **性能**：React 的委托机制减少了事件监听器数量，适合动态 UI；
5. **内存管理**：React 自动清理，原生需手动移除监听器。

例如，React 中阻止事件冒泡需调用 `e.stopPropagation()`，而原生事件中需额外考虑捕获阶段的处理。此外，React 的合成事件在异步操作中需通过 `e.persist()` 保留数据，而原生事件无此限制。

## 在原生和 React 中，分别应如何阻止事件冒泡？

阻止事件冒泡的核心目的是阻止事件向父级元素传播。但在不同环境下，实现方式不同：

- **原生环境**：直接在 DOM 事件监听器中调用事件对象的 `.stopPropagation()` 方法。
- **React 环境**：在 React 的合成事件（SyntheticEvent）对象上调用 `.stopPropagation()` 方法。

虽然方法名相同，但 React 封装了浏览器原生事件，其事件对象是合成事件，但在 API 上保持了一致性。

## 在大型 Vue 项目中，如何设计可维护的组件架构？分享一个高阶组件的应用场景

在大型 Vue 项目中设计可维护的组件架构，核心是**分层解耦**和**约定优先**。比如组件按业务域划分到`modules/`目录下，每个模块包含组件、服务、类型定义。组件间通信尽量用**props + emit**明确定义依赖关系，避免滥用`$root`或事件总线导致追踪困难。对于跨层级数据，可以用**provide/inject**搭配 Symbol 键名防止命名冲突，或者用**Pinia**按模块拆分 store。

**高阶组件（HOC）** 的典型应用场景是 **权限控制** 。比如封装一个`withAuth`函数，接收目标组件，返回一个新组件：内部先检查用户权限，未通过时渲染 403 页面或加载骨架屏，通过后再渲染真实内容。这样所有需要权限的页面组件都可以用`withAuth(ReportPage)`统一处理鉴权逻辑，避免在每个组件里重复权限校验代码。HOC 还能用来做**数据预加载**，比如在路由跳转前通过`asyncData`接口获取数据，再将数据作为 props 注入目标组件。

另外，对于复杂的表单场景，可以用 HOC 封装**表单校验逻辑**。比如`withValidation`高阶组件统一处理表单字段校验、错误提示状态，被包裹的组件只需关注具体表单项的 UI 实现。这种模式让校验规则和 UI 实现彻底解耦，后续修改校验策略时不会影响业务组件。

## 什么是虚拟 DOM？有什么用？

虚拟 DOM （Virtual DOM）就是使用 JavaScript 对象在内存中构建一个轻量级的 DOM 表示形式，用来模拟真实 DOM 的结构和状态。当需要更新 UI 时，优先修改虚拟 DOM，而不是直接操作真实 DOM。框架（如 React）会通过高效的算法对比虚拟 DOM 的前后状态（称为 diff 算法 ），找出最小的变化集合，然后将这些变化批量应用到真实 DOM 上。这种方式可以显著减少直接操作真实 DOM 的次数，从而提升性能。

## React Diff 和 Vue Diff 的实现机制是怎样的？有什么不同？

React 和 Vue 的 diff 算法都旨在高效更新 DOM，但实现方式有显著差异。

React 的 diff 算法基于虚拟 DOM，核心是层级比较：**同一层级节点逐个对比，跨层级直接替换**，依赖 `key` 匹配节点，列表对比是单向（从左到右）的。例如，列表头部插入元素时，React 可能触发全量移动操作。

Vue 的 diff 算法同样基于虚拟 DOM，但优化了列表对比策略。例如 Vue2 采用**双端比较**（头尾同时开始），能更快定位可复用节点，减少 DOM 操作；Vue3 则引入了更高效的静态提升、补丁标志和最长递增子序列优化等。

Vue 在编译阶段会标记静态节点（如不变的 DOM 结构），运行时直接跳过这些节点的对比，而 React 需要手动通过 `React.memo` 或 `shouldComponentUpdate` 优化。响应式机制上，Vue 通过 Proxy 自动追踪依赖，精准触发更新；React 则依赖不可变数据，需手动调用 `setState` 或使用 Hooks 触发更新。

总结来说，React 的 diff 更通用，适合复杂组件逻辑，但需开发者主动优化；Vue 在列表操作和静态内容场景下更高效，尤其适合高频动态列表（如聊天窗口）或含大量静态结构的页面。两者差异源于设计理念：React 强调显式控制，Vue 侧重编译时优化与自动追踪。

## Vue2 和 Vue3 的 Diff 存在哪些差异？

Vue2 的 diff 算法基于传统的双端比较策略（双指针算法），Vue3 的 diff 算法引入了更高效的静态标记和最长递增子序列优化。具体包括：

- 静态提升（Static Hoisting）：Vue3 在编译阶段会将静态节点提取出来，避免每次渲染时重复创建虚拟 DOM 节点。静态节点直接跳过 diff 过程，从而大幅减少计算量。
- Patch Flags（补丁标志）：Vue3 引入了 Patch Flags 来标记动态内容的变化类型（如文本、属性、样式等），从而精确地定位需要更新的部分。
- 最长递增子序列优化：在处理列表更新时，Vue3 使用了最长递增子序列算法来优化节点的移动操作。

## React 中没有 key 会怎样？此时会怎么 Diff？如果用 index 做 key 会怎么样，举个例子

## 讲一讲 React 和 Vue 有哪些区别？

React 和 Vue 的核心区别主要体现在 **设计哲学** 上，这直接导致了不同的 **开发体验**。

1. **视图编写方式**：
   - **React 推崇 `JSX`**，主张“**All in JavaScript**”，将渲染逻辑和 UI 标签耦合在组件内，追求极致的编程灵活性和表现力。
   - **Vue 推崇 `模板`**，基于经典的 HTML，通过指令（如 `v-if`, `v-for`) 增强，更符合传统 Web 开发者的直觉，实现了**关注点分离**。

2. **数据与状态管理**：
   - **React 遵循严格的 `单向数据流` 和 `Immutable` 原则**。状态是不可变的，更新必须使用 `setState` 或 `useState` 的 setter 函数**生成一个新状态来替换旧状态**。这样设计简化了状态变化的追踪，利于性能优化和调试。
   - **Vue 基于 `响应式` 系统**（Vue2: `Object.defineProperty` / Vue3: `Proxy`）。数据是“可变的”，修改属性值会自动触发视图更新。其内置的 `v-model` 提供了便捷的**语法糖**来实现双向绑定，降低了表单处理的复杂度。

3. **框架与生态**：
   - **React 是一个专注的“库”**，核心只解决 UI 渲染问题。路由、状态管理等都需要依靠社区生态（如 React-Router, Redux, Zustand）。这提供了**极大的选择自由**，但也增加了技术选型和整合的复杂度。
   - **Vue 是一个“渐进式框架”**。其核心库就包含路由、状态管理（Vuex/Pinia）等官方解决方案，开箱即用，集成度更高。您可以轻松地从一个核心库开始，逐步引入其他官方工具，最终构建一个完整的前端框架。

4. **学习曲线与灵活性**：
   - **Vue 的 API 和模板设计更直观**，对初学者和从 jQuery 转型的开发者更为友好，**上手更快**。
   - **React 的学习曲线更陡峭**，需要先理解 JSX、Immutable、函数组件和 Hooks 等概念。但一旦掌握，其**函数式的编程模型提供了更大的灵活性和可控性**，尤其在构建大型复杂应用时。

Vue 通过约定和官方套件提供了更 **结构化** 和 **易于上手** 的体验；而 React 通过其极简的 API 和强大的生态系统提供了更高的 **灵活性和自由度**。

## 使用 React 时，有时依赖项数组没有填写正确会导致问题。为什么会出问题？Vue 中为什么不需要填写依赖项数组？

在 React 中，依赖项数组的**核心问题**源于其**显式声明依赖**的设计：如果漏掉依赖项，会导致**闭包过时**（如引用旧状态）、**性能问题**（冗余渲染）或**逻辑错误**（未正确响应数据变化）。React 需要开发者手动管理依赖关系，以确保副作用（如 `useEffect`）在正确时机执行。

而 Vue 的响应式系统通过 **Proxy（Vue 3）或 Object.defineProperty（Vue 2）自动追踪依赖**，无需手动填写依赖数组。当响应式数据被读取时，Vue 会**自动记录依赖关系**，并在数据变化时触发更新（如组件重新渲染或 `watchEffect` 执行）。这种**隐式依赖收集机制**减少了人为错误，但牺牲了对依赖关系的显式控制。

## 前端 React 组件发生异常时，如何捕获并处理？

在 React 中，可以使用错误边界（Error Boundaries）来捕获和处理组件中的异常。

错误边界是一个特殊的 React 组件，它可以 *捕获子组件树中的 JavaScript 错误*，记录它们，并显示回退 UI，而不是让这些错误导致整个应用崩溃。

错误边界的重要性：

- **提升用户体验**：避免整个应用因局部错误白屏或崩溃，借助通过友好的错误提示，可以引导用户
- **增强应用健壮性**：隔离错误，防止错误蔓延
- **便于追踪与修复**：可以在错误边界中集成错误上报机制

错误边界组件可以使用 **`componentDidCatch(error, errorInfo)` 生命周期方法** 或 **`getDerivedStateFromError(error)` 静态方法** 来实现（在类组件中）；也可以使用 `react-error-boundary` 库来方便地创建错误边界组件（更适用于函数组件的场景中）。具体参考：[使用错误边界捕获渲染错误 - React 中文文档](https://zh-hans.react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## 前端 Vue 组件发生异常时，如何捕获并处理？

在 Vue 中，异常捕获主要通过两种机制实现：全局错误处理器和组件内的 `errorCaptured` 钩子，这为我们提供了从宏观到微观的全面错误处理能力。

1. **全局错误处理器 (`app.config.errorHandler`)**:
    这是捕获 Vue 应用内所有组件运行时错误的“兜底”方案。通过在应用初始化时定义一个全局的 `errorHandler` 函数，任何未经处理的、源自组件渲染或生命周期钩子的同步错误都会被这个函数捕获。这非常适合进行统一的错误上报、日志记录或向用户显示通用的错误提示。

    ```javascript
    import { createApp } from 'vue'
    const app = createApp(...)

    app.config.errorHandler = (err, instance, info) => {
      // err: the error object
      // instance: the component instance that triggered the error
      // info: a Vue-specific error info string, e.g. "render function"

      // Example: Report error to a tracking service
      ErrorService.capture(err, { component: instance.$options.name, info });
    }
    ```

    需要注意的是，`errorHandler` **无法捕获异步错误**（如 `setTimeout`、`Promise.catch` 或网络请求回调中的异常），这些需要在相应的异步代码块中使用 `try...catch` 手动处理。

2. **`errorCaptured` 生命周期钩子**:
    `errorCaptured` 钩子则提供了更精细的、组件级别的错误处理能力。一个父组件可以通过这个钩子捕获其**所有后代组件**（不包括自身）抛出的同步和异步错误。这使得我们可以实现更具针对性的“错误边界”（Error Boundary）模式，类似于 React 的 `componentDidCatch`。

    当 `errorCaptured` 钩子被触发时，它可以：
    - **处理错误**：记录日志，或根据错误类型显示不同的降级 UI。
    - **决定是否向上传播**：如果钩子返回 `false`，它将阻止错误继续向上冒泡到更上层的 `errorCaptured` 钩子或全局 `errorHandler`。这赋予了我们精确控制错误传播路径的能力。

    ```vue
    <script setup>
    import { ref, errorCaptured } from 'vue'

    const hasError = ref(false)

    errorCaptured((err, instance, info) => {
      console.error('Caught error in child component:', err.message);
      hasError.value = true;

      // Return false to prevent the error from propagating further
      return false;
    });
    </script>

    <template>
      <div v-if="hasError">
        <p>Something went wrong with one of our components. Please try again later.</p>
      </div>
      <div v-else>
        <slot></slot> <!-- Child components go here -->
      </div>
    </template>
    ```

通过组合使用这两种机制，我们可以构建一个既能全局兜底、又能局部优雅降级的健壮的错误处理系统。

## 如何设计一个 React Hook，每次调用，返回上次传入的参数？

```jsx
import { useRef } from 'react';

function usePrevious(value) {
  const ref = useRef();
  const previous = ref.current;
  ref.current = value;
  return previous;
}
```

## React Router 中的 `Link` 组件和 `a` 标签有什么区别？

- `Link` 组件是 React Router 提供的组件，用于在单页应用中实现页面跳转，它会通过 `history` 对象来实现页面跳转，不会重新加载页面，只会更新 URL 和渲染对应的组件。
- `a` 标签是 HTML 提供的标签，用于在页面中跳转到其他页面，会重新加载页面，不适用于单页应用。

在单页应用中，应该使用 `Link` 组件来实现页面跳转，而不是使用 `a` 标签。

## Vue 中的 `v-if` 和 `v-show` 有什么区别？

- `v-if`：根据表达式的真假值，切换元素的显示状态，当表达式为 `false` 时，元素不会被渲染到 DOM 中。
- `v-show`：根据表达式的真假值，切换元素的显示状态，当表达式为 `false` 时，元素会被渲染到 DOM 中，只是通过 CSS 的 `display` 属性来控制元素的显示和隐藏。

一般来说，当需要频繁切换元素的显示状态时，应该使用 `v-show`，因为它只是通过 CSS 来控制元素的显示和隐藏，不会频繁地添加和删除 DOM 元素，性能更好。而当元素的显示状态不经常变化时，应该使用 `v-if`，因为它会根据表达式的真假值来决定是否渲染元素到 DOM 中，可以减少不必要的 DOM 元素。

## 介绍一下 React 的常用 Hooks

React Hooks 是 React 16.8 引入的特性，它允许你在不编写 class 的情况下使用 state 以及其他的 React 特性。以下是一些最常用的 Hooks：

### 基础 Hooks

1. **`useState`**: 这是最基础的 Hook，用于在函数组件中添加和管理**状态（state）**。它返回一个状态值和一个更新该状态的函数。调用更新函数会触发组件的重新渲染。

    ```jsx
    const [count, setCount] = useState(0);
    ```

2. **`useEffect`**: 用于处理**副作用（side effects）**，如数据获取、订阅、或手动操作 DOM。它接收一个函数作为参数，该函数在每次组件渲染后执行。通过提供第二个参数（依赖项数组），可以控制副作用的执行时机，实现类似于 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 的生命周期功能。

    ```jsx
    useEffect(() => {
      document.title = `You clicked ${count} times`;
    }, [count]); // Only re-run the effect if count changes
    ```

3. **`useContext`**: 用于在组件树中进行**跨层级的数据传递**，避免了“属性逐层传递（prop drilling）”的繁琐。它接收一个由 `React.createContext` 创建的 context 对象，并返回该 context 的当前值。

    ```jsx
    const theme = useContext(ThemeContext);
    ```

### 额外 Hooks

1. **`useReducer`**: `useState` 的替代方案，更适合管理包含多个子值的**复杂状态逻辑**。它接收一个 reducer 函数和初始状态，并返回当前状态和一个 `dispatch` 函数，用于触发状态更新。这种模式在 Redux 等状态管理库中非常常见。

    ```jsx
    const [state, dispatch] = useReducer(reducer, initialState);
    ```

2. **`useCallback`**: 用于**记忆化（memoize）回调函数**。它返回一个记忆化的函数版本，只有当其依赖项之一发生变化时，该函数才会更新。这在将回调传递给依赖于引用相等性的优化子组件时非常有用，可以避免不必要的重新渲染。

    ```jsx
    const memoizedCallback = useCallback(() => {
      doSomething(a, b);
    }, [a, b]);
    ```

3. **`useMemo`**: 用于**记忆化计算结果**。它会在每次渲染时执行一个函数并返回其结果，然后将该结果缓存起来。只有当其依赖项之一发生变化时，它才会重新计算。这对于避免在每次渲染时都进行高开销的计算非常有用。

    ```jsx
    const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
    ```

4. **`useRef`**: 返回一个可变的 **ref 对象**，其 `.current` 属性被初始化为传入的参数（initialValue）。`useRef` 创建的 ref 对象在组件的整个生命周期内保持不变。它主要有两个用途：
    - **访问 DOM 元素**：将 ref 对象附加到渲染元素的 `ref` 属性上，就可以命令式地访问该 DOM 节点。
    - **存储任意可变值**：类似于在 class 中使用实例字段，可以用来存储任何不希望触发重新渲染的可变数据。

    ```jsx
    const inputEl = useRef(null);
    ```

这些 Hooks 的组合使用，构成了现代 React 函数式组件开发的基石，使得开发者能够以更简洁、更直观的方式构建功能强大且高效的 UI。

## 介绍一下 React 运行时的更新流程

核心：Batch Update 和 Concurrent Rendering

1. **触发更新：** 事件处理、Hooks 调用、异步回调里执行 setState 或 dispatch。
2. **调度阶段（Scheduler）:** 浏览器每帧剩余时间片内，React 把多个更新任务合并（Batch），按优先级排队。
3. **渲染阶段（Render / Reconcile）:** 生成新的 Virtual DOM，与旧树进行 Diff，标记需要变动的 Fiber 节点。可中断：高优任务到来时，当前渲染可让出主线程
4. **提交阶段（Commit）:** 一次性把差异 patch 到真实 DOM，触发 useLayoutEffect → 浏览器绘制 → useEffect

这意味着，两次快速的 setState，只要它们发生于同一事件循环中，那它们就只会触发一次渲染。

## 介绍一下 React 的调度器

React 的调度器（Scheduler）是 React 实现**高效响应式更新**的核心机制之一，主要解决传统同步渲染导致的页面卡顿问题。

它基于 **Fiber 架构**(TODO............)，将渲染任务拆分成小单元，在浏览器的空闲时间中逐步执行，实现**可中断、可暂停、可优先级调度**的并发更新。

### 核心能力

1. **任务分片**：把更新工作拆成小块，避免长时间占用主线程。
2. **优先级调度**：根据用户交互紧急程度分配优先级，比如：
   - 用户输入（高优先级）
   - 数据更新（中优先级）
   - 过渡动画或后台任务（低优先级）
3. **空闲时间执行**：利用 `MessageChannel` 等机制，在每帧的空闲时间执行任务，保证页面流畅。
4. **支持并发模式**：通过 `startTransition` 等 API，让某些更新“可延迟”，提升响应性。

### 典型应用场景

- 用户输入时不卡顿
- 大量数据更新时仍保持交互响应
- 自动批处理异步状态更新（React 18 新特性）

## React 和 Vue 中，父子组件间如何双向通信？兄弟组件呢？

父子组件间，React 可以使用 props 和回调函数；Vue 可以使用 `v-model`，本质上是 props 和 emit 的语法糖。

兄弟组件无法直接通信，可以通过状态提升（将共享状态提升到父组件，再通过 props 传递）、全局状态管理来实现（例如 React 直接使用 Context 或引入 Redux、Zustand 等，Vue 引入 Pinia 等）。

## 为什么需要全局状态管理？具体介绍一下 React 中的全局状态管理

## React 中父组件如何调用子组件的方法？

useImperativeHandle + forwardRef

## Vue 中的计算属性和方法有什么区别？

计算属性（Computed）和方法（Method）的核心区别在于：计算属性会基于其响应式依赖进行缓存，而方法每次调用都会重新执行。

## 简单说明 Vue 和微信小程序中的 nextTick 是什么，以及它们的主要区别

它们都用于在渲染完成后执行代码，具体而言：

- **Vue**：数据变化后，DOM 不会马上更新。nextTick 让你在 DOM 更新完成后执行代码。（数据变 → 等 DOM 更新 → nextTick 干活）
- **小程序**：setData 后，页面不会马上渲染。nextTick 让你在页面渲染完成后执行代码。（setData → 等页面渲染 → nextTick 干活）

```javascript
// Vue 2
this.$nextTick(() => {
  // DOM 更新完了
})

// Vue 3
import { nextTick } from 'vue'
nextTick(() => {
  // DOM 更新完了
})

// 微信小程序
wx.nextTick(() => {
  // 页面渲染完了
})
```

| 区别点 | Vue | 小程序 |
|--------|-----|--------|
| **用途** | DOM 更新后干活 | 页面渲染后干活 |
| **API** | Vue 自带 | wx 提供 |
| **场景** | 操作更新后的 DOM | 获取更新后的页面数据 |

## Vue 生命周期

## 介绍一下 React 中的代码分割（Code Splitting）

**代码分隔**，就是将代码从单个巨大的 bundle 拆分为多个小 chunks。这些小块可以 **按需** 或 **并行** 加载。

代码分割可以带来以下好处：

- **提升初始加载速度**：用户首次访问时，只需下载运行首页所需的最小代码
- **改善应用性能**：更小的代码包意味着更快的解析和执行时间
- **优化用户体验（UX）**：减少等待时间，应用响应感觉上更快
- **节省带宽**：对低端设备（移动端设备）、弱网环境更友好

React 中可以借助 `React.lazy()` 和 `<Suspense>` 来实现代码分割：

```jsx
const LazyComponent = React.lazy(() => import('./LazyComponent'));
const App = () => (
      {/* Suspense 的 fallback 属性接受一个 React 元素，在组件加载过程中显示 */}
      <Suspense fallback={<div>加载中...</div>}>
        <LazyComponent />
      </Suspense>
  );
}
```

典型场景是基于路由的代码分割：

```jsx
const HomePage = React.lazy(() => import("./routes/HomePage"));
const AboutPage = React.lazy(() => import("./routes/AboutPage"));
```

最佳实践：

- 正确选择分割点：例如基于路由，以及对于用户交互后才显示的 UI 组件（如模态框）
- 加载状态：为 Suspense 的 fallback 提供良好的回退 UI
- 错误处理：动态导入可能由于网络等原因失败，可以使用 Error Boundaries 包裹懒加载组件及其 Suspense
- 避免过度分割：过多的 chunks 可能导致 HTTP 请求开销增加

## React 动画方案

CSS 动画：[React Transition Group](https://reactcommunity.org/react-transition-group/)
JS 方案：Framer Motion、React Spring
其他：GSAP、Animation.css

---

对于 **简单的、非交互式** 的进出场动画，比如通知或 Modal 的淡入淡出，可以首选 React Transition Group 搭配 CSS，因为它最轻量，且能满足需求。

对于大部分 **通用的 UI 动画和手势交互**，比如卡片 Hover、点击缩放、拖拽等，我会选择 Framer Motion。它的声明式 API 非常高效，能快速实现现代化的动画效果。

如果一个动画需要 **极致的自然感和物理感**，或者需要 **响应用户的连续、快速的交互**，比如一个可以被随意拖拽、甩动的卡片，可以使用 React Spring。它的物理模型能创造出无法被简单曲线模拟的真实动态。

## `@vueuse/motion` 和 GSAP，这两种动画库的适用场景有什么不同？

适用场景上：

- `@vueuse/motion` 适合元素入场/出场过渡、简单交互反馈等轻量级动画。它和 Vue 的集成度很高，通过在元素上添加 `v-motion` 就可设置简单动画。例如，我使用该库实现的功能是随着滚动，列表中的元素缓入场景。
- GSAP 适合更复杂的、要求精细时间轴控制的动画，或者是滚动驱动动画。例如，我使用该库实现的功能是视频元素从局部到全屏的渐进式缩放，主要使用了 GSAP 的 `ScrollTrigger`。

为了优化其性能：

- 使用 `transform:scale()` 代替 `width/height` 变更，利用 GPU 加速
- 使用 `ScrollTrigger` 替代原生的 `scroll` 事件，因为它内部集成了节流和 RAF（`RequestAnimationFrame`）优化
- 视频元素添加 `preload="auto"`
- 使用 `will-change: transform` 提前告知浏览器优化策略
