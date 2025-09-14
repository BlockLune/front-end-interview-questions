---
title: 设计模式和经验
---

## 请简述面向过程、面向对象和函数式编程的核心思想及主要区别

1. 面向过程编程 (Procedural Programming)
   - **核心思想：** 程序是一系列顺序执行的指令集合，核心是函数。关注“如何做”的步骤。
   - **特点：** 数据与函数分离。数据通常为全局变量，函数对其进行操作。采用“自顶向下”的设计方法，将大问题分解为多个小函数来解决。

2. 面向对象编程 (Object-Oriented Programming)
   - **核心思想：** 程序是由相互作用的对象组成。核心是类和对象。关注“谁”来做。
   - **特点：** 通过“封装”将数据和对数据的操作（方法）绑定在对象内部。通过“继承”实现代码复用，通过“多态”实现接口的统一调用。

3. 函数式编程 (Functional Programming)
   - **核心思想：** 程序是数学函数的求值过程。核心是函数。关注“做什么”而不是“如何做”。
   - **特点：** 强调“纯函数”（相同输入永远得到相同输出，且无副作用）和“不可变性”（数据创建后不修改，只生成新数据）。函数是“一等公民”，可作为参数和返回值。

| 方面 | 面向过程 (PP) | 面向对象 (OOP) | 函数式 (FP) |
| :--- | :--- | :--- | :--- |
| **程序组成** | 函数 | 对象 | 函数 |
| **设计焦点** | 步骤与流程 | 数据与交互 | 数据映射与转换 |
| **数据管理** | 数据与函数分离 | 数据与方法封装在对象内 | 数据不可变，由纯函数操作 |
| **核心概念** | 函数调用 | 类、对象、继承、多态 | 纯函数、高阶函数、递归 |
| **典型语言** | C, Fortran | Java, C++ | Haskell, Scala |

## 你在实习中提到基于 PNPM Workspace 的 monorepo 管理，能分享一个具体的依赖管理案例吗？

当然。在实习期间，我负责维护一套包含多个小程序组件的 `monorepo` 仓库。这个仓库里有一个 `shared-utils` 包，专门提供被多个组件（如 `Component-A`, `Component-B`）共同依赖的工具函数。同时，每个组件都有自己的 `devDependencies`，例如 `Component-A` 使用了 `Gulp` 进行构建。

通过 PNPM Workspace，我们这样来管理依赖：

1.  **提升（Hoist）通用开发依赖**：像 `TypeScript`、`ESLint`、`Vitest` 这类所有包都会用到的开发依赖，我们会使用 `-w` 标志将它们安装到**根目录**的 `node_modules` 中。例如，运行 `pnpm add typescript -D -w`。这样做的好处是**避免了在每个组件包里都重复安装一遍**，极大地节省了磁盘空间和安装时间。由于 PNPM 的符号链接机制，每个子包都能像本地安装了一样访问到根级的 `typescript`。

2.  **隔离项目特定依赖**：`Component-A` 需要 `Gulp`，但 `Component-B` 不需要。这种情况下，我们会进入 `packages/component-a` 目录，然后运行 `pnpm add gulp -D`。这个依赖就**只会安装在 `Component-A`自己的 `devDependencies`** 中，并且它的二进制文件（如 `gulp` CLI）也只会在 `Component-A` 的 `node_modules/.bin` 中可用。这保证了项目依赖的**隔离性**，避免了不必要的依赖膨胀。

3.  **管理内部包依赖**：当 `Component-A` 需要使用 `shared-utils` 里的函数时，我们不是通过相对路径（`../../shared-utils`）去引用，而是在 `Component-A` 的 `package.json` 中，像引用一个普通的 NPM 包一样声明依赖：

    ```json
    "dependencies": {
      "@my-scope/shared-utils": "workspace:*"
    }
    ```

    这里的 `workspace:*` 协议是关键。它告诉 PNPM，这个依赖是一个指向**工作区内最新版本**的引用。在 `pnpm install` 之后，PNPM 会在 `Component-A` 的 `node_modules` 中创建一个指向 `shared-utils` 源代码的**符号链接**。这意味着，当我在 `shared-utils` 中修改了代码并保存后，`Component-A` **无需重新安装或构建，就能立即感知到变更**。这对于本地联调和开发的效率提升是巨大的。

## 你认为 monorepo 解决了什么问题？同时它又会引入哪些新的问题？你是如何解决的？

`Monorepo`（单一代码库）是一种将多个独立项目（packages）的代码存储在同一个代码仓库中的策略。它旨在解决传统 `multirepo`（多代码库）模式下的一些核心痛点。

### Monorepo 解决的问题：

1.  **简化依赖管理**：在 `multirepo` 中，如果一个共享库 `shared-utils` 更新了，所有依赖它的项目都需要手动更新版本并重新发布，流程繁琐且容易出错。在 `monorepo` 中，借助 `pnpm workspace`，所有变更都是原子的。`shared-utils` 的更新可以立即通过符号链接反映到所有消费它的包中，无需发布和安装，本地开发和联调效率极高。

2.  **提升代码复用与一致性**：可以轻松地将通用逻辑（如工具函数、组件库、类型定义、配置）抽取到共享包中。这不仅避免了在不同仓库间复制粘贴代码，更重要的是保证了跨项目编码风格、依赖版本和构建配置的统一。例如，可以将 `ESLint`, `TypeScript` 的配置放在根目录，所有项目共享一份最佳实践。

3.  **原子化的提交与重构**：当一个重构或功能变更需要同时修改多个包时（例如，修改一个 API，需要同时更新服务提供方和消费方），`monorepo` 允许通过一次**原子提交（atomic commit）** 来完成。这保证了代码库在任何一个时间点都处于一致的状态，避免了 `multirepo` 中因不同步更新导致的主干分支构建失败。

4.  **增强协作与可见性**：所有代码都在一个仓库中，团队成员更容易发现和使用已有的共享库，减少了重复造轮子。代码审查（Code Review）也变得更全面，因为审查者可以看到一个变更对整个生态系统的影响。

### Monorepo 引入的新问题及解决方案：

1.  **构建与 CI/CD 复杂性**：当仓库变得庞大时，每次提交都对所有包进行完整的构建和测试，是极其低效且昂贵的。
    *   **解决方案**：引入**增量构建（Incremental Build）**和**影响范围分析（Affected Analysis）**。工具如 [Turborepo](https://turbo.build/repo/docs) 或 [Nx](https://nx.dev/) 能够分析出一次提交具体影响了哪些包（以及依赖这些包的其他包），然后**只对受影响的包执行构建和测试任务**。同时，它们还提供了强大的远程缓存（Remote Caching）能力，团队成员可以共享构建产物，如果一个提交的构建结果已经被其他人计算过，可以直接下载缓存，极大地缩短 CI 时间。

2.  **依赖管理混乱与版本冲突**：虽然 `pnpm` 的符号链接机制解决了大部分问题，但仍然可能出现不同项目依赖了同一个库的不同主版本（e.g., `lodash@3` vs `lodash@4`），导致潜在的运行时问题。
    *   **解决方案**：首先，通过在根 `package.json` 中使用 `pnpm.overrides` 字段，可以**强制将某些依赖项的版本统一**，解决版本冲突。其次，制定严格的代码规范和 Code Review 流程，要求在引入新的第三方依赖时进行充分的评估，避免引入不必要的复杂性。

3.  **权限控制与代码所有权**：在大型组织中，可能不希望所有开发者都能修改所有包的代码。
    *   **解决方案**：虽然 `monorepo` 工具本身不直接提供权限控制，但这可以通过其他方式解决。例如，通过 `CODEOWNERS` 文件（GitHub/GitLab 支持）来指定不同包的代码负责人。当有人提交对某个包的修改时，会自动要求其负责人进行审查，从而实现软性的权限管理。

## 了解在 Yarn 中进行 monorepo 管理吗？它和 PNPM 的 Workspace 存在哪些异同？

了解。Yarn 和 PNPM 都提供了强大的 `workspace` 功能来支持 `monorepo`，它们的核心目标一致：简化多包项目的依赖管理和开发流程。但它们在实现机制、性能和开发者体验上存在显著的异同。

### 共同点：

1.  **工作区协议（Workspace Protocol）**：两者都支持类似 `workspace:*` 的协议。这允许一个包直接引用工作区内的另一个包，工具会自动将其解析为本地的符号链接，极大地提升了本地开发的联调效率。
2.  **根命令**：都支持在根目录通过 `-W` (Yarn) 或 `-w` (PNPM) 标志运行命令，将依赖安装到根 `node_modules`，或在所有子包中执行脚本。
3.  **依赖提升（Hoisting）**：两者都会将子包的共同依赖提升到根部的 `node_modules`，以减少重复安装和磁盘空间占用。

### 不同点：

| 特性 / 维度      | Yarn Workspace (Classic & Berry)                                                                                             | PNPM Workspace                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **依赖管理机制**   | **扁平化（Hoisting）**。Yarn Classic (v1) 会将所有依赖尽可能地提升到根目录，形成一个扁平的 `node_modules` 结构。这可能导致**幻影依赖**（Phantom Dependencies）问题，即项目中可以引用到未在 `package.json` 中声明的包。Yarn Berry (v2+) 引入了 Plug'n'Play (PnP) 模式来解决这个问题，但改变了 `node_modules` 的传统结构，对生态工具的兼容性有一定挑战。 | **符号链接（Symbolic Links）**。PNPM 创建一个**非扁平的、基于符号链接**的 `node_modules` 结构。每个包都有自己独立的 `node_modules` 目录，其中只包含其直接依赖的符号链接，这些链接最终指向一个全局的内容寻址存储区（CAS）。这种方式从根本上**杜绝了幻影依赖**，提供了更严格的依赖隔离。 |
| **磁盘空间效率**   | Yarn Classic 的提升机制有一定效果，但仍可能因为版本冲突等原因导致少量重复。Yarn Berry 的 PnP 模式效率很高。        | **极致的磁盘空间效率**。由于所有版本的每个包都只在全局存储中物理存在一次，其他地方全是符号链接，因此 PNPM 在磁盘空间利用上通常优于 Yarn Classic。 |
| **安装性能**       | Yarn Classic 性能尚可。Yarn Berry 通过 PnP 和持久化缓存，安装速度非常快。                                               | **通常最快**。PNPM 的内容寻址存储和符号链接机制使其在安装、更新依赖时，尤其是处理大型 `monorepo` 时，往往表现出最佳的性能。         |
| **严格性与确定性** | Yarn Classic 较为宽松，容易引入不确定性。Yarn Berry (PnP) 非常严格，但学习曲线和迁移成本更高。                   | **天生严格**。PNPM 的设计哲学就是严格和确定性。开发者无法访问未声明的依赖，这使得构建过程更可靠、可复现。                              |
| **生态兼容性**     | Yarn Classic 兼容性最好。Yarn Berry (PnP) 因为改变了 `node_modules` 的工作方式，部分重度依赖该结构的工具（如某些版本的 React Native）可能需要额外配置或 `workaround`。 | **高兼容性**。虽然 PNPM 的 `node_modules` 结构是嵌套的，但它对外的表现仍然符合 Node.js 的模块解析算法，因此与绝大多数前端工具链（如 Webpack, Vite, antd）都能良好兼容。 |

### 总结与选型考量：

*   **PNPM Workspace** 是目前许多新项目的**首选**。它的**严格性**、**高性能**和**高磁盘效率**使其成为管理现代 `monorepo` 的理想选择，尤其是对于追求稳定、可预测的构建和依赖环境的团队。

*   **Yarn Workspace** 仍然是一个非常成熟和可靠的方案。对于已经深度使用 Yarn 生态的团队，或者对 PnP 带来的严格性和性能提升有特别需求的场景，Yarn Berry 是一个强大的选择。而 Yarn Classic 则更适合需要最大化兼容性的老项目。

## 4. 介绍一下常见的设计原则

- **开闭原则 (The Open-Closed Principle, OCP):** 模块（组件）应该对扩展开放，对修改关闭。
- **里氏替换原则 (The Liskov Substitution Priciple, LSP):** 子类应该能够直接替换基类。
- **依赖倒置原则 (The Dependency Inversion Principle, DIP):** 依赖于抽象，而不是依赖于具体实现。
- **接口隔离原则 (The Interface Segregation Principle, ISP):** 多个客户端专用接口比一个通用接口更好。
- **复用/发布等价原则 (The Reuse/Release Equivalency Principle, REP):** 复用的颗粒度，就是发布的颗粒度。
- **共同闭包原则 (The Common Closure Principle, CCP):** 一起变化的类应放在一起。
- **共同复用原则 (The Common Reuse Principle, CRP):** 不一起复用的类就不应该放在一起（一起复用的类应该放在一起）

## 5. 介绍一下编程中的常用原则

### 0. KISS 原则（Keep It Simple, Stupid）

### 1. DRY 原则（Don't Repeat Yourself）
- **核心思想**：避免重复代码，鼓励抽象和复用。
- **实践方式**：通过函数、类、模块等方式封装重复逻辑。
- **优点**：减少维护成本，提高代码一致性。

### 2. SOLID 原则
这是一组面向对象设计的五大原则，旨在提高代码的可维护性和可扩展性：
- **S - 单一职责原则（SRP）**：一个类应该只有一个职责。
- **O - 开闭原则（OCP）**：软件实体应对扩展开放，对修改关闭。
- **L - 里氏替换原则（LSP）**：子类应该能够替换父类而不影响程序的正确性。
- **I - 接口隔离原则（ISP）**：客户端不应该被迫依赖它们不使用的接口。
- **D - 依赖倒置原则（DIP）**：高层模块不应该依赖低层模块，二者都应该依赖抽象。

### 3. YAGNI 原则（You Aren't Gonna Need It）
- **核心思想**：不要为“将来可能需要”的功能编写代码，只实现当前需要的功能。
- **优点**：避免过度设计，减少代码复杂性。

### 4. 最小惊讶原则（Principle of Least Astonishment）
- **核心思想**：代码的行为应该符合用户的直觉，避免“惊讶”。
- **实践方式**：命名清晰、行为一致、遵循约定。

### 5. 关注点分离（Separation of Concerns）
- **核心思想**：将不同的功能模块化，每个模块只关注自己的职责。
- **实践方式**：分层架构、模块化设计、MVC/MVVM 等模式。

### 6. 高内聚低耦合（High Cohesion, Low Coupling）
- **高内聚**：模块内部的功能应该紧密相关。
- **低耦合**：模块之间的依赖应该尽可能少。
- **优点**：提高代码的可维护性和可测试性。

### 7. 防御性编程（Defensive Programming）
- **核心思想**：预见可能的错误，提前处理。
- **实践方式**：输入验证、异常处理、断言等。

### 8. 约定优于配置（Convention over Configuration）
- **核心思想**：通过约定减少配置，提高开发效率。
- **例子**：Rails、Spring Boot 等框架广泛使用此原则。

### 9. 自文档化代码（Self-Documenting Code）
- **核心思想**：通过清晰的命名和结构，使代码本身易于理解，减少对注释的依赖。
- **实践方式**：使用有意义的变量名、函数名、避免魔法数字等。

### 10. 逐步改进（Incremental Development）
- **核心思想**：通过小步快跑、持续迭代的方式开发软件。
- **实践方式**：敏捷开发、持续集成、持续交付。

## 介绍一下观察者模式 (Observer Pattern) 和发布-订阅模式 (Publish-Subscribe Pattern)。它们各自适用于什么场景？

**观察者模式** 和 **发布-订阅模式** 是两种对象间通信的设计模式，核心区别在于和通信方式。

- **观察者模式**：被观察者直接维护观察者列表，状态变化时同步通知所有观察者。特点是对象间*直接关联*，耦合度较高。应用于 Vue 响应式系统（数据变化触发视图更新）、自定义事件监听（如表单验证）上；
- **发布-订阅模式**：通过事件总线解耦发布者和订阅者，异步或同步转发事件。应用于跨组件通信（如 Vue/React 的全局事件总线）、DOM 事件（如点击、滚动监听）、状态管理（如 Redux / Vuex）。

观察者模式的示例：

```javascript
// 主题对象（被观察者）
class Subject {
  constructor() {
    this.observers = [];
  }

  // 添加观察者
  addObserver(observer) {
    this.observers.push(observer);
  }

  // 移除观察者
  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  // 通知所有观察者
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

// 观察者
class Observer {
  constructor(name) {
    this.name = name;
  }

  update(data) {
    console.log(`${this.name} 收到通知：${data}`);
  }
}

// 使用示例
const weatherStation = new Subject();

const phoneApp = new Observer('手机天气 App');
const webApp = new Observer('网页天气应用');
const tvApp = new Observer('电视天气频道');

// 订阅
weatherStation.addObserver(phoneApp);
weatherStation.addObserver(webApp);
weatherStation.addObserver(tvApp);

// 发布天气更新
weatherStation.notify('今天晴天，温度 25°C');
// 输出：
// 手机天气 App 收到通知：今天晴天，温度 25°C
// 网页天气应用 收到通知：今天晴天，温度 25°C
// 电视天气频道 收到通知：今天晴天，温度 25°C

// 取消订阅
weatherStation.removeObserver(webApp);
weatherStation.notify('明天下雨，温度 18°C');
// 输出：
// 手机天气 App 收到通知：明天下雨，温度 18°C
// 电视天气频道 收到通知：明天下雨，温度 18°C
```

发布订阅模式的例子：

```javascript
// 事件中心（消息代理）
class EventBus {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  subscribe(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 取消订阅
  unsubscribe(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }
  }

  // 发布事件
  publish(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data));
    }
  }
}

// 发布者
class NewsPublisher {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  publishNews(category, news) {
    console.log(`发布${category}新闻：${news}`);
    this.eventBus.publish(category, news);
  }
}

// 订阅者
class NewsSubscriber {
  constructor(name, eventBus) {
    this.name = name;
    this.eventBus = eventBus;
  }

  subscribeToSports() {
    this.eventBus.subscribe('sports', (news) => {
      console.log(`${this.name} 收到体育新闻：${news}`);
    });
  }

  subscribeToTech() {
    this.eventBus.subscribe('tech', (news) => {
      console.log(`${this.name} 收到科技新闻：${news}`);
    });
  }
}

// 使用示例
const eventBus = new EventBus();

// 创建发布者
const newsAgency = new NewsPublisher(eventBus);

// 创建订阅者
const user1 = new NewsSubscriber('用户 A', eventBus);
const user2 = new NewsSubscriber('用户 B', eventBus);

// 订阅不同类型的新闻
user1.subscribeToSports();
user1.subscribeToTech();

user2.subscribeToSports();

// 发布新闻
newsAgency.publishNews('sports', '足球世界杯决赛结果出炉！');
// 输出：
// 发布 sports 新闻：足球世界杯决赛结果出炉！
// 用户 A 收到体育新闻：足球世界杯决赛结果出炉！
// 用户 B 收到体育新闻：足球世界杯决赛结果出炉！

newsAgency.publishNews('tech', '新款 AI 芯片发布！');
// 输出：
// 发布 tech 新闻：新款 AI 芯片发布！
// 用户 A 收到科技新闻：新款 AI 芯片发布！

newsAgency.publishNews('finance', '股市今日大涨！');
// 输出：
// 发布 finance 新闻：股市今日大涨！
// （没有订阅者，所以没有其他输出）
```

| 特点 | 观察者模式 | 发布订阅模式 |
|------|------------|--------------|
| **耦合度** | 观察者和主题直接耦合 | 发布者和订阅者通过事件中心解耦 |
| **通信方式** | 直接通信 | 间接通信（通过事件中心） |
| **灵活性** | 相对较低 | 更高，支持更复杂的事件处理 |
| **适用场景** | 简单的一对多通知 | 复杂的事件驱动系统 |

## 介绍一下事件总线 Event Bus？

事件总线用于在软件系统中实现组件之间的松耦合通信。它提供了一个集中式的事件分发机制，允许不同的模块或组件通过发布和订阅事件来进行交互，而无需直接依赖彼此。这种模式特别适用于解耦复杂系统中的组件，尤其是在事件驱动架构中。

工作原理：

1. **注册订阅者**：订阅者向 Event Bus 注册自己，并指定感兴趣事件的类型。这通常是通过回调函数或方法实现的。
2. **发布事件**：发布者通过调用 Event Bus 的接口，向总线发送事件。事件的内容可以包括必要的数据。
3. **分发事件**：Event Bus 接收到事件后，根据事件类型找到所有匹配的订阅者，并将事件分发给他们。
4. **处理事件**：订阅者接收到事件后，执行与事件相关的逻辑。

优点：松耦合、灵活性、可扩展性、简化复杂系统的通信
缺点：调试困难、潜在性能问题、难以控制事件流、过度使用造成系统过于依赖事件驱动、降低代码可读性和可控性

## 介绍一下什么是“事件调用”

事件调用就是一种“订阅-通知”机制。当某个特定事件（比如用户点击了按钮）发生时，事先注册好的处理函数（也就是回调函数）会被自动调用执行。

## 如何理解组件的“单一职责原则”？

TODO
