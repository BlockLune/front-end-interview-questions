---
title: 场景题
---

## 如果让你设计一个前端告警系统，你会如何设计？

核心目标：**实时监测** 前端应用的运行状态，**及时捕获** 异常情况，并通过合适的方式 **通知** 相关人员，以便快速响应和解决问题。

- **数据采集层**：负责收集前端应用中的各类异常和性能数据。前端可能遇到的错误类型有很多，比如 *JavaScript 运行时错误*、*资源加载失败（比如 404 的图片或脚本）*、*API 请求异常（比如 500 错误）*。另外，性能问题比如 *页面加载时间过长*、*首屏渲染卡顿* 也需要监控。可能还需要*埋点记录用户行为路径*，比如*某个按钮点击后没有触发预期操作*，这时候结合用户行为数据更容易定位问题。这些问题的相关信息可以通过 *全局错误监听（`window.onerror`、`window.addEventListener('error')`）*、*Promise 异常捕获（`window.addEventListener('unhandledrejection')`）*、*接口请求拦截（axios/fetch 拦截器）*、*性能 API（Performance、Resource Timing 等）* 等方式获取
- **数据上报层**：不能直接用同步的 `XMLHttpRequest`，这样可能阻塞页面。可能需要用**Beacon API**异步发送，或者在错误发生时先存到本地缓存，等页面空闲时再批量上报。还要考虑**采样率**，比如不是所有错误都 100%上报，可以设置 50%采样率减少服务器压力，但关键错误比如页面崩溃必须全量上报。
- **数据处理层**：对采集到的数据进行清洗、聚合和分析。针对不同的异常，需要进行分类、分级。可能需要实现一个聚合的看板，用以主动查看场景，使各种异常足够直观。
- **告警通知层**：根据预设规则触发告警并通知相关人员，针对不同分级的异常，需要采用不同的通知策略。

**告警触发规则**方面，比如某个错误在 1 分钟内出现超过 100 次就触发告警，或者某个 API 的失败率突然比过去 1 小时平均值高 3 倍。这里可能需要**动态阈值**，比如根据历史数据自动调整基准线，避免固定阈值在流量波动时误报。

最后得考虑**容灾设计**，比如上报服务器挂了怎么办？可能需要降级策略，比如暂时把上报数据存在 localStorage，等服务恢复后再重试。或者设计多级上报通道，优先用 Beacon，失败时改用图片 Ping 等备用方案。

整个系统需要和运维的监控平台打通，可能还要考虑**版本关联**，比如某个错误只在特定前端版本出现，方便快速定位代码变更。测试阶段可以用 Sentry 这类工具做对比验证，确保核心上报逻辑可靠。

## 假设你正在开发一个支持多主题的 Web 应用，需要实现一个“主题切换”功能，支持切换背景色、文字颜色、字体类型与大小、背景图片等，说说你会如何设计这个功能的实现方案

首先，我们需要明确主题切换功能的核心目标：**允许用户根据个人偏好或系统环境**，动态切换应用的外观样式，包括背景色、文字颜色、字体类型与大小、背景图片等，同时**保证切换过程流畅**，并且**不影响应用的性能和用户体验**。

**主题定义**方面，我会采用 CSS 变量（自定义属性）来定义主题的核心样式属性。这种方式的好处是可以在运行时动态修改，而不需要重新加载页面或样式表。每个主题可以定义为一个包含特定值的变量集合：

```css
:root {
  /* 默认主题 */
  --primary-bg-color: #ffffff;
  --primary-text-color: #333333;
  --primary-font-family: 'Arial', sans-serif;
  --primary-font-size: 16px;
  --primary-bg-image: none;
}

/* [data-theme="..."] 是 CSS 属性选择器 */

[data-theme="dark"] {
  /* 暗色主题 */
  --primary-bg-color: #1a1a1a;
  --primary-text-color: #f0f0f0;
  --primary-font-family: 'Arial', sans-serif;
  --primary-font-size: 16px;
  --primary-bg-image: none;
}

[data-theme="nature"] {
  /* 自然主题 */
  --primary-bg-color: #f5f5dc;
  --primary-text-color: #2d5016;
  --primary-font-family: 'Georgia', serif;
  --primary-font-size: 16px;
  --primary-bg-image: url('/images/nature-bg.jpg');
}
```

```html
<div data-theme="dark">这是一个暗色主题的区域</div>
```

**主题切换机制**方面，我会设计以下几种切换方式：

1. **手动切换**：用户通过界面上的主题选择器（如下拉菜单、按钮组）主动切换主题
2. **自动切换**：根据系统设置（如深色/浅色模式）自动切换
3. **定时切换**：根据时间（如日间/夜间）自动切换
4. **条件切换**：根据特定条件（如用户角色、访问设备）切换主题

**实现方案**上，我会考虑以下几个技术要点：

- **状态管理**：使用 JavaScript 管理当前主题状态，可以使用简单的全局变量，也可以集成到应用的状态管理系统中（如 Redux、Pinia 等）

  ```javascript
  // 主题管理器示例
  const ThemeManager = {
    currentTheme: 'default',

    setTheme(themeName) {
      this.currentTheme = themeName;
      document.documentElement.setAttribute('data-theme', themeName);
      localStorage.setItem('selectedTheme', themeName);

      // 触发自定义事件，通知其他组件主题已更改
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
    },

    init() {
      // 从本地存储获取用户之前选择的主题
      const savedTheme = localStorage.getItem('selectedTheme') || 'default';
      this.setTheme(savedTheme);

      // 监听系统主题变化
      if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addListener((e) => {
          if (localStorage.getItem('selectedTheme') === 'auto') {
            this.setTheme(e.matches ? 'dark' : 'default');
          }
        });
      }
    }
  };

  // 初始化主题管理器
  ThemeManager.init();
  ```

- **样式应用**：使用 CSS 变量定义主题样式，并在组件样式中引用这些变量

  ```css
  .component {
    background-color: var(--primary-bg-color);
    color: var(--primary-text-color);
    font-family: var(--primary-font-family);
    font-size: var(--primary-font-size);
    background-image: var(--primary-bg-image);
  }
  ```

- **持久化存储**：使用 localStorage 或 IndexedDB 保存用户的主题选择，确保下次访问时保持一致

- **动态加载**：对于大型主题或包含大量图片的主题，可以采用动态加载的方式，按需加载主题资源

**高级功能**方面，我会考虑以下增强特性：

- **主题自定义**：允许用户自定义主题属性，创建个性化主题

  ```javascript
  // 主题自定义示例
  function createCustomTheme(themeOptions) {
    const themeName = 'custom-' + Date.now();
    const style = document.createElement('style');

    let css = `[data-theme="${themeName}"] {`;
    for (const [property, value] of Object.entries(themeOptions)) {
      css += `--${property}: ${value};`;
    }
    css += '}';

    style.textContent = css;
    document.head.appendChild(style);

    return themeName;
  }
  ```

- **主题预览**：在应用主题前提供预览功能，让用户先看到效果再决定是否应用

- **主题导入/导出**：支持将自定义主题导出为配置文件，或导入他人分享的主题

- **主题过渡动画**：在主题切换时添加平滑的过渡效果，提升用户体验

  ```css
  * {
    transition: background-color 0.3s ease, color 0.3s ease, background-image 0.3s ease;
  }
  ```

- **响应式主题**：根据设备类型或屏幕尺寸自动调整主题样式

**性能优化**方面，我会考虑以下措施：

- **样式缓存**：将常用主题的 CSS 文件缓存到本地，减少网络请求
- **按需加载**：只加载当前主题和即将使用的主题资源
- **图片优化**：对主题中的背景图片进行压缩和适当尺寸调整
- **CSS 分割**：将主题相关的 CSS 分割成独立文件，便于浏览器缓存

**兼容性处理**方面，我会考虑以下问题：

- **浏览器兼容性**：对于不支持 CSS 变量的旧浏览器，提供降级方案，如使用类名切换
- **无障碍访问**：确保主题切换功能对所有用户都可访问，包括使用屏幕阅读器的用户
- **打印样式**：为打印场景提供专门的主题样式

**测试验证**方面，我会进行以下测试：

- **功能测试**：验证主题切换功能是否正常工作
- **性能测试**：测试主题切换对页面性能的影响
- **兼容性测试**：在不同浏览器和设备上测试主题显示效果
- **用户体验测试**：收集用户对主题切换功能的反馈，持续优化

这样的主题切换功能设计既考虑了基本功能的实现，又提供了丰富的扩展性和良好的用户体验，能够满足大多数 Web 应用的主题切换需求。

## 如果要你设计一个组件库，你会如何设计？

## 如何优化一个长列表的渲染性能？

长列表的性能瓶颈：

- **DOM 节点过多**：浏览器需要创建和维护大量 DOM 元素，内存占用显著增加，布局计算（Layout）和绘制（Paint）负担加重
- **React 协调成本**：：`render` 函数执行时间变长；Diff 算法在大量节点间比较，效率降低；频繁地更新可能导致掉帧，用户体验差

---

**虚拟列表** 技术：

- 核心思想：只渲染视口（Viewport）内可见的列表项
- 按需渲染：当用户滚动列表时，动态计算并渲染新的可见项，移除已经移出视口的列表项
- 视觉欺骗：通过精确计算和占位，让用户感觉整个列表都已经加载，但实际上 DOM 中只存在少量元素

TODO: ...
