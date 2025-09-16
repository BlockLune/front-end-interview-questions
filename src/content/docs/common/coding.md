---
title: 编码题
---

## 使用 JS 操作 DOM，向 `<body>` 中插入一个 `<span>`

```js
// 1. 查询
const body = document.querySelector('body');   // 也可用 getElementsByTagName('body')[0]

// 2. 创建节点
const span = document.createElement('span');
span.textContent = 'Hello DOM';                // 安全写法，自动转义

// 3. 插入
body.appendChild(span);                        // 追加到最后
// body.prepend(span);                         // 最前面（IE 不支持 prepend 需 polyfill）
```

查询 DOM 节点的更多方法，可以参考：[搜索：`getElement*`，`querySelector*`](https://zh.javascript.info/searching-elements-dom)

## 使用 React 实现一个曝光传感器

文档：[交叉观察器 API - Web API | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API)

```jsx
const ExposureSensor = ({ children, onVisible }) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { // 此处直接解构得到最前面的 index 为 0 的项
        if (entry.isIntersecting) {
          if (onVisible) {
            onVisible(entry);
          }
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [onVisible]);

  return <div ref={ref}>{children}</div>;
};
```

`IntersectionObserver` 构造函数的第一个参数是一个回调函数，长这样（注意其第一个参数是个数组）：

```js
(entries, observer) => {
  entries.forEach(entry => {
    // entry.boundingClientRect
    // entry.intersectionRatio
    // entry.intersectionRect
    // entry.isIntersecting
    // entry.rootBounds
    // entry.target
    // entry.time
  });
}
```

## 实现一个数组扁平化函数

```js
function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item)); // push 可接受多个参数
    } else {
      result.push(item);
    }
  }
}
```

如果限制扁平化层数：

```js
function flatten(arr, depth = 1) {
   const result = [];
   for (const item of arr) {
      if (Array.isArray(item) && depth > 0) {
        result.push(...flatten(item, depth - 1));
      } else {
        result.push(item);
      }
   }
}
```

## 实现数组去重

```js
const uniqueArray = [...new Set(originalArray)];
// 或
const uniqueArray = Array.from(new Set(originalArray));
```

```js
const uniqueArray = originalArray.filter((item, index, arr) => arr.indexOf(item) === index);
```

```js
const uniqueArray = originalArray.reduce((accumulator, currentValue) => {
  if (!accumulator.includes(currentValue)) {
    accumulator.push(currentValue);
  }
  return accumulator;
}, []);
```

## 实现对象精简

<https://leetcode.cn/problems/compact-object/description/>

精简对象与原始对象相同，只是将包含假值的键移除。该操作适用于对象及其嵌套对象。数组被视为索引作为键的对象。当 `Boolean(value)` 返回 `false` 时，值被视为假值。

```js
/**
 * 递归地移除对象或数组中所有“假”值（falsy）。
 * 假值指 Boolean(value) === false 的值，如：null、undefined、0、""、false、NaN。
 *
 * 规则：
 * 1. 数组：先剔除假元素，再递归压缩剩余元素。
 * 2. 普通对象：仅保留真值属性，并递归压缩其值。
 * 3. 原始类型：直接返回，由调用者决定取舍。
 *
 * 注意：typeof null === 'object'，因此要先判断 null。
 *
 * @param {Object|Array} obj - 待压缩的对象或数组
 * @return {Object|Array}    - 压缩后的新结构（不会修改原结构）
 */
function compactObject(obj) {
  /* ---------- 1. 数组分支 ---------- */
  if (Array.isArray(obj)) {
    // 1.1 过滤掉假元素
    const filtered = obj.filter(Boolean); // Boolean 会自动剔除 falsy 值
    // 1.2 对剩下的每个元素继续递归压缩
    return filtered.map(compactObject);
  }

  /* ---------- 2. 对象分支（排除 null） ---------- */
  if (obj !== null && typeof obj === "object") {
    const compacted = {}; // 新对象，存放真值属性

    // 遍历自身可枚举属性（不含原型链上的）
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        // 仅当真值时才保留，并递归压缩其内部结构
        if (Boolean(value)) {
          compacted[key] = compactObject(value);
        }
      }
    }

    return compacted;
  }

  /* ---------- 3. 原始值分支 ---------- */
  // 字符串、数字、布尔、undefined、Symbol、BigInt、函数等直接返回
  // 由上层调用者通过 Boolean(...) 决定是否丢弃
  return obj;
}
```

## 实现版本号排序

`(a, b) => a - b`: 升序
`(a, b) => b - a`: 降序

```js
const compareVersions = (a, b) => {
  const v1 = a.split('.').map(Number);
  const v2 = b.split('.').map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;

    if (num1 !== num2) {
      return num1 - num2;
    }
  }

  return 0;
};

// 使用示例
const versions = ['1.2.3', '2.0.1', '1.10.0', '2.0.0'];
versions.sort(compareVersions);
// 结果：['1.2.3', '1.10.0', '2.0.0', '2.0.1']
```

## 数组实现 append()

```js
// 为 Array 原型添加 append 方法
Object.defineProperty(Array.prototype, 'append', {
    value: function(...items) {
        // 保存原始长度
        const originalLength = this.length;

        // 处理各种类型的参数
        for (let i = 0; i < items.length; i++) {
            // 模拟 push 的完整行为，包括处理稀疏数组
            this[originalLength + i] = items[i];
        }

        // 更新 length 属性（虽然会自动更新，但为了完整性）
        this.length = originalLength + items.length;

        // 返回新的长度，与 push 保持一致
        return this.length;
    },
    writable: true,
    configurable: true,
    enumerable: false // 设置为不可枚举，避免在 for...in 循环中出现
});

// 添加额外的静态方法版本
Array.append = function(array, ...items) {
    return array.append(...items);
};
```

## 实现数组排序

## 使用 `reduce` 实现自己的 `map` 方法

```js
Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError(`${callback} is not a function`);
  }
  // 初始累加器为空数组
  return this.reduce((acc, cur, idx, arr) => {
    // 把当前元素映射后的值“追加”到累加器
    return [...acc, callback.call(thisArg, cur, idx, arr)];
  }, []);
};
```

## 用 ES6 写个 MyPromise：1 秒后 resolve，reject 只能生效一次

```js
// MyPromise.js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  constructor(executor) {
    this.state = PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED
        this.value = value
        this.onFulfilledCallbacks.forEach(fn => fn())
      }
    }
    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }

    const promise2 = new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
      const handleRejected = () => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.state === FULFILLED) handleFulfilled()
      else if (this.state === REJECTED) handleRejected()
      else {
        this.onFulfilledCallbacks.push(handleFulfilled)
        this.onRejectedCallbacks.push(handleRejected)
      }
    })
    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  static resolve(val) {
    return new MyPromise(resolve => resolve(val))
  }
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }
}

// 简易 Promise 解析过程
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) return reject(new TypeError('Chaining cycle detected'))
  if (x && (typeof x === 'object' || typeof x === 'function')) {
    let used
    try {
      const then = x.then
      if (typeof then === 'function') {
        then.call(x, val => {
          if (used) return; used = true
          resolvePromise(promise, val, resolve, reject)
        }, err => {
          if (used) return; used = true
          reject(err)
        })
      } else resolve(x)
    } catch (e) {
      if (used) return; used = true
      reject(e)
    }
  } else resolve(x)
}

// 测试：1 秒后先 resolve，reject 被忽略
new MyPromise((resolve, reject) => {
  console.log('start')
  setTimeout(() => {
    resolve('ok')
    reject('err')   // 这句不会生效
  }, 1000)
})
  .then(v => console.log('then:', v))
  .catch(e => console.log('catch:', e))
```

## 实现 once

```js
const once = (fn) => {
  let done = false;
  return function (...args) {
    if (done) return;
    done = true;
    return fn.apply(this, args);
  };
};
```

## 实现 memorize

```js
function memoize(fn: Fn): Fn {
  const memo = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (memo.has(key)) {
      return memo.get(key);
    }
    const value = fn.call(this, ...args);
      memo.set(key, value);
      return value;
  }
}
```

## 实现对所有重叠区间的合并

```js
/**
 * 合并所有重叠的区间
 * @param {number[][]} intervals - 形如 [[start, end], ...]
 * @returns {number[][]} - 合并后的区间
 */
const mergeIntervals = (intervals) => {
  if (!Array.isArray(intervals) || intervals.length === 0) return [];

  // 按起点升序排序
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);

  // 逐个合并
  return sorted.reduce((merged, [s, e]) => {
    if (merged.length === 0) return [[s, e]];

    const last = merged[merged.length - 1];
    // 如果当前区间与 last 重叠，则合并
    if (s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      merged.push([s, e]);
    }
    return merged;
  }, []);
};

/* ====== 测试 ====== */
console.log(
  mergeIntervals([
    [1, 3],
    [2, 6],
    [8, 10],
    [15, 18],
  ])
); // [ [1,6], [8,10], [15,18] ]

console.log(mergeIntervals([[1, 4], [4, 5]])); // [ [1,5] ]
```

## 判断五张纯数字牌是否是顺子

```js
/**
 * 判断 5 张纯数字牌是否为顺子（不考虑 joker）
 * @param {number[]} nums 长度为 5 的数组，元素范围 1-13
 * @returns {boolean}
 */
const isStraight = (nums) => {
  if (!Array.isArray(nums) || nums.length !== 5) return false;
  nums.sort((a, b) => a - b);
  return new Set(nums).size === 5 && nums[4] - nums[0] < 5;
};

// --- 测试 ---
console.log(isStraight([3, 1, 4, 2, 5])); // true
console.log(isStraight([1, 3, 5, 7, 9])); // false
console.log(isStraight([1, 2, 3, 4, 6])); // false
console.log(isStraight([10, 11, 12, 13, 9])); // true
```

## 判断多叉树里有没有一条从根到叶的路，节点值加起来正好等于给定的数

```js
class TreeNode {
    constructor(value) {
        this.value = value;
        this.children = [];
    }

    addChild(childNode) {
        this.children.push(childNode);
    }
}

function hasPathSum(root, targetSum) {
    if (!root) return false;

    function dfs(node, currentSum) {
        currentSum += node.value;

        if (node.children.length === 0) {
            return currentSum === targetSum;
        }

        for (let child of node.children) {
            if (dfs(child, currentSum)) {
                return true;
            }
        }

        return false;
    }

    return dfs(root, 0);
}

// 测试
const root = new TreeNode(1);
const child1 = new TreeNode(2);
const child2 = new TreeNode(3);
const child3 = new TreeNode(4);
const child4 = new TreeNode(5);
const child5 = new TreeNode(6);
const child6 = new TreeNode(7);

root.addChild(child1);
root.addChild(child2);
root.addChild(child3);
child1.addChild(child4);
child1.addChild(child5);
child3.addChild(child6);

console.log(hasPathSum(root, 8));  // true
console.log(hasPathSum(root, 10)); // false
console.log(hasPathSum(root, 12)); // true
```

## 实现在目录树中查找目标目录并返回完整路径

给定一棵用数组表示的目录树，每个节点是一个对象，包含

- `name`: 字符串，目录或文件名
- `children`: 数组，子节点列表（目录才有该字段，文件没有）

请实现一个函数 `findPath(tree, targetName)`，返回从根到目标目录名为 `targetName` 的一条完整路径（用 '/' 拼接）。
如果同名目录出现多次，返回最先找到（深度优先）的那条路径；未找到返回 `null`。

```js
/**
 * 在目录树中查找目标目录并返回完整路径
 * @param {Array} tree 根节点数组
 * @param {string} targetName 要查找的目录名
 * @return {string|null} 完整路径或 null
 */
const findPath = (tree, targetName) => {
  const dfs = (nodes, path) => {
    for (const node of nodes) {
      const curPath = path + '/' + node.name;
      if (node.name === targetName) return curPath;          // 找到即返回
      if (node.children) {                                   // 仅目录有 children
        const sub = dfs(node.children, curPath);
        if (sub) return sub;                                 // 子树找到即返回
      }
    }
    return null;
  };
  return dfs(tree, '');
};

/* ------------------ 测试 ------------------ */
const tree = [
  {
    name: 'home',
    children: [
      { name: 'user1', children: [{ name: 'docs', children: [] }] },
      { name: 'user2', children: [{ name: 'media', children: [] }] }
    ]
  },
  { name: 'opt', children: [{ name: 'home', children: [] }] }
];

console.log(findPath(tree, 'docs')); // "/home/user1/docs"
console.log(findPath(tree, 'home')); // "/home"（最先出现的）
console.log(findPath(tree, 'xyz'));  // null
```

## 求最长无重复字符子字符串的长度

<details>
<summary>暴力方法</summary>

```js
function lengthOfLongestSubstringBruteForce(s) {
  let maxLength = 0;
  const n = s.length;

  // 外层循环：所有可能的起始位置
  for (let i = 0; i < n; i++) {
    // 内层循环：所有可能的结束位置（从 i 开始）
    for (let j = i; j < n; j++) {
      // 检查子字符串 s[i...j] 是否无重复字符
      if (isUnique(s, i, j)) {
        // 如果无重复，更新最大长度
        maxLength = Math.max(maxLength, j - i + 1);
      }
    }
  }
  return maxLength;
}

// 辅助函数：检查子字符串是否无重复字符
function isUnique(s, start, end) {
  const seen = new Set();

  for (let i = start; i <= end; i++) {
    const char = s[i];
    if (seen.has(char)) {
      return false; // 发现重复字符
    }
    seen.add(char);
  }

  return true; // 所有字符都是唯一的
}
```

</details>

滑动窗口（时间 O(n)，空间 O(min(m, n))）：

```js
function lengthOfLongestSubstring(s) {
  // 初始化最大长度为 0
  let maxLength = 0;
  // 左指针，表示当前无重复子串的起始位置
  let left = 0;
  // 使用 Map 来存储字符及其最后出现的位置
  const charMap = new Map();

  // 右指针从 0 开始遍历字符串
  for (let right = 0; right < s.length; right++) {
    const currentChar = s[right];

    // 如果当前字符已经在 Map 中存在，并且其位置在左指针的右侧或相同
    // 说明出现了重复字符
    if (charMap.has(currentChar) && charMap.get(currentChar) >= left) {
      // 将左指针移动到重复字符的下一个位置
      left = charMap.get(currentChar) + 1;
    }

    // 更新当前字符的最新位置
    charMap.set(currentChar, right);
    // 计算当前窗口的长度并更新最大长度
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}

// 扩展版本：同时返回最长子串本身
function findLongestSubstring(s) {
  let maxLength = 0;
  let start = 0;
  const charMap = new Map();
  let longestSubstring = "";

  for (let end = 0; end < s.length; end++) {
    const currentChar = s[end];

    // 如果字符已存在且在当前窗口内（位置》=start）
    if (charMap.has(currentChar) && charMap.get(currentChar) >= start) {
      // 移动 start 到重复字符的下一个位置
      start = charMap.get(currentChar) + 1;
    }

    // 更新字符的最新位置
    charMap.set(currentChar, end);

    // 计算当前窗口长度
    const currentLength = end - start + 1;

    // 如果找到更长的子串
    if (currentLength > maxLength) {
      maxLength = currentLength;
      longestSubstring = s.substring(start, end + 1);
    }
  }

  return { length: maxLength, substring: longestSubstring };
}

// 使用示例
console.log(lengthOfLongestSubstring("abcabcabc")); // 输出：3
console.log(lengthOfLongestSubstring("bbbbb")); // 输出：1
console.log(lengthOfLongestSubstring("pwwkew")); // 输出：3

// 使用扩展版本
const result = findLongestSubstring("abcabcabc");
console.log(result); // 输出：{ length: 3, substring: "abc" }
```

## 实现一个洗牌算法

```js
function shuffle(array) {
  const arr = array.slice(); // 复制原数组，避免修改原始数据
  for (let i = arr.length - 1; i > 0; i--) {
    // 随机选择 0 到 i 之间的索引（包括 i）
    const j = Math.floor(Math.random() * (i + 1));
    // 交换当前元素与随机选中的元素
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const original = [1, 2, 3, 4, 5];
const shuffled = shuffle(original);
console.log(shuffled);
```

## 实现括号匹配

```js
function isBracketMatch(str) {
  const stack = [];
  const bracketMap = {
    '(': ')',
    '[': ']',
    '{': '}'
  };

  for (let char of str) {
    if (bracketMap[char]) {
      stack.push(char);
    } else if (char === ')' || char === ']' || char === '}') {
      if (bracketMap[stack.pop()] !== char) {
        return false;
      }
    }
  }

  return stack.length === 0;
}
```

## 实现一个函数，判断一个数组是否恰好翻转一段连续子数组就能变成升序，原本有序也算 false

```js
/**
 * 判断给定数组是否可以通过翻转恰好一个连续子数组使其整体有序。
 * 如果原数组已经有序，也返回 false（因为不需要翻转）。
 *
 * @param {number[]} arr
 * @returns {boolean}
 */
function canBeSortedByOneFlip(arr) {
  const n = arr.length;
  if (n <= 1) return false; // 无需翻转

  // 1. 找到第一个下降的位置 i
  let i = 0;
  while (i < n - 1 && arr[i] <= arr[i + 1]) i++;
  if (i === n - 1) return false; // 已经有序

  // 2. 找到最后一个下降的位置 j
  let j = n - 1;
  while (j > 0 && arr[j - 1] <= arr[j]) j--;

  // 3. 翻转子数组 arr[i..j]
  // 手动反转，避免修改原数组
  const reversed = [];
  for (let k = i; k <= j; k++) reversed.push(arr[j - (k - i)]);
  // 构造翻转后的数组
  const flipped = arr.slice(0, i).concat(reversed, arr.slice(j + 1));

  // 4. 检查翻转后是否整体非降
  for (let k = 0; k < n - 1; k++) {
    if (flipped[k] > flipped[k + 1]) return false;
  }
  return true;
}

// ---- 测试用例 ----
console.log(canBeSortedByOneFlip([1, 3, 2, 1, 4, 5]));        // true
console.log(canBeSortedByOneFlip([1, 3, 2, 1, 4, 6, 5]));     // false
console.log(canBeSortedByOneFlip([1, 2, 3, 4, 5]));           // false （已有序）
console.log(canBeSortedByOneFlip([5, 4, 3, 2, 1]));           // true
console.log(canBeSortedByOneFlip([1, 2, 4, 3, 5]));           // true
console.log(canBeSortedByOneFlip([1, 5, 3, 4, 2, 6]));        // false
```

## 实现大数相加

```js
function addLargeNumbers(numStr1, numStr2) {
  // 将字符串拆分为数字数组并反转，便于从低位到高位计算
  const arr1 = numStr1.split('').map(Number).reverse();
  const arr2 = numStr2.split('').map(Number).reverse();

  const maxLength = Math.max(arr1.length, arr2.length);
  const result = [];
  let carry = 0;

  // 逐位相加并处理进位
  for (let i = 0; i < maxLength; i++) {
    const digit1 = arr1[i] || 0;
    const digit2 = arr2[i] || 0;
    const sum = digit1 + digit2 + carry;

    result.push(sum % 10); // 当前位结果
    carry = Math.floor(sum / 10); // 计算进位
  }

  // 如果最后还有进位，需要额外添加
  if (carry > 0) {
    result.push(carry);
  }

  // 反转回正常顺序并拼接成字符串
  return result.reverse().join('');
}

// 测试示例：
console.log(addLargeNumbers('123456789', '987654321')); // 输出："1111111110"
console.log(addLargeNumbers('999', '1')); // 输出："1000"
```

## 实现 LRU

```js
/**
 *  LRU 缓存（ES6）
 *  支持任意类型 key、value
 *  所有操作平均时间复杂度 O(1)
 */
class LRUCache {
  /**
   * @param {number} capacity 最大容量，必须为正整数
   */
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new TypeError('capacity must be a positive integer');
    }
    this.capacity = capacity;
    this.map = new Map(); // key -> value
  }

  /**
   * 读取 key 对应的值，不存在返回 undefined
   * 访问后该 key 变为“最近使用”
   * @param {*} key
   * @returns {*|undefined}
   */
  get(key) {
    if (!this.map.has(key)) return undefined;

    // 取出值并“移到末尾”
    const value = this.map.get(key);
    this.map.delete(key); // 先删
    this.map.set(key, value); // 再插到末尾
    return value;
  }

  /**
   * 写入键值对
   * 如果 key 已存在，覆盖并变为“最近使用”
   * 如果容量超限，淘汰最久未使用的 key
   * @param {*} key
   * @param {*} value
   * @returns {LRUCache} 支持链式调用
   */
  set(key, value) {
    if (this.map.has(key)) {
      // 已存在，先删除旧位置
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // 容量满，淘汰第一个（最久未使用）
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
    this.map.set(key, value);
    return this; // 链式调用
  }

  /**
   * 手动删除某个 key
   * @param {*} key
   * @returns {boolean} 是否删除成功
   */
  delete(key) {
    return this.map.delete(key);
  }

  /**
   * 清空缓存
   */
  clear() {
    this.map.clear();
  }

  /**
   * 当前缓存大小
   * @returns {number}
   */
  get size() {
    return this.map.size;
  }

  /**
   * 按“最近→最久”顺序返回所有键，方便调试
   * @returns {Array<*>}
   */
  keys() {
    return [...this.map.keys()];
  }

  /**
   * 按“最近→最久”顺序返回所有值，方便调试
   * @returns {Array<*>}
   */
  values() {
    return [...this.map.values()];
  }
}

/* ---------- 使用示例 ---------- */
const cache = new LRUCache(3);
cache.set('a', 1)
     .set('b', 2)
     .set('c', 3);
console.log(cache.keys()); // ['a','b','c']
cache.get('a');           // 访问 a
cache.set('d', 4);        // 触发淘汰 b
console.log(cache.keys()); // ['c','a','d']
```

## 实现最长公共子序列

## 实现反转链表

```js
// 节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * 反转单链表（ES6 迭代版）
 * @param {ListNode} head
 * @return {ListNode} 新头结点
 */
const reverseList = (head) => {
  let prev = null;          // 新链表头部
  let curr = head;          // 当前待处理节点

  while (curr) {
    const next = curr.next; // 暂存后继
    curr.next = prev;       // 反向指针
    prev = curr;            // 新链表头部前移
    curr = next;            // 处理下一个
  }
  return prev;              // prev 即为反转后的头
};
```

## 实现 K 个一组翻转链表

```js
// 单链表节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * 反转区间 [start, end) 的链表，返回新的头与尾
 * @param {ListNode} start
 * @param {ListNode} end
 * @return {[ListNode, ListNode]} [newHead, newTail]
 */
const reverseRange = (start, end) => {
  let prev = null;
  let curr = start;
  while (curr !== end) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  // prev 是新头，start 变成新尾
  return [prev, start];
};

/**
 * k 个一组反转链表
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
const reverseKGroup = (head, k) => {
  if (!head || k <= 1) return head;

  // 先探一探有没有 k 个
  let tail = head;
  for (let i = 0; i < k; i++) {
    if (!tail) return head;   // 不足 k 个，直接返回
    tail = tail.next;
  }

  // 反转这 k 个，得到新头 newHead
  const [newHead, newTail] = reverseRange(head, tail);

  // newTail 是反转后的尾巴，继续递归处理后面
  newTail.next = reverseKGroup(tail, k);

  return newHead;
};

/* ---------- 测试 ---------- */
// 构造 1->2->3->4->5->6
const buildList = (arr) =>
  arr.reduceRight((next, val) => new ListNode(val, next), null);

const printList = (head) => {
  const out = [];
  for (let p = head; p; p = p.next) out.push(p.val);
  console.log(out.join('->'));
};

const head = buildList([1, 2, 3, 4, 5, 6]);
const newHead = reverseKGroup(head, 3); // k = 3
printList(newHead); // 3->2->1->6->5->4
```

## 实现一个函数，返回第 K 个大的数字

最小堆：

```js
/**
 * 返回数组中第 k 大的数字（非全排序）
 * @param {number[]} nums
 * @param {number} k 从 1 开始计数
 * @returns {number|null} 不足 k 个时返回 null
 */
function kthLargest(nums, k) {
  if (!Number.isInteger(k) || k <= 0) return null;
  const heap = new MinHeap();
  for (const v of nums) {
    if (heap.size() < k) {
      heap.push(v);
    } else if (v > heap.peek()) {
      heap.pop();
      heap.push(v);
    }
  }
  return heap.size() === k ? heap.peek() : null;
}
```

快速选择（快排半成品）：

```js
/**
 * 返回数组中第 k 大的数字（QuickSelect，非全排序）
 * @param {number[]} nums
 * @param {number} k 从 1 开始计数
 * @returns {number|null} 不足 k 个时返回 null
 */
function kthLargest(nums, k) {
  if (!Number.isInteger(k) || k <= 0 || k > nums.length) return null;
  const n = nums.length;
  const target = n - k; // 升序下标
  let left = 0, right = nums.length - 1;
  while (true) {
    const pivotIndex = partition(nums, left, right);
    if (pivotIndex === target) {
      return nums[pivotIndex];
    } else if (pivotIndex < target) {
      left = pivotIndex + 1;
    } else {
      right = pivotIndex - 1;
    }
  }
}

// 单边循环分区
function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}
```
