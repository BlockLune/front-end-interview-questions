---
title: 计算机网络
---

## HTTP 状态码有哪些？

HTTP 状态码主要分五类，用 *数字开头* 区分：

- **1xx（信息性状态）**
  - **101 (Switching Protocols)**: 协议切换（比如 WebSocket 升级）

- **2xx（成功）**
  - **200 (OK)**: 操作成功，并将请求的数据返回
  - **201 (Created)**: 资源已创建
  - **204 (No Content)**: 操作成功，但无返回内容
  - **206 (Partial Content)**: 部分内容，用于断点续传

- **3xx（重定向）**
  - **301 (Moved Permanently)**: 永久重定向
  - **302 (Found)**: 临时重定向
  - **304 (Not Modified)**: 资源未修改，配合缓存使用

- **4xx（客户端错误）**
  - **400 (Bad Request)**: 请求错误
  - **401 (Unauthorized)**: 未授权
  - **403 (Forbidden)**: 禁止访问
  - **404 (Not Found)**: 资源不存在
  - **405 (Method Not Allowed)**: 方法不被允许，比如 POST 接口不支持 GET
  - **429 (Too Many Requests)**: 请求太多，触发了速率限制

- **5xx（服务器错误）**
  - **500 (Internal Server Error)**: 内部错误
  - **502 (Bad Gateway)**: 网关错误，比如 Nginx 后端服务挂了
  - **503 (Service Unavailable)**: 服务不可用，常用于限流
  - **504 (Gateway Timeout)**: 网关超时

参考：[HTTP 响应状态码 - HTTP | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status)

## 502 和 504 状态码有什么区别？

- **502 Bad Gateway:** 代理收到 *无效响应*（后端报错或格式不对），需检查后端服务日志和响应格式
- **504 Gateway Timeout:** 代理 *超时未收到* 响应（后端处理慢或网络断），需优化后端性能或调整代理超时配置。

## 讲一讲 HTTP 缓存

HTTP 缓存是提升 Web 性能的核心手段，通过 *减少重复请求和响应，以显著降低延迟、节省带宽并减轻服务器压力*。

HTTP 缓存分为 **强缓存** 和 **协商缓存** 两类，核心区别在于*验证资源有效性时，是否需要向服务器发送请求*。

### 强缓存 (Strong Cache)

浏览器根据服务端在 **响应头** 中设置的以下字段，决定是否 **直接使用本地缓存**（不发送任何请求到服务器）：

- **`Cache-Control`**：HTTP/1.1 开始，推荐使用该字段，例如 `Cache-Control: max-age=3600` 表示资源 1 小时内有效，无需请求服务器（相关请求直接被浏览器截获，浏览器直接返回，在开发者工具中显示为 `200 (from disk cache)`、`200 (from memory cache)` 或类似）。
- **`Expires`**：HTTP/1.0 时期的旧方案，指定一个绝对的过期时间（如 `Expires: Thu, 01 Dec 1994 16:00:00 GMT`），依赖本地时间，优先级低于 `Cache-Control`。

适用于长期不变的静态资源（如 JS/CSS/图片）。

### 协商缓存 (Validation Cache)

协商缓存的核心是“缓存验证”，浏览器*必须发送一次请求到服务器*，由服务器验证资源是否更新：

- **未更新**：返回 **`304 Not Modified`**（不包含消息体），浏览器使用本地缓存。
- **已更新**：返回新资源（`200 OK`）和新缓存规则。

验证方案有两种：

| 角色 | 请求头 | 响应头 | 含义 |
| :--- | :--- | :--- | :--- |
| **时间戳方案** | `If-Modified-Since` | `Last-Modified` | 基于最后修改时间对比 |
| **指纹方案** | `If-None-Match` | `ETag` | 基于文件指纹（哈希/版本号）对比 |

> [!tip]
> `ETag` 的优先级比 `Last-Modified` 更高。

由于有一次网络请求，所以协商缓存会慢于强缓存，但 304 响应仅包含头部（无 body），数据量极小。

适用于资源可能更新，但更新频率低（如 HTML 文件）的场景。

### 实际应用

实际使用时，**静态资源**（如图片、CSS、JS）通常设置长 `max-age`（如一年），并通过**文件名哈希**（如 `style.a1b2c3.css`）确保更新后文件名变化，缓存自动失效；而 **HTML 页面** 通常使用 `Cache-Control: no-cache` 或 `max-age=0` 强制每次使用前都进行验证，避免旧内容残留。

> [!caution]
> **关键区分**：
> - **`no-cache`**：**并非不缓存**，而是可以缓存，但每次使用前**必须**向服务器验证（即走协商缓存流程）。
> - **`no-store`**：**才是真正的不缓存**，禁止存储任何请求和响应的内容，每次都必须从服务器重新获取。

## 请介绍一下 HTTP 状态码 304 的工作过程

HTTP 304 状态码表示“未修改”（Not Modified）。其工作过程如下：

1. **首次请求**：当浏览器第一次请求某个资源（如一个静态文件）时，服务器会正常返回资源（状态码 200），并在响应头中附带一个 `Last-Modified` 时间戳，指明该资源的最后修改时间。
2. **缓存与再次请求**：浏览器将该资源及其 `Last-Modified` 时间存入缓存。当再次需要请求相同资源时，浏览器会在请求头中附带 `If-Modified-Since` 字段，其值即为上一次收到的 `Last-Modified` 时间。
3. **服务器验证**：服务器收到请求后，会比对当前资源的修改时间与 `If-Modified-Since` 的时间：
   - 若资源在此期间未被修改，则返回一个 **304** 状态码（空响应体），告知浏览器缓存仍有效。
   - 若资源已被修改，则正常返回 **200** 及最新的资源内容。
4. **浏览器行为**：若收到 304，浏览器便直接使用本地缓存的内容；若收到 200，则替换旧缓存并使用新资源。

## 介绍一下 HTTP 和 HTTPS 的区别

HTTP（超文本传输协议）是 *无状态* 的应用层协议，主要用于在客户端和服务器之间传输数据。它 *使用明文* 传输，容易受到中间人攻击，数据在传输过程中可能被窃听或篡改。为了解决 HTTP 存在的安全性上的问题，诞生了 HTTPS。它在 HTTP 的基础上增加了 **SSL/TLS** 加密层，提供了数据加密、完整性校验和身份验证。HTTPS 使用证书来验证服务器身份，并通过加密算法保护数据的机密性和完整性。简单而言，区别包括：

- **安全性**：HTTP 是明文传输，HTTPS 是加密传输；
- **端口号**：HTTP 默认使用 80 端口，HTTPS 使用 443 端口；
- **性能**：HTTPS 由于加密和解密过程，相比 HTTP 会稍慢，但现代浏览器和服务器优化了这一点；
- **SEO**：搜索引擎更倾向于 HTTPS 网站，可能会影响排名；
- **证书**：HTTPS 需要申请 SSL 证书，而 HTTP 不需要。

## 什么是 SSL/TLS 协议？

**SSL（Secure Sockets Layer，安全套接层）** 和 **TLS（Transport Layer Security，传输层安全）** 是用于在互联网上保护数据传输安全的加密协议。它们通过加密、身份验证和数据完整性校验等机制，确保客户端（如浏览器）与服务器之间的通信内容不会被窃听、篡改或伪造。

现代系统普遍采用 TLS 协议，而 SSL 因为存在安全漏洞已被弃用。但是 “SSL/TLS” 这个术语仍然经常被用来泛指这类加密协议。

## TLS 的工作过程是怎样的？

取决于 TLS 版本，具体的工作过程存在一些差异。下面是 TLS 1.3 的工作过程：

握手流程（1-RTT）：

1. **ClientHello**
   - 提交支持的密码套件、扩展 （SNI、ALPN 等）
   - 发送随机数和 ECDHE 公钥
2. **ServerHello**
   - 选择密码套件
   - 返回随机数和 ECDHE 公钥
3. **Server → Client**
   - EncryptedExtensions
   - Certificate（服务端证书）
   - CertificateVerify（证明私钥持有）
   - Finished（确认握手参数）
4. **Client → Server**
   - Finished（确认并切换到加密通信）

> [!tip]
> 速记：客户端先发出能力声明与密钥 → 服务端选参数并证明身份 → 双方确认并生成对称密钥 → 切换到加密通信。

> [!note]
> ECDHE 公钥 = TLS 握手时客户端/服务器临时生成并发送的椭圆曲线 Diffie–Hellman 公钥，用来和对方的公钥一起算出共享密钥。

## 相较于 TLS 1.2，TLS 1.3 有哪些区别/优势？

- **握手流程更快**：TLS 1.2 需要 2-RTT 才能完成握手；TLS 1.3 只需要 1-RTT，甚至在特定场景下可以 0-RTT（会话复用时，客户端可以在发 ClientHello 的同时直接发应用数据）
- **移除不安全或过时的算法**：TLS 1.2 支持 RSA、SHA-1 等，而 TLS 1.3 只允许安全、现代的算法（密钥交换使用 ECDHE，对称加密使用 AES-GCM、ChaCha20-Poly1305，哈希使用 SHA-256 / SHA-384）
- **强制前向安全 (Forward Secrecy)**：RSA 不支持前向安全，而 TLS 1.3 移除了 RSA 支持，实现强制前向安全
- **加密范围更广**：TLS 1.2 在握手阶段有很多明文（比如证书信息、算法选择）；TLS 1.3 中，除了最开始的 ClientHello/ServerHello，大部分握手内容（证书、扩展等）都在加密通道里完成，防窃听能力更强
- **流程简化**：TLS 1.3 握手流程复杂，消息类型多；TLS 1.3 对消息进行了合并或移除，流程更清晰

> [!note]
> RTT 是 Round-Trip Time 的缩写，意思是往返时延，指的是数据从客户端向服务端发出，再从 服务器向客户端返回所需要的时间。单位通常是毫秒（ms）。

## 什么是 CA？如何确保证书是受信任的 CA 签发的？

CA 是 **Certificate Authority（证书颁发机构）** 的缩写，是负责 *签发和管理数字证书* 的可信第三方机构。数字证书用于验证实体（如网站、服务器或个人）的身份，并在加密通信中确保数据的完整性和保密性。

为了确保证书是由受信任的 CA 签发的，现代互联网采用了一种基于信任链的机制。信任链始于根证书，它们被内置在操作系统和浏览器本地，被认为是完全可信的。使用根证书可以签发中间证书，进而使用中间证书签发用户证书。

## 在 HTTPS 的情况下，哪些内容是被加密的？

在 HTTPS（HTTP over TLS/SSL）中，**整个 HTTP 会话的内容都是被加密的**，包括：

1. **请求行（Request Line）**: 包括 HTTP 方法（如 `GET`、`POST`）、请求路径（如 `/index.html`）和 HTTP 版本（如 `HTTP/1.1`）。
2. **请求头（Request Headers）**: 包括 `User-Agent`、`Accept`、`Cookie`、`Authorization` 等所有头部字段。
3. **请求体（Request Body）**: 如 POST 请求中的表单数据、JSON 数据、上传的文件等。
4. **响应行（Status Line）**: 包括状态码（如 `200 OK`）和 HTTP 版本。
5. **响应头（Response Headers）**: 包括 `Content-Type`、`Set-Cookie`、`Cache-Control` 等所有头部字段。
6. **响应体（Response Body）**: 包括 HTML、CSS、JavaScript、图片、视频等所有返回内容。

没有被加密的内容包括：

- **IP 地址和端口号**: 目标服务器的 IP 地址和端口号（如 `443`）是暴露的，因为它们用于建立 TCP 连接。
- **域名（SNI）**: 在 TLS 握手阶段，客户端会发送 **SNI（Server Name Indication）**，指明要访问的域名（如 `www.example.com`），这部分在未加密的 TLS 握手初期是可见的（但 TLS 1.3 引入了 **Encrypted SNI** 来隐藏它）。
- **TLS 握手过程的某些元数据**: 如证书信息（服务器提供的公钥证书是公开的，但私钥不会泄露）。

HTTPS 加密的是 **HTTP 层及以上的所有数据**，但 **TCP/IP 层的信息（如 IP、端口）和部分 TLS 握手元数据（如 SNI）是未加密的**。

## 介绍一下 HTTP 1.0、HTTP 1.1、HTTP 2、HTTP 3

### HTTP 1.0

核心特点是 **短连接**，浏览器与服务器每次请求-响应都会建立一个新的 TCP 连接，完成后立即断开。

实现上简单，但效率低下，频繁地建立和断开连接会消耗大量资源和时间。

### HTTP 1.1

- 引入了 **持久连接**：TCP 连接默认不关闭
- **管道化**：在同一个 TCP 连接里面，客户端可以同时发送多个请求
- 新增了更多请求方法（如 `PUT`、`DELETE`）和缓存管理头（如 `ETag`）

存在问题：

- **队头阻塞（Head-of-Line Blocking）**：虽然请求可以一起发送，但服务器必须按顺序返回响应。如果前一个请求处理很慢，就会阻塞后面所有请求的响应。

### HTTP 2.0

- 采用 **二进制** 格式而非文本格式
- **多路复用**，只需一个连接即可实现并行
- **头部压缩**
- **服务器推送**

问题：

- 其底层仍基于 TCP 协议。如果网络层出现丢包，TCP 的重传机制会导致所有流（Stream）被阻塞，这被称为 **TCP 层的队头阻塞**。

### HTTP 3.0

- 弃用 TCP，改用 **UDP**：使用 Google 开发的 QUIC 协议，该协议在 UDP 基础上实现可靠传输
- 解决队头阻塞：QUIC 协议为每个流（Stream）独立传输，丢包只影响特定的流，而不会阻塞整个连接，彻底解决了队头阻塞问题
- 连接迁移：QUIC 使用连接 ID 而非 IP 地址来标识连接，使得在网络切换（如从 WiFi 切换到 5G）时能保持连接不中断
- 更快的连接建立：QUIC 将加密和握手过程合并，通常只需 0-RTT 或 1-RTT 即可建立安全连接，比 TCP + TLS 更快

## 介绍一下 Web Socket

WebSocket 是一种 *基于 TCP* 的协议，专为 *实时双向通信* 设计。它允许客户端（如浏览器）和服务器之间建立持久的连接，并通过该连接进行高效、低延迟的数据交换。与传统的 HTTP 请求-响应模式不同，WebSocket 提供了 *全双工* 通信能力，即 *双方可以同时发送和接收数据*。

- 持久连接：传统 HTTP 协议是无状态的，每次请求都需要重新建立连接，而 WebSocket 在初次握手后会保持一个长期连接
- 全双工通信：客户端和服务器可以同时发送数据，这使得 WebSocket 非常适合实时性要求高的应用
- 轻量：WebSocket 的头部信息非常小

工作原理：

- 握手阶段：通过一个 HTTP 请求（升级握手）来完成，客户端向服务器发送一个带有 `Upgrade: websocket` 头的 HTTP 请求，如果服务器支持 WebSocket，它会返回 `101 Switching Protocols` 响应
- 数据传输阶段：握手完成后，双方可以通过该连接发送数据帧，格式可以是文本消息（如 JSON）或二进制数据。
- 连接关闭：当通信完成或出错时，任意一方都可以主动关闭连接。此时，双方会交换关闭帧以确保连接被正确终止。

## 介绍一下 SSE

SSE（Server-Sent Events）是一种基于 HTTP 的服务器推送技术，允许服务器主动向客户端发送实时数据流。它实现了单向通信（仅服务器→客户端），适用于需要实时更新的场景（如新闻推送、股票行情、日志监控等）。

客户端实现：

```js
// 创建 EventSource 连接
const eventSource = new EventSource('/sse-endpoint');

// 监听默认事件
eventSource.onmessage = (event) => {
  console.log('默认消息：', event.data);
};

// 监听自定义事件
eventSource.addEventListener('update', (event) => {
  console.log('更新事件：', JSON.parse(event.data));
});

// 错误处理
eventSource.onerror = () => {
  console.error('连接断开，尝试重连...');
};

// 手动关闭连接
// eventSource.close();
```

服务端实现：

```js
const http = require('http');

const server = http.createServer((req, res) => {
  // 设置 SSE 响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*' // 允许跨域
  });

  // 模拟实时推送
  const interval = setInterval(() => {
    const data = {
      time: new Date().toISOString(),
      value: Math.floor(Math.random() * 100)
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`); // 发送消息
  }, 1000);

  // 客户端断开时清理
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

server.listen(3000, () => {
  console.log('SSE 服务器运行于 http://localhost:3000');
});
```

## 介绍一下流式传输

**流式传输（Streaming）** 指的是，在数据生产和消费的过程中，不需要等数据全部准备好再传输，而是边生成、边传输、边处理的一种方式。和传统的“批处理（Batch Processing）”或“完整文件下载”不同，流式传输强调实时性和连续性。

技术实现方式：

- TCP/UDP socket：最基础的传输方式，长连接持续推送数据
- HTTP chunked encoding：在 HTTP/1.1 中支持分块传输，不需要提前知道总长度
- WebSocket：客户端和服务器保持双向连接，支持持续实时通信
- gRPC streaming：基于 HTTP/2 的流式 RPC 调用

## 介绍一下 TCP/IP 五层参考模型

- **应用层**：提供网络应用服务，数据单位是报文（Message），HTTP/HTTPS、FTP、SMTP、DNS、DHCP、Telnet 等都位于该层。
- **传输层**：为两台主机中的应用进程提供端到端（port-to-port）的逻辑通信；数据单位是报文段（TCP 中）或用户数据报（UDP 中）；负责可靠/不可靠传输、流量控制、复用/分用。核心协议是 TCP（面向连接、可靠、字节流）和 UDP（无连接、尽最大努力交付）。
- **网络层**：把“分组”（Packet）从源主机送到目的主机，跨越多个网络完成寻址、路由选择与拥塞控制。
- **数据链路层**：在相邻节点（一条链路）间可靠地传输“帧”（Frame），完成成帧、差错检测、重传、流量控制和介质访问控制。
- **物理层**：把比特流变成电/光/无线信号在媒介上传输。

## 介绍一下 DNS

DNS（域名系统，Domain Name System） 是互联网的“电话簿”。它的核心功能是将人类可读的域名（如 `www.google.com`）转换为机器可读的 IP 地址（如 `142.251.42.206`），这样计算机才能相互通信。一般而言，它使用 UDP，但如果答案过大，也可能使用 TCP。

DNS 的工作原理（简化版）：

1. 你在浏览器中输入 `www.example.com` 并按回车。
2. 你的计算机会首先检查本地缓存，如果没有记录，会向递归解析器（Recursive Resolver）（通常由你的 ISP 或公共 DNS 服务如 `8.8.8.8` 提供）发送查询请求。
3. 递归解析器会代表你的计算机，从 DNS 体系的根域名服务器开始，逐级查询（`.com` 服务器 -> `example.com` 的权威服务器），直到找到最终的 IP 地址。
4. 递归解析器将 IP 地址返回给你的计算机，并缓存一份副本以备后续使用。
5. 你的计算机获得 IP 地址，然后开始与目标服务器建立连接，加载网页。

## 请解释一下传统 DNS 的主要安全问题，并简要说明 DoT 和 DoH 是如何解决这些问题的，以及它们之间的关键区别是什么？”

**1. 传统 DNS 的问题：**

它就像寄明信片。所有人（如你的 ISP、公共 Wi-Fi 运营商）都能看到你问什么（“`www.google.com` 的地址是啥？”）和回答是啥。这导致**隐私泄露**和**容易被篡改**（DNS 劫持）。

**2. DoT 和 DoH 的解决方案：**

它们都把明信片装进了加密的信封，解决了偷看和篡改的问题。

*   **DoT (DNS over TLS):** 它使用一个**专用的加密管道**（端口 853）。保安（网络管理员）能看到这个管道，但不知道里面具体内容，便于管理。
*   **DoH (DNS over HTTPS):** 它把 DNS 查询伪装成**普通的网页浏览流量**（HTTPS 端口 443）。保安根本看不出你在进行 DNS 查询，隐蔽性更好。

**3. 关键区别：**

主要在于**端口和隐蔽性**。
*   **DoT** 用**专用端口(853)**，容易被识别和管理。
*   **DoH** 用**常用网页端口(443)**，难以被识别和封锁。

## 介绍一下 HTTP 常见的请求头、响应头

一、请求头 （客户端发给服务器的）

1. **`Host`**：**必须的**。告诉服务器我要访问哪个网站。因为一台服务器上可能挂着很多个网站。
2. **`User-Agent`**：告诉服务器我的浏览器和操作系统是什么。服务器有时会根据这个返回电脑版或手机版的页面。
3. **`Content-Type`**：告诉服务器我发过去的请求体（Body）是什么格式。比如是普通的表单 (`application/x-www-form-urlencoded`) 还是 JSON 数据 (`application/json`)。
4. **`Authorization`**：用来证明“我是谁”。里面通常带着用户的身份凭证，比如一个令牌（Token）。
5. **`Cookie`**：每次请求都会自动带上，里面存着一些像用户登录状态这样的小数据，让服务器知道这次请求是谁发起的。

二、响应头 （服务器发给客户端的）

1. **`Content-Type`**：**最重要的响应头**。告诉客户端我返回的数据是什么格式，比如是 HTML 网页 (`text/html`) 还是 JSON 数据 (`application/json`)。浏览器会根据这个来决定如何显示内容。
2. **`Set-Cookie`**：服务器用它来让浏览器保存一些数据（Cookie），比如用户的登录会话 ID，下次请求时浏览器就会自动通过 `Cookie` 头把它带回来。
3. **`Cache-Control`**：告诉浏览器和中间的缓存服务器如何缓存这个资源。比如 `max-age=3600` 表示这个资源 1 小时内都不用再来请求了，直接用缓存的。
4. **`Location`**：用在重定向的时候。告诉浏览器“你要找的东西不在这，去另一个地址找吧”，状态码通常是 302 或 301。
5. **`Access-Control-Allow-Origin`**：解决跨域问题的。服务器用它来声明允许哪些其他网站的页面来访问我这里的资源。`*` 表示允许所有网站访问。

举例：

```text
GET /api/data HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0
Accept: application/json
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: https://example.com/dashboard
Connection: keep-alive
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

```text
HTTP/1.1 200 OK
Server: nginx/1.18.0
Date: Wed, 21 Oct 2022 07:28:00 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 1234
Content-Encoding: gzip
Cache-Control: max-age=3600
ETag: "abc123def456"
Access-Control-Allow-Origin: *
Connection: keep-alive

{...压缩后的 JSON 数据...}
```

## 介绍一下 HTTP 中 GET 和 POST 方法的区别

- 语义不同
  - GET 用来“只读”取资源；
  - POST 用来“写”新建或修改资源。
- 报文格式不同
  - GET 把参数放在 URL 查询串（`?a=1&b=2`），请求体为空；
  - POST 把参数放在请求体里，URL 上看不到。
- 缓存策略不同
  - GET 默认可被浏览器、CDN、代理缓存；
  - POST 默认不会缓存。
- 长度限制不同
  - GET 受 URL 长度限制（浏览器/服务器一般 2~8 KB 级）；
  - POST 把数据放 body，理论上只受服务器配置限制（常见 2 MB–2 GB）。
- 安全性/幂等性不同
  - GET 是幂等的：多次调用结果一致，无副作用；
  - POST 非幂等：每提交一次都可能产生新订单、新评论等副作用。 因此刷新或回退时，浏览器会警告“是否重新提交表单”——只对 POST 触发。
- 编码类型不同
  - GET 只能使用 URL 编码（`application/x-www-form-urlencoded`）；
  - POST 还可以用 `multipart/form-data`（上传文件）、`application/json`、`text/xml` 等。

## Socket 建立连接的步骤是怎样的？

TODO:
