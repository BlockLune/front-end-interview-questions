---
title: JavaScript
---

## 介绍一下 JS 中的数据类型，并给出判断方法

JS 中的基本数据类型有：

- 原始数据类型（七种）：`string`、`number`、`bigint`、`boolean`、`symbol`、`null`、`undefined`
- 非原始数据类型（一种，i.e. 对象类型）：`object`

使用 `typeof` 操作符可以获得操作数的类型：

```js
// 对于大部分原始数据类型，
// typeof 的结果非常符合直觉，
// 但需要注意 typeof null 的结果是 "object"
typeof "hello";           // "string"
typeof 123;               // "number"
typeof NaN;               // "number" - ⚠️ 注意：NaN 的类型也是 number
typeof true;              // "boolean"
typeof Symbol('id');      // "symbol"
typeof 123n;              // "bigint"
typeof undefined;         // "undefined"
typeof null;              // "object" - ⚠️ 注意
typeof someUndeclaredVar; // "undefined" - ⚠️ 注意：对于没有声明过的变量结果也是 undefined

// 对于对象类型
typeof { a: 1 };      // "object"
typeof [1, 2, 3];     // "object" - ⚠️ 注意
typeof new Date();    // "object"
typeof function() {}; // "function" - 特殊
```

> [!note]
> 为什么 `typeof null` 的结果是 `"object"`？
> 这是一个历史遗留 Bug。JS 早期实现中，`null` 的底层表示是 NULL 指针（0x00），而对象的类型标签恰好也是 0，所以 `typeof` 就将其误认为了对象

> [!tip]
> 正确的判断变量是否是 `NaN` 的方法：使用 `Number.isNaN()`（注意不是全局的 `isNaN()`，因为会先尝试将参数转换为数字，可能导致意外的结果）；或者，可以利用“`NaN` 是 JavaScript 中唯一不等于自身的值”这一特性，使用 `function isNaNValue(value) { return value !== value; }` 进行判断。

> [!tip]
> 正确的判断变量是否是 `null` 的方法：使用 `===`，例如 `if (myVar === null)`

> [!tip]
> 正确的判断变量是否是数组 `Array` 的方法：使用 `Array.isArray()`

可以使用 `Object.prototype.toString.call()` 来获得最准确的类型：

```js
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call([]);   // "[object Array]"
Object.prototype.toString.call({});   // "[object Object]"
Object.prototype.toString.call('');   // "[object String]"
Object.prototype.toString.call(123);  // "[object Number]"
Object.prototype.toString.call(NaN);  // "[object Number]"
```

> [!tip]
> 如何判断一个对象是不是 Map？
>
> ```js
> function isMap(obj) {
>    return Object.prototype.toString.call(obj) === '[object Map]';
> }
> ```

## 介绍一下 JS 中遍历对象属性的各种方法

对象的属性存在多种形态，可以从以下三个维度进行考量：

- **位置不同**：自有属性（Own Property）和原型链属性（Prototype Property）
- **是否可枚举**：可枚举属性（Enumerable）和不可枚举属性
- **键类型不同**：字符串键（String Key）和符号键（Symbol Key）

下面介绍五种遍历工具：`for...in`、`Object.keys()`、`Object.getOwnPropertyNames()`、`Object.getOwnPropertySymbols()` 和 `Reflect.ownKeys()`。

```js
const sym = Symbol("demo");
const proto = {
  protoProp: "proto value",
};

// 演示对象 obj
const obj = Object.create(proto); // 原型链属性
obj.ownProp = "own value"; // 自有属性，字符串键，可枚举属性
obj[sym] = "symbol value"; // 符号键
Object.defineProperty(obj, "nonEnumProp", {
  // 不可枚举属性
  value: "non-enumerable value",
  enumerable: false,
});

// -----------
// 1. for...in: 遍历自身及原型链上的可枚举字符串属性
// -----------
const result1 = [];
for (let key in obj) {
  result1.push(key);
}
console.log(result1); // ["ownProp", "protoProp"]

// 如果希望它只遍历自身属性（即不包含原型链属性），
// 需配合 Object.prototype.hasOwnProperty 使用
const result1Fixed = [];
for (let key in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    result1Fixed.push(key);
  }
}
console.log(result1Fixed); // ["ownProp"]

// ----------------
// 2. Object.keys(): 返回对象自身的可枚举字符串属性
// ----------------
// 该方法的性能优于 for...in + hasOwnProperty
console.log(Object.keys(obj)); // ["ownProp"]

// -------------------------------
// 3. Object.getOwnPropertyNames(): 返回对象自身的全部字符串属性
// -------------------------------
console.log(Object.getOwnPropertyNames(obj)); // ["ownProp", "nonEnumProp"]

// ---------------------------------
// 4. Object.getOwnPropertySymbols(): 返回对象自身的全部 Symbol 属性
// ---------------------------------
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(demo)]

// --------------------
// 5. Reflect.ownKeys(): 返回对象自身的所有属性
// --------------------
console.log(Reflect.ownKeys(obj)); // ["ownProp", "nonEnumProp", Symbol(demo)]
// 结果上等价于
console.log(
  Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj)),
); // ["ownProp", "nonEnumProp", "Symbol(demo)"]
```

遍历顺序：正整数字符串键按升序排序，字符串键按插入顺序排列，Symbol 键按插入顺序排列，与字符串键分开。`Reflect.ownKeys()` 保证先返回字符串键，再返回 Symbol 键。

```js
const obj = {
  '3': 'c',
  '1': 'a',
  '2': 'b',
  'foo': 'bar',
  [Symbol('sym')]: 'symbol',
  'baz': 'qux'
};

for (const key in obj) {
  console.log(key); // 输出顺序：1, 2, 3, foo, baz
}
```

## 如何判断一个 JS 对象是不是空对象？

首先需要借助 `Object.prototype.toString.call(obj) === '[Object Object]'` 来判断给定的参数是不是一个对象，接着通过以下多种方式，在不同层面和深度上进行检查：

1. `Object.keys(obj).length === 0`：检查自身可枚举的字符串键
2. `Object.getOwnPropertyNames(obj).length === 0`：检查自身全部字符串键
3. `Reflect.ownKeys(obj).length === 0`：检查自身全部键
4. `for...in`: 兼容旧环境的方法，稍繁琐

   ```js
   function isEmpty(obj) {
     for (let key in obj) {
       // 注意此处不是 obj.hasOwnProperty(key)，因为 obj 本身可能被污染
       if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
     }
     return true;
   }
   ```

5. `JSON.stringify(obj) === '{}'`: 性能差，同时无法检查 `{ toString: undefined }` 等情况，**不推荐**

最佳实践：

```js
function isEmpty(obj) {
  return (
    obj &&
    Object.prototype.toString.call(obj) === '[object Object]' &&
    Object.keys(obj).length === 0
  );
}
```

或者也可以使用三方库，例如使用 Lodash 提供（`_.isEmpty(obj)`)

> [!important]
> 注意如果 isEmpty 需要对数组进行判断，那就应该使用 Object.keys，如果使用 Reflect.ownKeys，注意它会输出 `length` 这个不可枚举属性。
>
> ```js
>  console.log(Reflect.ownKeys([])); // ['length']
> ```

## 介绍一下解构

```js
// 一、数组解构基础 ----------------------------------
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// 跳过元素
const [first, , third] = [10, 20, 30];
console.log(first, third); // 10 30

// 默认值（当对应位置为 undefined 时生效）
const [x = 1, y = 2] = [10];
console.log(x, y); // 10 2

// 嵌套解构
const [p, [q, r]] = [1, [2, 3]];
console.log(p, q, r); // 1 2 3

// 与 rest 参数结合
const [head, ...rest] = [100, 200, 300, 400];
console.log(head); // 100
console.log(rest); // [200, 300, 400]

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n); // 2 1


// 二、对象解构基础 ----------------------------------
const user = { name: "Alice", age: 25 };
const { name, age } = user;
console.log(name, age); // Alice 25

// 属性重命名
const { name: userName } = user;
console.log(userName); // Alice

// 默认值（仅在属性不存在或值为 undefined 时生效）
const { gender = "female", age: years = 18 } = user;
console.log(gender, years); // female 25

// 嵌套解构
const person = {
  info: {
    id: 1,
    details: { city: "Tokyo", country: "Japan" }
  }
};
const {
  info: {
    details: { city, country }
  }
} = person;
console.log(city, country); // Tokyo Japan

// 嵌套解构防止报错（加默认值）
const broken = {};
const {
  info: {
    details: { town } = {}
  } = {}
} = broken;
console.log(town); // undefined（不会报错）

// 对象 + 数组混合解构
const complex = { title: "Book", tags: ["fiction", "classic"] };
const {
  title,
  tags: [firstTag, secondTag]
} = complex;
console.log(title, firstTag, secondTag); // Book fiction classic


// 三、函数参数解构 ----------------------------------

// 对象参数解构 + 默认值
function createUser({ name = "Tom", age = 18 } = {}) {
  console.log("User:", name, age);
}
createUser({ name: "Bob" }); // User: Bob 18
createUser(); // User: Tom 18（传入空时默认空对象 {}）

// 数组参数解构
function sum([a, b]) {
  return a + b;
}
console.log(sum([5, 7])); // 12


// 四、常用技巧与场景 ----------------------------------

// 1️⃣ 从函数返回多个值
function getPosition() {
  return { x: 10, y: 20 };
}
const { x: posX, y: posY } = getPosition();
console.log(posX, posY); // 10 20

// 2️⃣ 返回数组解构
function getCoords() {
  return [100, 200];
}
const [coordX, coordY] = getCoords();
console.log(coordX, coordY); // 100 200

// 3️⃣ 快速提取对象属性
const settings = { theme: "dark", lang: "en" };
const { theme, lang } = settings;
console.log(theme, lang); // dark en

// 4️⃣ 结合解构快速访问嵌套数据
const response = {
  data: {
    users: [{ id: 1, name: "Tom" }, { id: 2, name: "Jerry" }]
  }
};
const {
  data: {
    users: [{ name: firstUser }]
  }
} = response;
console.log(firstUser); // Tom

// 5️⃣ 解构 + 动态属性名（计算属性名）
const key = "score";
const player = { name: "Luna", score: 99 };
const { [key]: playerScore } = player;
console.log(playerScore); // 99


// 五、注意事项 ----------------------------------

// ⚠️ 1. 解构右侧必须是可迭代（数组）或对象
try {
  const [oops] = null; // TypeError
} catch (e) {
  console.log("Error caught:", e.message);
}

// ⚠️ 2. 对象解构赋值时需加括号避免被解析为代码块
let foo;
({ foo } = { foo: "bar" });
console.log(foo); // bar

// ⚠️ 3. 默认值仅在值为 undefined 时生效
const [val = 10] = [null];
console.log(val); // null（不会使用默认值）
```

## 介绍一下 `sort()`

`sort()` 是数组上的排序函数，默认按照 **字符串 Unicode 码点** 排序，可通过传入函数实现自定义排序。

```js
[3, 15, 8, 29, 102, 22].sort() // [ 102, 15, 22, 29, 3, 8 ]
[3, 15, 8, 29, 102, 22].sort((a, b) => a - b) // [ 3, 8, 15, 22, 29, 102 ]
```

## 介绍一下 `parseInt()` 和 `parseFloat()`

`parseInt` 和 `parseFloat` 用于从一个字符串中读取数字。和使用 `+` 或使用 `Number()` 不同，它们会从字符串中“读取”数字，直到无法读取为止。

```js
parseInt('2025') // 2025
parseInt('2025-01-01') // 2025
parseInt('a123') // NaN

Number('2025') // 2025
Number('2025-01-01') // NaN
```

## 介绍一下数组的常用方法

- 修改原数组
  - [`push(element0, element1, /* … ,*/ elementN)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/push)：向数组末尾添加元素
  - [`pop()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)：移除数组末尾的元素
  - [`shift()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)：移除数组开头的元素
  - [`unshift(element0, element1, /* … ,*/ elementN)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)：向数组开头添加元素
  - [`splice(start, deleteCount, item1, item2, /* … ,*/ itemN)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)：从指定位置删除特定数量的元素，然后可能地，插入一些元素
  - [`reverse()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)：反转数组元素的顺序
  - [`sort(compareFunction)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)：对数组元素进行排序
  - [`copyWithin(target, start, end)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)：浅复制数组的一部分到同一数组中的另一个位置
  - [`fill(value, start, end)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)：用固定值填充数组中指定范围的元素

- 不修改原数组，返回新数组
  - [`concat(value1, value2, /* … ,*/ valueN)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)：合并两个或多个数组
  - [`slice(start, end)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)：提取数组的一部分作为新数组
  - [`flat(depth)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)：将嵌套数组扁平化
  - [`flatMap(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)：先映射每个元素，然后将结果扁平化
  - [`map(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)：对每个元素执行函数并返回新数组
  - [`filter(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)：过滤满足条件的元素
  - [`reduce(callback, initialValue)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)：从左到右对每个元素执行 reducer 函数

- 数组遍历方法
  - [`forEach(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)：对每个元素执行函数
  - [`every(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/every)：检测所有元素是否都满足条件
  - [`some(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/some)：检测是否有至少一个元素满足条件
  - [`find(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/find)：查找第一个满足条件的元素
  - [`findIndex(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)：查找第一个满足条件的元素的索引
  - [`findLast(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)：查找最后一个满足条件的元素
  - [`findLastIndex(callback)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)：查找最后一个满足条件的元素的索引
  - [`keys()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/keys)：返回包含数组索引的迭代器
  - [`values()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/values)：返回包含数组元素的迭代器
  - [`entries()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/entries)：返回包含索引-值对的迭代器

- 其他实用方法
  - [`includes(valueToFind, fromIndex)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)：判断数组是否包含某个值
  - [`indexOf(searchElement, fromIndex)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)：返回元素在数组中第一次出现的索引
  - [`lastIndexOf(searchElement, fromIndex)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)：返回元素在数组中最后一次出现的索引
  - [`join(separator)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/join)：将数组所有元素连接成字符串
  - [`toString()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toString)：返回数组的字符串表示
  - [`toLocaleString()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toLocaleString)：返回数组的本地化字符串表示
  - [`isArray(value)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)：判断值是否为数组（静态方法）
  - [`from(arrayLike, mapFn)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/from)：从类数组对象或可迭代对象创建新数组（静态方法）
  - [`of(element0, element1, /* … ,*/ elementN)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/of)：用参数创建新数组（静态方法）

### reduce()

Reduce 意为“归并”，原型是 `reduce(callbackFn, initialValue)`，其中的第一个参数是一个形如 `callbackFn(accumulator, currentValue, currentIndex, array)` 的回调函数。具体见 [Array.prototype.reduce() - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)。

下面是一个使用 `reduce()` 进行求和的例子：

```js
const array = [1, 2, 3, 4];
const sum = array.reduce(
  (accumulator, currentValue) => accumulator + currentValue,
  0 // initialValue
);
```

是否提供 `initialValue` 决定了 `accumulator` 的初始值和遍历开始的位置：

- 提供：`accumulator` 初始值为 `initialValue`，从 index 为 0 的位置开始遍历
- 不提供：`accumulator` 初始值为 arr[0]，从 index 为 1 的位置开始遍历，对空数组调用会抛出 `TypeError`

### splice()

Splice 意为“拼接”，在 JS 中，`splice()` 是一把数组的“手术刀”，可以 **原地实现增删改**。其返回值是被删除元素组成的数组。参见 [Array.prototype.splice() - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)。

```js
const months = ['Jan', 'March', 'April', 'June'];
months.splice(1, 0, 'Feb'); // 在索引 1 位置，删除 0 个元素，插入 'Feb'
console.log(months); // ['Jan', 'Feb', 'March', 'April', 'June']
```

### flat(depth)

`flat()` 方法创建一个新的数组，并根据指定深度递归地将所有子数组元素拼接到新的数组中。默认 depth 为 1。

```js
const arr = [0, 1, [2, [3, [4, 5]]]];
console.log(arr.flat()); // [0, 1, 2, Array [3, Array [4, 5]]]
console.log(arr.flat(2)); // [0, 1, 2, 3, Array [4, 5]]
console.log(arr.flat(Infinity)); // [0, 1, 2, 3, 4, 5]
```

## 介绍一下 JS 中的隐式类型转换和 `==` 与 `===`

### 隐式类型转换

在 JS 中进行运算（`+`, `-`, `*`, `/`, `%`）或比较（`>`, `<`, `>=`, `<=`, `==`, `if (...)`, `!`, `&&`, `||`）时，JS 引擎会自动、静默地转换操作数类型，这被称为 Type Coercion。

```js
// “+” 左右任一存在字符串，则会转换为字符串拼接操作
// 只有双方均为数字，才进行数字加操作

// 字符串拼接
console.log(1 + '2'); // "12"

// 数字加（1+1）
console.log(true + true); // 2

// 数字加（1+0）
console.log(1 + null); // 1

// 数字加（1+NaN）
console.log(1 + undefined); // NaN
```

```js
// == 相关的规则：
// null == undefined // true（特殊规定）
// string == number // string 转 number
// boolean == any // boolean 转 number
// object == primitive // 对象转原始类型（通过 toPrimitive 方法）

console.log('1' == 1); // true
console.log(true == 1); // true
console.log(true == 2); // false
console.log(null == undefined); // true

console.log([10] == 10); // true
// [10].toString() -> "10"
// "10" == 10
// 10 == 10

console.log({} == '[object Object]'); // true
// {}.toString() -> "[object Object]"

console.log([] == ![]); // true
// ![] -> !(truthy) -> false（逻辑非操作符！优先级高于 ==，所以需要先操作）
// [] == false
// [] == 0
// "" == 0 // [].toString() 得到 ""
// 0 == 0 -> true
```

```js
// 原始表达式
[] == ![]

// 1. 先计算右边：! 优先级高于 ==，所以先做逻辑非运算
//    - [] 是对象，永远为 truthy
//    - ![] -> !true -> false
[] == false

// 2. 现在是比较 [] == false
//    根据规范：
//    - 如果一边是对象，一边是布尔值，则先把布尔值转数字
//      ToNumber(false) -> 0
[] == 0

// 3. 现在是比较 [] == 0
//    根据规范：
//    - 如果一边是对象，一边是数字，则把对象先转成原始值（ToPrimitive）
//      - 对于普通对象，先调用 valueOf()；如果 valueOf() 返回的不是原始值，再调用 toString()
//      - 数组的 valueOf() 返回自身（仍是对象），于是走 toString()
//      - [].toString() -> ""   （数组转字符串就是去掉中括号，留下空字符串）
"" == 0

// 4. 现在是比较 "" == 0
//    根据规范：
//    - 如果一边是字符串，一边是数字，则把字符串转数字（ToNumber）
//      ToNumber("") -> 0
//      ToNumber("111") -> 111
//      ToNumber("0x111") -> 273
//      ToNumber("111abc") -> NaN
0 == 0

// 5. 最终比较
true
```

### Truthy & Falsy

Falsy 值：

- `false`
- `0`
- `""`
- `null`
- `undefined`
- `NaN`

其他值都是 Truthy（包括 `{}` 和 `[]`）

### 双等号与三等号

双等号是宽松相等，类型不同时，会先转换类型，再比较值，转换规则复杂易出错；三等号是严格相等比较，要求类型相同、值相同，从不进行类型转换。

```js
console.log(77 === '77'); // false
console.log(77 == '77'); // true

console.log(true === 1); // false
console.log(true == 1); // true

console.log(null === undefined); // false
console.log(null == undefined); // true

// 下面比较的是引用值
// 同时由于两边类型相同，所以没有经过转换
const obj1 = {};
const obj2 = {};
const obj3 = obj2;
console.log(obj1 === obj2); // false
console.log(obj1 == obj2); // false
console.log(obj2 === obj3); // true
console.log(obj2 == obj3); // true
```

### 特殊：`x == null`

```js
x == null
// 等价于
x === null || x === undefined
```

### 特殊：NaN

```js
console.log(NaN == NaN); // false
console.log(NaN === NaN); // false
// 正确判断方法：Number.isNaN()
```

## 介绍一下 `call()`、`apply()` 和 `bind()`

这三个方法都是 JavaScript 中用于控制函数中 `this` 指向的重要方法，但它们在使用方式和行为上有所不同。

- `call`：调用函数并指定函数内部 `this` 的指向，参数以逗号形式传入，立即执行函数。
- `apply`：调用函数并指定函数内部 `this` 的指向，参数以数组形式传入，立即执行函数。
- `bind`：返回一个新函数，指定函数内部 `this` 的指向，不会立即执行函数。

*`call` 的性能会优于 `apply`*，具体参考：[call 和 apply 的性能对比 · Issue #6 · noneven/__](https://github.com/noneven/__/issues/6)

```js
// 示例对象
const person = {
  fullName: '张三',
  greet: function(greeting, message) {
    return `${greeting}, 我是 ${this.fullName}. ${message}`;
  }
};

const anotherPerson = { fullName: '李四' };

// call 方法 - 参数逐个传递
console.log(person.greet.call(anotherPerson, '你好', '很高兴认识你！'));
// 输出："你好，我是 李四。很高兴认识你！"

// apply 方法 - 参数以数组形式传递
console.log(person.greet.apply(anotherPerson, ['你好', '很高兴认识你！']));
// 输出："你好，我是 李四。很高兴认识你！"

// bind 方法 - 返回新函数，不立即执行
const greetLisi = person.greet.bind(anotherPerson);
console.log(greetLisi('你好', '很高兴认识你！'));
// 输出："你好，我是 李四。很高兴认识你！"

// bind 方法还可以预设部分参数
const greetLisiWithHello = person.greet.bind(anotherPerson, '你好');
console.log(greetLisiWithHello('很高兴认识你！'));
// 输出："你好，我是 李四。很高兴认识你！"
```

## 介绍一下 try...catch 的捕获范围

`try...catch` 只能捕获同步执行代码中的异常。即在 **同一个调用栈（call stack）** 内发生并被抛出的错误。

```js
try {
  throw new Error("同步异常");
} catch (err) {
  console.log("捕获到：", err.message); // ✅ 输出 "同步异常"
}
```

异步回调（如 `setTimeout`、事件监听、`Promise`）中的任务无法被捕获，因为它们在事件循环的下一轮执行，当异常抛出时，原来的 `try` 块已经结束，作用域已不存在。

```js
try {
  setTimeout(() => {
    throw new Error("异步异常");
  }, 0);
} catch (err) {
  console.log("捕获不到：", err.message); // ❌ 不会执行
}
```

正确的处理方案：

| 场景                 | 解决方案                 |
| ------------------ | -------------------- |
| 回调函数（如 setTimeout） | 在回调内使用 `try...catch` |
| Promise 异常         | 使用 `.catch()`        |
| async/await 异常     | 外层 `try...catch`     |
| 全局未捕获异常            | 使用全局监听事件（见下）             |

浏览器环境：

```js
window.addEventListener("error", e => console.error("全局错误：", e.error));
window.addEventListener("unhandledrejection", e => console.error("Promise 未捕获：", e.reason));
```

Node.js 环境：

```js
process.on("uncaughtException", err => console.error("未捕获异常：", err));
process.on("unhandledRejection", err => console.error("Promise 未捕获：", err));
```

## 介绍一下 `Object.freeze`、`Object.seal`、`Object.preventExtensions`

| 方法                         | 可扩展 | 可删除属性 | 可修改属性值 | 可修改属性特性 |
| -------------------------- | --- | ----- | ------ | ------- |
| `Object.freeze`            | ❌   | ❌     | ❌      | ❌       |
| `Object.seal`              | ❌   | ❌     | ✅      | ❌       |
| `Object.preventExtensions` | ❌   | ✅     | ✅      | ✅       |

- `Object.freeze`：冻结对象，使对象不可扩展、不可删除、不可修改属性值和属性特性（如 `writable`、`configurable`、`enumerable`）。
- `Object.seal`：密封对象，使对象不可扩展、不可删除属性，但可以修改属性值。
- `Object.preventExtensions`：阻止对象扩展，使对象不可扩展，但可以删除和修改属性值。

> [!note]
> 扩展，指的是向对象添加新属性。

## 介绍一下对象属性的特性

在 JavaScript 中，对象属性除了包含值（`value`）之外，还有三个描述该属性行为的布尔特性：`writable`、`enumerable`、`configurable`。这些特性通常被称为 **属性描述符（Property Descriptor）**，它们决定了属性在对象中的行为方式。

- **writable** - 可写性，控制属性值是否可以被修改，默认为 `true`

  ```js
  const obj = { name: 'Alice' };

  // 普通属性可以修改
  obj.name = 'Bob'; // ✅ 成功

  // 设置为不可写
  Object.defineProperty(obj, 'name', { writable: false });
  obj.name = 'Charlie'; // ❌ 静默失败（严格模式下会抛错）
  console.log(obj.name); // "Bob"
  ```

- **enumerable** - 可枚举性，控制属性是否会出现在枚举操作中，影响 `for...in`、`Object.keys()`、`JSON.stringify()`、扩展运算符 `...` 等，默认为 `true`

  ```js
  const obj = {
    a: 1,
    b: 2
  };

  Object.defineProperty(obj, 'c', {
    value: 3,
    enumerable: false
  });

  console.log(Object.keys(obj)); // ["a", "b"]
  console.log('c' in obj); // true（可访问）
  console.log(obj.c); // 3（可访问）
  ```

- **configurable** - 可配置性，控制属性描述符是否可以被修改、属性是否可以被删除，默认为 `true`

  ```js
  const obj = { name: 'Alice' };

  Object.defineProperty(obj, 'name', {
    configurable: false
  });

  delete obj.name; // ❌ 失败，属性依然存在
  Object.defineProperty(obj, 'name', { enumerable: false }); // ❌ TypeError
  ```

可以通过 `Object.getOwnPropertyDescriptor()` 来查看：

```js
const obj = { name: 'Alice' };
const descriptor = Object.getOwnPropertyDescriptor(obj, 'name');
console.log(descriptor);
// 输出：
// {
//   value: 'Alice',
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
```

可以通过 `Object.defineProperty` 来进行修改：

```js
const obj = {};

Object.defineProperty(obj, 'id', {
  value: 1001,
  writable: false,
  enumerable: true,
  configurable: false
});

// 或者同时定义多个属性
Object.defineProperties(obj, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 25,
    writable: false,
    enumerable: false,
    configurable: false
  }
});
```

注意 getter 和 setter 的特例，它们没有 `writable`：

```js
const obj = {
  _name: 'Alice',
  get name() { return this._name; },
  set name(value) { this._name = value; }
};

const descriptor = Object.getOwnPropertyDescriptor(obj, 'name');
console.log(descriptor);
// 输出：
// {
//   get: [Function: get name],
//   set: [Function: set name],
//   enumerable: true,
//   configurable: true
// }
```

## 介绍一下数组的 `length`

数组的 `length` 是一个属性（而非方法），其值是数组长度（它不是数组里元素的个数，而是最大的数字索引值加一）。可以手动修改该值：增加不会产生什么特殊效果，但减少就能截断数组，该过程是不可逆的。

## 介绍一下函数的 `length`

函数也是特殊的对象，它有一个 `length` 属性，该属性表示函数的形参个数。但是，rest 参数和默认参数不会计入 `length` 属性。

## 介绍一下命名函数表达式（NFE, Named Function Expression）

命名函数表达式是指在函数表达式中给函数命名，这样函数可以在函数内部引用自身，但在外部无法访问。

```js
let sayHi = function func(who) {
  if (who) {
    alert(`Hello, ${who}`);
  } else {
    func("Guest"); // 使用 func 再次调用函数自身
  }
};

sayHi(); // Hello, Guest

// 但这不工作：
func(); // Error, func is not defined（在函数外不可见）
```

如果不使用 NFE，可能会遇到以下问题：

```js
let sayHi = function(who) {
  if (who) {
    alert(`Hello, ${who}`);
  } else {
    sayHi("Guest"); // Error: sayHi is not a function
  }
};

let welcome = sayHi;
sayHi = null;

welcome(); // Error，嵌套调用 sayHi 不再有效！
```

## 介绍一下原型和原型链

参考：[原型，继承 - JAVASCRIPT.INFO](https://zh.javascript.info/prototypes)

JavaScript 对象有一个特殊的隐藏属性 `[[Prototype]]`，它要么是 `null`，要么是对另一个对象引用。这个被引用的对象就被称作“原型”。

借助原型，可以：

1. 实现继承
2. 节省内存
3. 动态性

如果我们尝试读取某个对象的一个缺失的属性时，JS 会自动尝试从原型中获取该属性，这就是所谓的“**原型继承（Prototypal inheritance）**”。

`[[Prototype]]` 是隐藏的，但可以通过以下手段来访问它：

- `__proto__`：用于访问 Prototype 的非标准（但常用的）属性
- [`Object.getPrototypeOf(obj)`](https://developer.mozilla.org/zh/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) 和 [`Object.setPrototypeOf(obj, proto)`](https://developer.mozilla.org/zh/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)：ES6+ 推荐使用

<details>
<summary>`__proto__` 和 `Object.get/setPrototypeOf` 的示例</summary>

```js
// 1. 准备一个父对象
const father = { surname: 'Stark' };

// 2. 用 __proto__ 创建并修改原型链（老式写法）
const child1 = {};
child1.__proto__ = father;          // 写
console.log(child1.surname);        // 读 → Stark
console.log(child1.__proto__ === father); // true

// 3. 用 ES6+ 标准 API 做一模一样的事
const child2 = {};
Object.setPrototypeOf(child2, father);
console.log(Object.getPrototypeOf(child2) === father); // true
console.log(child2.surname);        // Stark

// 4. 裸对象：__proto__ 彻底失灵，标准 API 依旧 OK
const naked = Object.create(null);  // 原型链为空，没有 Object.prototype
naked.__proto__ = father;           // 只是普通字符串键，不会改 [[Prototype]]
console.log(naked.surname);         // undefined
console.log(naked.__proto__);       // 普通数据属性，值是 father

Object.setPrototypeOf(naked, father);// 标准 API 不受限制
console.log(naked.surname);         // Starkonsole.log("模拟 new 返回对象：", t2);

// Output
/*
Stark
true
true
Stark
undefined
{ surname: 'Stark' }
Stark
*/
```

</details>

> [!note]
> [`Object.create(proto [, propertiesObject])`](https://developer.mozilla.org/zh/docs/Web/JavaScript/Reference/Global_Objects/Object/create)：创建一个新对象，将新对象的 `[[Prototype]]` 设置为指定原型，实现纯粹的基于原型的继承。例如，可以使用 `const nakedObj = Object.create(null)` 创建一个纯粹的空对象。

另外，还有一个名为 `prototype` 的常规属性。如果该属性的值是一个对象的引用，那么 `new` 操作符会使用它为新对象设置 `[[Prototype]]`。例如：

```js
let animal = {
  eats: true
};

function Rabbit(name) {
  this.name = name;
}

Rabbit.prototype = animal;

let rabbit = new Rabbit("White Rabbit"); //  rabbit.__proto__ == animal

alert( rabbit.eats ); // true
```

设置 `Rabbit.prototype = animal` 的字面意思是：“当创建了一个 `new Rabbit` 时，把它的 `[[Prototype]]` 赋值为 `animal`”。

> [!note]
> 如果在创建之后，`prototype` 属性有了变化（`F.prototype = <another object>`），那么通过 `new F` 创建的新对象也将随之拥有 **新的对象** 作为 `[[Prototype]]`，但 **已经存在的对象将保持旧有的值**。这是“完全替换原型”的情况，只会影响新的实例。
> 需要注意，这与“直接修改现有原型对象的属性”（如 `F.prototype.foo = bar`）有本质区别：当在现有原型对象上添加、修改或删除属性时，所有通过该构造函数创建的实例（**无论新旧**）都会立即受到影响，因为它们共享同一原型对象的引用。

默认的 `prototype` 是一个只有属性 `constructor` 的对象，该 `constructor` 属性指向自身：

```js
function Rabbit() {}

/* 默认的 prototype
Rabbit.prototype = { constructor: Rabbit };
*/
```

## 介绍一下 `new function` 语法和 `new` 操作符

`new function` 实际上是对 **函数表达式** 使用 `new` 操作符，这会将函数视作 *构造函数*，创建一个函数实例并立即执行构造函数。具体而言，对函数使用 `new` 会进行如下步骤：

1. **创建新对象**：生成一个空的 JavaScript 对象 `{}`。
2. **链接原型**：将新对象的 `__proto__` 属性指向构造函数的 `prototype`。
3. **绑定 `this`**：将构造函数内部的 `this` 绑定到新对象。
4. **返回对象**：如果构造函数没有显式返回一个对象，则自动返回新创建的对象。

<details>
<summary>手动模拟一个 `new`</summary>

```js
function myNew(Constructor, ...args) {
  // 1. 创建一个空对象
  const obj = {};

  // 2. 将这个空对象的原型指向构造函数的原型
  Object.setPrototypeOf(obj, Constructor.prototype);

  // 3. 将构造函数的 this 指向这个空对象，并执行构造函数
  const result = Constructor.apply(obj, args);

  // 4. 如果构造函数返回的是一个对象，则返回这个对象；否则返回创建的对象
  return result !== null &&
    (typeof result === "object" || typeof result === "function")
    ? result
    : obj;
}

// 测试一下
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function () {
  console.log(`Hello, my name is ${this.name}`);
};

// 使用原生 new
const p1 = new Person("Alice", 25);
console.log("原生 new:", p1);
p1.sayHello();

// 使用模拟的 new
const p2 = myNew(Person, "Bob", 30);
console.log("模拟 new:", p2);
p2.sayHello();

// 测试构造函数返回对象的情况
function TestReturn() {
  this.value = 123;
  return { custom: "object" }; // 返回一个对象
}

const t1 = new TestReturn();
const t2 = myNew(TestReturn);
console.log("原生 new 返回对象：", t1);
console.log("模拟 new 返回对象：", t2);
```

</details>

```js
// 创建单例配置对象
const config = new function() {
  this.apiUrl = 'https://api.example.com';
  this.timeout = 5000;
  this.retries = 3;

  this.getFullUrl = function(endpoint) {
      return this.apiUrl + endpoint;
  };
};

console.log(config.getFullUrl('/users')); // 输出：https://api.example.com/users
```

```js
// 定义一个普通函数（构造函数）
function Person(name, age) {
  this.name = name; // 给新对象添加属性
  this.age = age;
}

// 添加方法到原型（所有实例共享）
Person.prototype.greet = function() {
  console.log(`Hello, I'm ${this.name}, ${this.age} years old.`);
};

// 用 new 实例化
const alice = new Person("Alice", 30);
const bob = new Person("Bob", 25);

alice.greet(); // 输出：Hello, I'm Alice, 30 years old.
bob.greet();   // 输出：Hello, I'm Bob, 25 years old.
```

## 介绍一下 `new Function` 语法

`new Function` 语法允许我们创建一个新的函数。语法如下：

```js
let func = new Function([arg1, arg2, ...argN], functionBody);
```

- `arg1, arg2, ...argN` 是函数的参数。
- `functionBody` 是函数体。

例如：

```js
let sum = new Function('a', 'b', 'return a + b');
alert(sum(1, 2)); // 3
```

它实际上是一种将字符串转换为函数的方式。例如，我们可以从服务器接收一个函数，并使用 `new Function` 运行它。

使用 `new Function` 创建的函数的 `[[Environment]]` 并不指向当前的词法环墿，而是指向全局环境。这意味着它无法访问当前函数的局部变量。

```js
function getFunc() {
  let value = "test";

  let func = new Function('alert(value)');

  return func;
}

getFunc()(); // error: value is not defined
```

## 介绍一下执行上下文和作用域链

执行上下文（Execution Context，简称 EC）是 JS 引擎执行代码的 *抽象环境*，包含变量、函数、`this` 指向等信息。代码执行，就会创建对应的 EC。

执行上下文分为：

- **全局执行上下文（Global EC）:** 最外层的上下文，程序启动时创建，它有一个
- **函数执行上下文（Functional EC）:** 函数调用时被创建，每次调用都会创建一个新的

上下文的管理由执行栈（又称 **调用栈（Call Stack）**）负责，它是一个栈，遵循 LIFO（Last-In, First-Out）。

---

作用域链（Scope Chain）是由 **当前** 及 **所有父级** 词法环境组成的链表，决定了变量的查找顺序（由内向外，逐级向上）。函数的作用域在 **定义时** 就已确定，与在哪里调用无关。

## 介绍一下什么是闭包

**闭包** 指函数能够 *记住并访问其词法作用域，即使该函数在其定义的作用域外执行*。它是词法作用域的自然产物，作用域链是实现闭包的底层机制。

简单来说，*闭包是函数与其相关变量的引用环境的组合*，它允许函数“捕获”并保留对其外部作用域中变量的访问权限。例如，在 JavaScript 中，当内层函数引用了外层函数的变量，并被返回或传递后，即使外层函数已经执行完毕，内层函数依然可以访问和修改这些变量，这就是闭包的典型体现。（当一个 *内部函数*，被 *暴露* 到其词法作用域 *之外* 时，闭包就形成了）

闭包的核心特点是 *保留外部变量的引用和维持状态*。比如，通过闭包可以实现一个计数器函数：外层函数定义变量`count`，内层函数通过修改并返回`count`的值，每次调用时都能“记住”之前的计数值。这种特性使得闭包在 *数据封装*、*私有变量*、*回调函数*、*函数工厂* 等场景中非常有用，例如隐藏私有变量、在异步操作中保持上下文，或动态生成具有特定行为的函数。

```js
function getCounter() {
  let count = 0;
  return {
    current() {
      return count;
    },
    increment() {
      return count++;
    },
  };
}
const counter = getCounter();
console.log(counter.current());
counter.increment();
console.log(counter.current());
```

注意事项：

- 查找时间：作用域链越长，查找越慢
- 内存占用：闭包会组织外部变量被回收

## 介绍一下 IIFE

**立即执行函数表达式（Immediately Invoked Function Expression）** 是一种定义后 *立即执行* 的 JS 函数，是一种 JS 设计模式。

为什么需要 IIFE？主要是为了 **作用域隔离（Scope Isolation）**。函数是早期 JS 创建独立作用域的方式，IIFE 利用函数作用域隔离内部变量和函数，避免变量命名冲突和意外的全局变量污染（尤其是 ES6 以前）。

## 介绍一下下面的输出结果

```js
// 示例 1
for (var i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 100);
}
```

```js
// 示例 2
for (var i = 0; i < 5; i++) {
  (function (index) {
    setTimeout(function () {
      console.log(index);
    }, index * 100);
  })(i);
}
```

示例 1 输出 5 个 5，因为 `var` 声明的变量在循环中共享一个作用域。当 `setTimeout` 回调执行时，循环已结束，`i` 的最终值为 5。

示例 2 输出 0、1、2、3、4。它通过立即执行函数（IIFE）为每次迭代创建新的作用域，并将当前 `i` 值捕获并作为参数传入新的作用域。

最佳的解决方案是使用 `let`。因为 `let` 声明的变量具有块级作用域，每轮循环都会为变量创建新的绑定。下面的代码输出也是 0、1、2、3、4：

```js
for (let j = 0; j < 5; j++) {
  setTimeout(function() {
    console.log(j);
  }, j * 100);
}
```

## 下面这段代码会输出什么？

```js
for (var i = 0; i < 3; i++) {
  document.getElementById('btn').addEventListener('click', function() {
    console.log(i);
  });
}
```

这段代码的输出会是：**每次点击按钮都会打印 `3`**。

原因分析：

1. **循环执行**：`for` 循环会执行 3 次，为同一个按钮添加了 3 个相同的点击事件监听器。
2. **变量作用域**：`var i` 是函数作用域，而不是块级作用域。循环结束后，`i` 的值变为 `3`（当 `i = 3` 时循环条件 `i < 3` 不满足，循环结束）。
3. **闭包问题**：所有的事件处理函数都共享同一个变量 `i` 的引用。当点击事件发生时，循环早已结束，此时 `i` 的值已经是 `3`。
4. **实际执行过程**：
   - 循环快速执行完毕，`i` 最终值为 `3`
   - 用户点击按钮时，所有 3 个事件处理函数都会执行
   - 每个处理函数都会读取当前的 `i` 值，即 `3`
   - 所以每次点击都会输出 3 次 `3`

如果想要输出 0, 1, 2，可以使用以下方法之一：

**方法 1：使用 `let`（块级作用域）**

```javascript
for (let i = 0; i < 3; i++) {
  document.getElementById('btn').addEventListener('click', function() {
    console.log(i); // 输出 0, 1, 2
  });
}
```

**方法 2：使用 IIFE**

```javascript
for (var i = 0; i < 3; i++) {
  (function(index) {
    document.getElementById('btn').addEventListener('click', function() {
      console.log(index);
    });
  })(i);
}
```

**方法 3：使用事件对象的其他方式**（如果适用）

```javascript
// 如果只需要知道点击次数等
let count = 0;
document.getElementById('btn').addEventListener('click', function() {
  console.log(count++ % 3); // 循环输出 0, 1, 2
});
```

## 介绍一下 `this`

具体请见：[this - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)

`this` 关键字是一个特殊的对象引用。在绝大多数情况下，它是 *运行时绑定（Runtime Binding）* 的，也就是说它在函数被调用时才确定，由函数的调用方式决定，并且每次函数被调用时 `this` 的值也可能不同。

- 规则一：默认绑定。函数独立调用，无规则应用时使用该规则。在非严格模式下指向全局对象（例如在浏览器中是 `window`，Node.js 中是 `global`），在严格模式下是 `undefined`

- 规则二：隐式绑定。函数作为一个对象的方法被调用，此时 `this` 指向该方法的对象本身。需要注意“隐式丢失”问题：将对象方法赋值给一个新变量后独立调用，此时的 `this` 指向丢失

  ```js
  const user = {
    name: 'Alice',
    greet: function() {
      console.log(`Hello, ${this.name}`);
    }
  };
  user.greet(); // "Hello, Alice" （this 指向 user）

  const standaloneGreet = user.greet;
  standaloneGreet(); // 非严格模式为 "Hello, " （this 指向全局对象）
  ```

- 规则三：显式绑定。通过 `call()`、`apply()`、`bind()` 进行绑定

- 规则四：`new` 绑定。使用 `new` 关键字调用函数，`this` 将指向一个全新的空对象。

优先级上，从一到四逐级递增。最低的是规则一，最高的是规则四。

### 特殊：箭头函数

箭头函数 **没有** 自己的 `this` 绑定，其 `this` 由 **定义时** 所在的 **词法作用域** 决定。一旦绑定，**不可** 被 `call`/`apply`/`bind` 修改。

```js
const obj = {
  name: "My Object",
  regularMethod: function () {
    // 此处 this 指向 obj
    console.log(this.name); // "My Object"

    // 箭头函数捕获了 regularMethod 的 this
    const arrowFunc = () => {
      console.log(this.name);
    };
    arrowFunc(); // "My Object"
  },
};
obj.regularMethod();
```

常见误区：

```js
// this 捕获的是定义时的环境，而非调用时
const obj = {
  name: "My Object",
  arrowMethod: () => {
    console.log(this.name);
  }
};
obj.arrowMethod(); // undefined

// 另一个例子
// 此处 setTimeout 的回调函数是被 **独立调用** 的
// 所以它会丢失 myTimer 的上下文，触发的是默认绑定
const myTimer = {
  seconds: 0,
  start() {
    setTimeout(function() {
      console.log(this.seconds++);
    }, 1000);
  }
};
myTimer.start();

// 修正方法：
// 1. 使用 bind()
// setTimeout(function() {
//   console.log(this.seconds++);
// }.bind(this), 1000);
// 2. 使用箭头函数
// setTimeout(() => {
//   console.log(this.seconds++);
// }, 1000);
```

## 介绍一下 Promise

参考：<https://www.bilibili.com/video/BV1PtbDzMEMa?p=22>

Promise 的三种状态：

- pending
- fulfilled
- rejected

这三个状态存在不可逆性，一定是从 pending 开始，结束于 fulfilled 或 rejected。其中后两者又可统称为 settled。

```js
function onFulfilled(value) {
  console.log('onFulfilled:', value);
  return value.toUpperCase(); // 返回处理后的值
}

function onRejected(error) {
  console.log('onRejected:', error);
  return '使用默认值'; // 恢复执行
}

function onFinally() {
  console.log('onFinally: 清理工作');
}

new Promise((resolve, reject) => {
  setTimeout(() => {
    if (success) {
      resolve(successValue);
    } else {
      reject(errorMessage);
    }
  }, 1000);
})
  .then(onFulfilled, onRejected)
  .catch(onRejected)
  .finally(onFinally);
```

`.catch(onRejected)` 类似于 `.then(undefined, onRejected)`；`.then(onFulfilled, onRejected)` 和 `.catch(onRejected)` 的区别在于，前者的 onRejected 只能捕获当前 Promise 的 reject，而后者能捕获当前 Promise 以及之前所有的

如果 Promise 被 rejected 但并未处理，那么在浏览器环境会触发全局的 unhandledrejection 事件，Node.js 中可能导致进程崩溃

如果 Promise 的 executor 中抛出了同步错误（`new Promise(() => { throw new Error('...'); })`，那么 Promise 会立即 reject

---

Promise 至少带来了以下好处：

- 一定程度上解决了回调地狱问题
- 统一的异步写法（`.then().catch()`）
- 更容易处理错误（`.catch()`）

---

TODO: 手写一个简化版本的 Promise:

```js
```

## `Promise` 和 `async/await` 有什么区别？

本质上，后者是基于前者的语法糖，所以实质上是一样的。但是在使用方式和语法上有一些区别：

`Promise` 是一种基于链式调用的 API，可以使用 `.then()` 和 `.catch()` 方法来处理异步操作的结果和错误。它的引入一定程度上缓解了回调地狱问题，但较长的链式调用仍然会导致代码可读性下降。

`async/await` 是基于 `Promise` 的语法糖，允许我们使用同步的方式编写异步代码。它使得异步代码看起来更像是同步代码，从而提高了可读性和可维护性。`async/await` 使得错误处理更简单，因为我们可以使用 `try/catch` 块来捕获错误，而不需要在每个 `.then()` 后面添加 `.catch()`。

```js
// 这样写
async function example() {
  await someValue;
  console.log('after await');
}

// 实际上相当于
function example() {
  return Promise.resolve(someValue).then(() => {
    console.log('after await');
  });
}
```

其中 `Promise.resolve()` 的作用是 **创建一个立即解决的 `Promise`**，它返回一个已经处于 `fulfilled` 状态的 `Promise` 对象。

```js
// 创建一个立即解决的 Promise
const resolvedPromise = Promise.resolve('成功值');

// 等同于
const resolvedPromise = new Promise((resolve) => {
  resolve('成功值');
});
```

我们可以对此 `resolvedPromise` 调用 `then()`：

```js
resolvedPromise.then(value => {
  console.log(value); // 输出："成功值"
});
```

## 使用 Promise 和 async/await 语法分别应如何捕获错误？

TODO

## 介绍一下 JS 中的事件循环

事件循环的完整流程是，每个周期：

1. 执行来自宏任务队列的*一个宏任务*（如脚本执行、DOM 事件、`setTimeout`、`setInterval`、Node.js 环境的 `setImmediate`、I/O 操作等）。
2. 执行当前微任务队列中的*所有微任务*（如 `Promise` 回调（`Promise.then/catch/finally`）、`MutationObserver`），包括执行过程中产生的新微任务。
3. 渲染更新（重排、重绘等）。
4. 进入下一个周期。

任务队列包括**宏任务队列**和**微任务队列**，宏任务队列中的任务优先级较低，微任务队列中的任务优先级较高。在每个周期中，会先清空当前微任务队列，再执行一个宏任务，然后进入下一个周期。这种机制保证了微任务的优先级，避免了长时间运行的任务阻塞页面渲染。

下面是一个例子：

```js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2 start');
  return new Promise((resolve, reject) => {
    resolve();
    console.log('async2 promise');
  })
}

console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

async1();

new Promise(function(resolve) {
  console.log('promise1');
  resolve();
}).then(function() {
  console.log('promise2');
}).then(function() {
  console.log('promise3');
});

console.log('script end');

/*
script start
async1 start
async2 start
async2 promise
promise1
script end
promise2
promise3
async1 end
setTimeout
*/
```

执行顺序：

1. **同步代码执行**（第一个宏任务）：
   - 输出 "script start"
   - `setTimeout` 安排宏任务
   - 调用 `async1()` → 输出 "async1 start"
   - 调用 `async2()` → 输出 "async2 start"
   - `new Promise` 同步执行 → 输出 "async2 promise"
   - `new Promise` 同步执行 → 输出 "promise1" 并 resolve
   - 输出 "script end"

2. **微任务队列开始执行**：
   - 第一个微任务：第一个 `.then()` → 输出 "promise2"
     - 执行后产生新的微任务（第二个 `.then()`）
   - 第二个微任务：第二个 `.then()` → 输出 "promise3"
   - 第三个微任务：`await` 产生的微任务（在 V8 中，`await` 产生的微任务会晚于直接的 `.then()` 产生的微任务入队） → 输出 "async1 end"

3. **下一个宏任务**：
   - `setTimeout` 回调 → 输出 "setTimeout"

<details>
<summary>为什么 "async1 end" 在 "promise2" 和 "promise3" 之后？</summary>

### `await` 产生微任务的时机

`await` 的行为比简单的 `.then()` 要复杂一些。`await expression` 这行代码，大致可以分解为以下步骤：

1. `expression` （也就是 `async2()`) 会被立即执行。这个表达式的返回值（一个 Promise）被保存下来。
2. **引擎会暂停 `async` 函数的执行**，这一点和 `.then()` 不同，`.then()` 只是注册回调，并不会暂停当前函数的执行。
3. 引擎会等待 `expression` 返回的 Promise 的状态变为 `settled` （即 `fulfilled` 或 `rejected`）。
4. **当且仅当该 Promise 变为 `fulfilled` 状态后**，引擎才会将 `async` 函数剩余的部分（`console.log('async1 end')`）包装成一个微任务，并**将其放入微任务队列**。如果是 `rejected`，则会进行类似的处理，但会寻找 `catch` 块。

在你的例子中，`async2` 内部的 `resolve()` 是同步执行的，所以 `await async2()` 右侧的 Promise 几乎是立即就变成了 `fulfilled` 状态。因此，**在 `await` 这一行代码执行时，`async1 end` 这个微任务就被加入了队列**。

### 为什么 `async1 end` 甚至晚于 `promise3`？

这是最核心的问题。它揭示了微任务队列的一个重要特性：**队列并非一个简单的先进先出（FIFO）队列，尤其是在 V8 引擎（Chrome, Node.js）的实现中，Promise 的处理有更高的优先级。**

让我们用一个更精确的步骤来重演整个过程：

**第一轮：同步执行**

1. `console.log('script start')` -\> 打印 `script start`。
2. `setTimeout` -\> **注册一个宏任务**。
3. 执行 `async1()`:
      - `console.log('async1 start')` -\> 打印 `async1 start`。
      - 执行 `await async2()`:
          - `console.log('async2 start')` -\> 打印 `async2 start`。
          - `async2` 返回的 Promise 执行了 `resolve()`，并同步打印 `async2 promise`。这个 Promise 立即变为 `fulfilled` 状态。
          - **`await` 机制看到 Promise 已经 `fulfilled`，于是将 `console.log('async1 end')` 包装成微任务（我们称之为 A）并加入微任务队列。**
          - `async1` 函数暂停。
4. 执行 `new Promise(...)`:
      - `console.log('promise1')` -\> 打印 `promise1`。
      - 这个 Promise 执行了 `resolve()`，立即变为 `fulfilled` 状态。
5. 执行 `.then(function() { console.log('promise2') })`：
      - 因为 Promise 已经 `fulfilled`，这个 `.then` 的回调**被包装成微任务（我们称之为 B）并加入微任务队列。**
6. `console.log('script end')` -\> 打印 `script end`。

**同步代码结束。此时的微任务队列状态是：`【微任务 B, 微任务 A】`**。（根据 V8 引擎的实现，直接由 `.then` 产生的微任务会先于 `await` 产生的微任务入队）。

-----

**第二轮：微任务处理**

事件循环开始处理微任务，它会**持续执行直到微任务队列被清空**。

1. **取出队首的微任务 B 并执行。**

      - 执行 `console.log('promise2')` -\> 打印 `promise2`。
      - 微任务 B 执行完毕。重要的是，这个 `.then` 方法本身会返回一个新的 Promise（我们称之为 `PromiseP2`）。当 `console.log('promise2')` 成功执行后，`PromiseP2` 的状态会变为 `fulfilled`。

2. **`PromiseP2` 状态的改变，会立即触发后续的 `.then`。**

      - 由于 `PromiseP2` 后面跟着一个 `.then(function() { console.log('promise3') })`，这个回调**被包装成一个新的微任务（我们称之为 C）并被加入到微任务队列的末尾。**
      - 此时的微任务队列状态是：`【微任务 A, 微任务 C】`。

3. **为什么 `promise3` 能“插队”？**
    这并非插队，而是 V8 引擎为了优化 `Promise` 链式调用而采取的策略。引擎在处理微任务时，如果一个微任务本身（比如微任务 B）的完成又触发了一个新的、属于同一个 `Promise` 链的微任务（微任务 C），**引擎会倾向于在处理队列中其他“旧”的微任务（比如微任务 A）之前，继续沿着这条 `Promise` 链走下去**。这保证了 `Promise` 链的执行是连续的，符合开发者的直觉。

      - 因此，引擎会优先处理刚刚因 `promise2` 完成而产生的微任务 C。

4. **取出微任务 C 并执行。**

      - 执行 `console.log('promise3')` -\> 打印 `promise3`。
      - 此时的微任务队列状态是：`【微任务 A】`。

5. **取出微任务 A 并执行。**

      - 恢复 `async1` 函数的执行。
      - 执行 `console.log('async1 end')` -\> 打印 `async1 end`。

6. 微任务队列现在为空，本轮事件循环的微任务处理阶段结束。

7. **第三轮：宏任务处理**

      - 执行 `setTimeout` 的回调，打印 `setTimeout`。

</details>

## Intersection Observer 的事件回调是宏任务还是微任务？如何判断呢？

这是一个微任务，可以通过类似下面的代码的输出来验证：

```js
console.log('start');

const observer = new IntersectionObserver(() => {
  console.log('IntersectionObserver callback');
});
observer.observe(document.createElement('div'));

Promise.resolve().then(() => {
  console.log('Promise.then');
});

setTimeout(() => {
  console.log('setTimeout');
}, 0);

console.log('end');

/*
输出：
start
end
Promise.then
IntersectionObserver callback
setTimeout
*/
```

- 同步代码先执行，输出 `start` 和 `end`。
- 执行完同步代码后，微任务队列里的 `Promise.then` 执行且输出 `Promise.then`。
- 接下来，IntersectionObserver 观察到了内容，相应的回调函数被放入微任务队列。由于一次宏任务之后需要清空微任务队列，所以该微任务被执行且输出 `IntersectionObserver callback`。
- 最后，宏任务队列里的 `setTimeout` 执行且输出 `setTimeout`。

## 介绍一下 JS 的垃圾回收的内部实现

垃圾回收的基本算法叫作 Mark-and-sweep。定期执行以下“垃圾回收”步骤：

- 垃圾收集器找到所有的根，并“标记”（记住）它们。
- 然后它遍历并“标记”来自它们的所有引用。
- 然后它遍历标记的对象并标记 它们的 引用。所有被遍历到的对象都会被记住，以免将来再次遍历到同一个对象。
- ...如此操作，直到所有可达的（从根部）引用都被访问到。
- 没有被标记的对象都会被删除。

具体参考：[垃圾回收](https://zh.javascript.info/garbage-collection)

## 介绍一下 JS 引擎的执行过程

| 阶段                     | 做什么               | 说明                    |
| ---------------------- | ----------------- | --------------------- |
| 1. 解析（Parse）           | 源码 → Tokens → AST | 词法/语法分析，生成抽象语法树       |
| 2. 字节码生成（Ignition）     | AST → Bytecode    | 快速产出可执行的字节码，同时收集运行时信息 |
| 3. 执行                  | 逐条解释字节码           | 首次执行速度已足够快            |
| 4. 热点代码分析与优化（TurboFan） | 高频函数 → 优化机器码      | 用推测内联、循环展开等手段，再次提速    |
| 5. 动态去优化               | 假设失效 → 回退到字节码     | 保持语义正确，牺牲部分性能         |
| 6. 垃圾回收                | 内存自动管理            ||

## 介绍一下 JS 中的内存泄露，以及，如何检查和解决

| 场景            | 示例代码                                                                         | 解决要点                             |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| 1. 全局变量       | `window.cache = {}`                                                          | 不用时 `cache = null`，或改用局部作用域      |
| 2. 被遗忘的闭包     | `function outer(){ const huge = new Array(1e6); return () => huge.length; }` | 暴露出去的函数如对 `huge` 无引用，则令其为 `null` |
| 3. 游离的 DOM 节点 | 从文档移除节点但仍有变量指向它                                                              | 移除时手动 `element = null`           |
| 4. 未解绑的事件监听   | `addEventListener('scroll', handler)` 未 `removeEventListener`                | 组件卸载时统一解绑                        |
| 5. 长生命周期缓存    | 无限增长的 `Map`/`Array` 缓存                                                       | 设置最大容量 + LRU 清理策略                |

## 介绍一下 Proxy

## 介绍一下 `Object` 上的实用方法

## `var`、`let`、`const` 的区别是什么？

- **作用域**：`var` 是函数作用域，比如在 `if` 或 `for` 块内用 `var` 声明的变量会“泄露”到外部，而 `let` 和 `const` 是块级作用域（用 `{}` 包裹的区域），变量只在块内有效。比如，用 `var` 在循环中声明的变量在循环外还能访问，但 `let` 就不行。
- **变量提升**：`var` 声明的变量会被提升到作用域顶部，但赋值不会，所以声明前访问会得到 `undefined`；而 `let` 和 `const` 虽然也会被提升，但存在“暂时性死区”（Temporal Dead Zone, TDZ），在声明前访问会直接报错。
- **重复声明**：`var` 允许在同一作用域内重复声明变量，而 `let` 和 `const` 会直接报错，避免了意外覆盖变量的问题。
- **不可变性**：`const` 声明的变量不能重新赋值（但如果是对象或数组，其属性或元素可以修改，因为实际上 `const` 保证的是引用的对象不可变），而 `var` 和 `let` 可以随意修改。比如 `const obj = { a: 1 }` 后，`obj.a = 2` 是合法的，但 `obj = {}` 就会报错。

除了上面四个关键点，还有：

`var` 在全局作用域声明的变量会挂载到全局对象（如浏览器的 `window`）上，而 `let` 和 `const` 不会。此外，`var` 的函数作用域特性可能导致一些难以调试的问题（比如闭包中的循环变量问题）。

> [!note]
> 暂时性死区：从作用域 `{` 开始，到变量声明 `let`/`const` 结束，在此区域内访问变量会抛出 `ReferenceError`

## 普通对象和 `Map` 的区别是什么？`Map` 和 `WeakMap` 的区别是什么？

普通对象（普通的 JavaScript 对象）和 `Map` 之间主要有以下几个区别：

- **键的类型**：
  - 普通对象的键必须是字符串或者 Symbol 类型。
  - `Map` 对象的键可以是任意类型，包括对象、函数、原始类型等。
  - 注意：虽然 `map[key]` 也有效，例如我们可以设置 `map[key] = 2`，这样会将 `map` 视为 JavaScript 的 Plain Object，因此它暗含了所有相应的限制（仅支持 string/symbol 键等）。所以我们应该使用 `map` 方法：`set` 和 `get` 等。可以使用 `let map = new Map(Object.entries(obj));`、`let obj = Object.fromEntries(map.entries());` 来转换 Map 和普通对象。

- **键的顺序**：
  - 在普通对象中，键的顺序是根据创建时的顺序排序的，数字键会被排序在最前面。
  - 在 `Map` 对象中，键的顺序是根据插入的顺序排序的。

- **性能**：
  - 对于频繁增删键值对的操作，`Map` 性能通常比普通对象更好。
  - 普通对象更适合用来作为结构化数据的容器。

- **方法和属性**：
  - 普通对象没有内置的方法来获取键的数量。
  - `Map` 对象提供了很多内置的方法，如 `set`、`get`、`has`、`delete`、`size` 等等。

`Map` 和 `WeakMap` 的区别主要有以下几点：

- **键的弱引用**：
  - `Map` 对象的键是强引用，键所引用的对象不会被垃圾回收机制回收。
  - `WeakMap` 对象的键是弱引用，如果没有其他引用指向这个键对象，键对象可以被垃圾回收机制回收。

- **键的类型**：
  - `Map` 对象的键可以是任意类型。
  - `WeakMap` 对象的键必须是对象（且不能是 `null`）。

- **键的枚举**：
  - `Map` 对象可以使用 `keys`、`values`、`entries` 等方法枚举键值对。
  - `WeakMap` 对象没有方法可以枚举键值对，因为键是弱引用的，可能随时会被垃圾回收机制回收。

综上所述，`Map` 更适合用在需要频繁操作键值对的场景下，而 `WeakMap` 更适合用在需要弱引用键的场景下，比如缓存、存储对象的私有数据等。

## 箭头函数和普通函数的区别是什么？

箭头函数是普通函数的简写，可以更优雅的定义一个函数，和普通函数相比，有以下几点差异：

- 函数体内的 `this` 对象，就是定义时所在的对象，而不是使用时所在的对象。
- 不可以使用 `arguments` 对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。
- 不可以使用 `yield` 命令，因此箭头函数不能用作 Generator 函数。
- 不可以使用 `new` 命令，因为：
  - 没有自己的 `this`，无法调用 `call`，`apply`。
  - 没有 `prototype` 属性 ，而 `new` 命令在执行时需要将构造函数的 `prototype` 赋值给新的对象的 `__proto__`

| 特性             | 箭头函数               | 普通函数               |
| ---------------- | ---------------------- | ---------------------- |
| `this` 绑定      | 继承外层作用域         | 动态绑定（调用时决定） |
| `arguments` 对象 | 不可用（用 `...args`） | 可用                   |
| 作为构造函数     | 不允许                 | 允许                   |
| `prototype`      | 无                     | 有                     |
| 生成器           | 不允许                 | 允许（`function*`）    |
| 语法简洁性       | 更简洁                 | 更传统                 |

## `for...of` 和 `for...in` 有什么区别？

在 JavaScript 中，**`for...in` 和 `for...of` 的核心区别在于遍历目标与适用场景**。简单来说：

- **`for...in` 遍历的是对象的属性键**（字符串形式），*适用于所有对象*（包括普通对象、数组等），但它会遍历原型链上的可枚举属性，可能需要通过 `hasOwnProperty` 过滤。例如遍历数组时，它返回的是索引而非元素值，且会跳过稀疏数组的空位。`Symbol` 属性不参与 `for...in` 循环。
- **`for...of` 遍历的是可迭代对象的值**（如数组元素、字符串字符、Map/Set 的项），**仅适用于实现了迭代器协议的对象**（如数组、字符串、Map 等）。它直接获取元素值，自动忽略原型链属性，且对稀疏数组的空位会返回 `undefined`。

**关键区别总结**：

- **遍历内容**：`for...in` 拿键，`for...of` 拿值。
- **适用对象**：`for...in` 几乎所有对象，`for...of` 需可迭代。
- **原型链影响**：`for...in` 包含继承属性，`for...of` 仅自身元素。
- **数组遍历**：`for...in` 得索引（字符串），`for...of` 得元素值。
- **稀疏数组**：`for...in` 跳过空位，`for...of` 保留空位（值为 `undefined`）。

## 为什么 `for` 的性能比 `forEach` 好？

- `for` 循环没有任何额外的函数调用栈和上下文。
- `forEach` 函数签名实际上是 `array.forEach(function(currentValue, index, arr), thisValue)`，它不是普通的 `for` 循环的语法糖，还有诸多参数和上下文需要在执行的时候考虑进来，这里可能拖慢性能。

此外，`for` 循环可以使用 `break` 和 `continue` 来提前终止循环或跳过某次循环，而 `forEach` 无法使用这两个语句。

## `clientWidth` 和 CSS width 有什么不同？

- `clientWidth` 值是数值，而 `getComputedStyle(elem).width` 返回一个以 `px` 作为后缀的字符串。
- `getComputedStyle` 可能会返回非数值的 `width`，例如内联（inline）元素的 `"auto"`。
- `clientWidth` 是元素的内部内容区域加上 `padding`，而 CSS width（具有标准的 `box-sizing`）是内部内容区域，不包括 `padding`。
- 如果有滚动条，并且浏览器为其保留了空间，那么某些浏览器会从 CSS width 中减去该空间（因为它不再可用于内容），而有些则不会这样做。`clientWidth` 属性总是相同的：如果为滚动条保留了空间，那么将减去滚动条的大小。

## 使用 `[]` 和使用 `charAt` 获取字符有什么区别？

它们之间的唯一区别是，如果没有找到字符，`[]` 返回 `undefined`，而 `charAt` 返回一个空字符串。

```js
let str = `Hello`;

alert(str[1000]); // undefined
alert(str.charAt(1000)); // ''（空字符串）
```

## 介绍并实现 `Promise.all()`、`Promise.allSettled()`、`Promise.race()`、`Promise.any()`

all: 等待所有 promise 进入成功状态（输入一个 promise 数组，结果也是数组，顺序保持与输入一致），或任一进入 reject 状态（快速失败，返回一个错误值）

allSettled: 等待所有 promise 进入非 pending 状态（resolved 或 rejected），结果是一个数组，其中每个对象形如 `{ status: "fulfilled", value: ... }` 或 `{ status: "rejected", reason: ... }`

race: 得到最快的那个 promise 的结果，可用于超时控制

any: 得到第一个 succeeded 的结果，但如果全部失败，会返回一个包含所有错误原因的数组，可用于多 cdn 得到结果

```js
// all: 等待所有 promise 进入成功状态，或任一进入 reject 状态
Promise.prototype.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    if (promises.length === 0) {
      return resolve([]);
    }

    const results = new Array(promises.length);
    let completedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completedCount++;

          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(reject); // 任何一个失败就立即拒绝
    });
  });
};

// allSettled: 等待所有 promise 进入非 pending 状态
Promise.prototype.myAllSettled = function(promises) {
  return new Promise((resolve) => {
    if (!Array.isArray(promises)) {
      return resolve([]);
    }

    if (promises.length === 0) {
      return resolve([]);
    }

    const results = new Array(promises.length);
    let completedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = { status: "fulfilled", value };
        })
        .catch(reason => {
          results[index] = { status: "rejected", reason };
        })
        .finally(() => {
          completedCount++;
          if (completedCount === promises.length) {
            resolve(results);
          }
        });
    });
  });
};

// race: 得到最快的那个 promise 的结果
Promise.prototype.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)
        .catch(reject);
    });
  });
};

// any: 得到第一个 succeeded 的结果，如果全部失败返回包含所有错误原因的数组
Promise.prototype.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    if (promises.length === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }

    const errors = new Array(promises.length);
    let rejectedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(resolve) // 任何一个成功就立即解决
        .catch(error => {
          errors[index] = error;
          rejectedCount++;

          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        });
    });
  });
};

// 如果需要支持 AggregateError（现代浏览器已支持）
if (typeof AggregateError === 'undefined') {
  class AggregateError extends Error {
    constructor(errors, message) {
      super(message);
      this.name = 'AggregateError';
      this.errors = errors;
    }
  }
  window.AggregateError = AggregateError;
}
```

## 介绍一下高阶函数和柯里化，你是如何理解它们的？

高阶函数（Higher Order Function）接受一个函数作为参数，或者返回一个函数。举例而言，数组的 `map`、`filter`、`reduce` 等都属于 HOF。

柯里化将一个多参数函数转换为一系列只接受单一参数的函数的函数。它只进行转换，而不调用该函数。具体可以参考 [柯里化（Currying）](https://zh.javascript.info/currying-partials)。

借助高阶函数，我们可以提升代码的复用性；借助柯里化，我们可以实现延迟执行，以及将复杂调用拆解为更简洁的配置。

如何实现柯里化？

先从一个简单的示例开始：

```js
function curriedAdd(x) {
  return function(y) {
    return x + y;
  }
}

const add5 = curriedAdd(5);
console.log(add5(3));
// 或者，链式调用：
console.log(curriedAdd(5)(3))
```

```js
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      }
    }
  }
}

function sum(a, b, c) {
  return a + b + c
}

const curriedSum = curry(sum)

console.log(curriedSum(1)(2)(3)) // 6
console.log(curriedSum(1, 2)(3)) // 6
console.log(curriedSum(1, 2, 3)) // 6
```

## 介绍并实现防抖和节流

**防抖（Debounce）** 和 **节流（Throttle）** 是前端性能优化中常用的两种 *函数调用频率控制* 技术。

### 防抖

在事件触发后 **等待一段时间**，如果这段时间内 **没有再次触发**， 才执行一次（最后执行）。

适用场景：

- 搜索框输入（input/keyup）：用户停止输入再联想
- 窗口大小修改（resize）：窗口停止拖动再渲染
- 拖拽时间（dragend）

<https://leetcode.cn/problems/debounce>

```js
function debounce(fn, t) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, ...args);
    }, t);
  };
}
```

<details>
<summary>注意此处的 `this` 绑定</summary>

`setTimeout` 的第一个参数是一个回调函数，需要特别注意其 `this` 的指向问题。下面两个版本均是正确的：

```js
function debounce(fn, t) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.call(context, ...args);
    }, t);
  };
}
```

```js
function debounce(fn, t) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(context, ...args);
    }, t);
  };
}
```

上面给出的是最精简的版本，因为箭头函数会在定义时自动继承外层作用域的 `this`，所以无须显式使用 `const context = this;` 来保存 `this` 指向。
</details>

### 节流

在固定时间间隔内只执行一次（按时执行）。

适用场景：

- 滚动加载（scroll）
- 搜索框实时建议（输入频率很高，但需要周期性检查）
- 监听浏览器窗口变化（resize）
- 游戏中的设计按钮
- ...

```js
const throttle = (fn, t) => {
  let timer = null;
  return function(...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, t);
  };
};
```

## 介绍并实现深、浅拷贝

- 浅拷贝：只复制对象本身和 **第一层属性** 的值（如果是引用，只复制引用地址）
- 深拷贝：递归复制所有层级，直到整个对象都被完整拷贝

浅拷贝的实现方法如下：

```js
const original = {
  a: 1,
  b: {
    c: 2,
  },
};

const shallowCopy1 = Object.assign({}, original);
// or in es6
const shallowCopy2 = { ...original };
```

深拷贝的实现方法如下：

```js
const original = ...;

/**
 * 方法 1：使用 JSON
 * 优点：非常简洁
 * 缺点：
 * - 忽略 undefined
 * - 忽略 Symbol
 * - 忽略 Function
 * - Date 对象会变成字符串
 * - 无法处理循环引用（会报错）
 */
const deepCopy1 = JSON.parse(JSON.stringify(original));

/**
 * 方法 2：使用现代 JavaScript Runtime 提供的 [structuredClone()](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/structuredClone)
 * 优点：
 * - 在现代浏览器、Node.js 17+ 和 Deno 等较新 JavaScript 运行时环境中开箱即用，无须引库
 * - 专为深拷贝设计，性能好
 * - 支持循环引用
 * - 支持多种复杂类型（`Date`、`RegExp`、`Map`、`Set` 等）
 * 缺点：
 * - 仅在现代环境下可用，旧环境需要 polyfill 或降级方案，在 Web Worker 中支持情况不完善
 * - 无法拷贝函数（`Function`）
 * - 无法拷贝 `Error` 对象 / DOM 节点
 */
const deepCopy2 = structuredClone(original);

/**
 * 方法 3：调库，例如此处的 Lodash
 */
const deepCopy3 = _.cloneDeep(original);

/**
 * 方法 4: 手搓
 * 思路分析：
 * 1. 处理边界：如果是 `null` 或非 `object` 类型，直接返回
 * 2. 处理循环引用：用 WeakMap 存储已经拷贝过的对象，避免死循环
 * 3. 创建新容器：判断时数组还是对象，创建对应的空容器 [] 或 {}
 * 4. 递归拷贝：遍历原始对象的属性，递归调用 deepClone 赋值给新容器
 * 为什么用 WeakMap？WeakMap 的键必须是对象，且不会阻止垃圾回收：一旦原始对象没有其他引用，WeakMap 中的键值对会被自动清理，避免内存泄漏。
 * 如何阻止循环引用？在递归过程中，每遇到一个对象就把它存到 visited 里。下次再遇到同一个对象（通过 === 比较）就直接返回先前创建好的克隆体，从而跳出递归链，防止“套娃”无限进行。
 */
function deepClone(source, visited = new WeakMap()) {
  // 1. 基本类型直接返回（包括 null、undefined、函数等）
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // 2. 如果当前对象已经出现过，直接复用先前克隆出来的结果
  //    这样就能解决循环引用，避免无限递归
  if (visited.has(source)) {
    return visited.get(source);
  }

  // 3. 根据类型创建空壳：数组 → []，普通对象 → {}
  const cloned = Array.isArray(source) ? [] : {};

  // 4. 把“源对象 → 新对象”的映射先存进去
  //    后面再递归克隆属性时，如果又碰到同一个对象，就能直接拿到 cloned
  visited.set(source, cloned);

  // 5. 仅拷贝“自有可枚举”的属性
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      cloned[key] = deepClone(source[key], visited);
    }
  }

  return cloned;
}
const deepCopy4 = deepClone(original);
```

## 介绍一下纯函数与副作用的概念

纯函数是指满足 *给定相同输入，总是返回相同输出* 的函数，并且在执行过程中不存在任何可观察的副作用。副作用指的是，在函数执行时，除了返回计算结果，还对外部世界产生了可观察的影响。

常见的副作用包括：

- 修改全局/外部变量的状态
- I/O 操作：`console.log`、网络请求、文件读写等
- 修改传入的引用类型的参数（对象/数组）
- 调用依赖外部不确定因素的函数（例如 `Math.random()`、`Date.now()` 等）
- 修改 DOM

副作用是无法避免的，核心在于 **控制** 和 **隔离** 副作用，尽量将副作用限定在程序执行的边缘，核心逻辑保持“纯”。

TODO: 在 React 中...

## 介绍一下函数式编程

函数式编程是一种编程范式（思考和组织代码的方式），它强调使用纯函数，避免改变状态和可变数据，将计算视为数学函数的求值过程。

## 为什么偏爱纯函数？

- **可预测与可测试**：输入一定的情况下，输出是确定的。这让我们更易于理解函数的行为，编写单元测试非常简单，只需确定输入输出而无需关注环境内容，极大地提高代码的可预测性。
- **并发与并行安全**：纯函数不依赖或修改外部环境，天然适用于多线程或多进程环境，避免了共享状态带来的复杂同步问题（竞态条件）
- **代码理解与推导**：函数的行为仅取决于输入，易于隔离和局部化复杂性，代码更易理解，减少心智负担

## 手动实现 `bind`

`bind()` 的核心作用：

- 固定 `this` 的指向
- 预设函数参数（部分函数、偏函数应用 Partial Application）：将原函数的参数列表从左侧固定一部分，创建一个只需要接收剩余参数的新函数

手写 `bind` 核心思路：

- 在 `Function.prototype` 上添加 `myBind`
- 该方法返回一个新函数
- 新函数内部要能调用到原函数
- 新函数调用时，确保 `this` 和参数传递正确
- 需要特殊处理 `new` 关键字调用新函数的场景

```js
Function.prototype.myBind = function(thisArg, ...args) {
  const originalFunc = this;

  if (typeof originalFunc != 'function') {
    throw new TypeError('Function.prototype.myBind ...')
  }

  // TODO:
}
```

## Set 和 Map 的原理

`Set` 和 `Map` 是 ES6 引入的两种基于**哈希表（Hash Table）** 实现的数据结构。它们的核心原理都是通过键的哈希值来快速定位存储位置，从而实现高效的查找、添加和删除操作，时间复杂度接近 O(1)。

- `Set` 是**值的集合**，它的‘键’就是它的‘值’，用于存储唯一值。
- `Map` 是**键值对的集合**，它的键可以是任何数据类型，并维护着键到值的映射关系。

## `var z = 1, y = z = typeof y; console.log(y);` 的输出是什么

`undefined`

## 介绍一下 class

ES6 引入的新语法，用于定义“类”，使创建对象和继承更加简洁直观。在此之前，旧语法：

- **原型链复杂易混淆**：使用原型链模拟“类”和“继承”不够直观，学习曲线陡峭
- **私有成员实现困难**：旧语法难以实现真正的“私有”，须借助闭包模拟
- **代码可读性低、可维护性差**：原型链操作、函数嵌套多，结构不清晰

```js
class MyClass {
  // 构造函数
  constructor(value) {
    this.property = value;
  }

  // 实例方法
  myMethod() {
    console.log(this.property);
  }

  // 静态方法
  static staticMethod() {
    console.log("This is a static method.");
  }
}

const myInstance = new MyClass('myPropertyValue');
myInstance.myMethod(); // 调用实例方法
MyClass.staticMethod(); // 调用静态方法
```

本质上，`class` 的本质仍然是原型链（参考下面的转换示例），但其包含以下特点：

- 类声明不会被提升（必须先声明后使用）
- 默认处于严格模式
- 类方法被标记为不可枚举
- ...

```js
// 构造函数（相当于 class 的 constructor）
function MyClass(value) {
  this.property = value;
}

// 实例方法（添加到原型上）
MyClass.prototype.myMethod = function() {
  console.log(this.property);
};

// 静态方法（直接添加到构造函数上）
MyClass.staticMethod = function() {
  console.log("This is a static method.");
};

// 使用方式与 class 完全相同
const myInstance = new MyClass('myPropertyValue');
myInstance.myMethod(); // 调用实例方法
MyClass.staticMethod(); // 调用静态方法
```

更多内容，可参考 [类 - JAVASCRIPT.INFO](https://zh.javascript.info/classes)。

## 解释一下 JavaScript 中的 `require` 和 `import` 有什么区别？

JavaScript 中的 `require` 和 `import` 是两种不同的模块导入方式，它们有以下几个主要区别：

1. **规范来源不同**：
   - `require` 来自 CommonJS 规范，主要用于 Node.js 环境
   - `import` 是 ES6 (ECMAScript 2015) 引入的标准模块语法

2. **加载时机不同**：
   - `require` 是**同步加载**的，会在代码执行时立即加载模块
   - `import` 是**异步加载**的，会在编译阶段进行静态分析

3. **使用位置限制**：
   - `require` 可以在代码的**任何位置**使用，包括条件语句和函数内部
   - `import` 必须在文件**顶部**使用，不能放在条件语句或函数中

4. **语法特性**：
   - `require` 是**运行时**加载，可以动态加载模块
   - `import` 是**编译时**加载，支持静态分析和优化

5. **导出方式**：
   - `require` 对应 `module.exports` 或 `exports`
   - `import` 对应 `export` 或 `export default`

在现代开发中，`import` 是更推荐的方式，因为它提供了更好的静态分析和树摇(tree-shaking)优化能力，但在 Node.js 环境中，`require` 仍然广泛使用。

## 什么是按需导入？它有什么优势？

按需导入是指只导入当前模块需要的特定函数、变量或组件，而不是导入整个模块。这种导入方式在现代 JavaScript 开发中非常重要，主要有以下几个优势：

1. **减少打包体积**：
   - 只导入需要的部分，可以显著减小最终打包文件的大小
   - 例如，使用 `import { debounce } from 'lodash'` 而不是 `import _ from 'lodash'`

2. **提高加载性能**：
   - 浏览器只需加载必要的代码，减少了网络传输时间
   - 应用启动更快，用户体验更好

3. **实现方式多样**：
   - **静态按需导入**：`import { func1, func2 } from 'module'`
   - **动态按需导入**：`const module = await import('./module.js')`
   - **条件导入**：可以在特定条件下才加载某些模块

4. **优化资源利用**：
   - 减少不必要的代码执行
   - 降低内存占用

5. **更好的代码组织**：
   - 明确显示每个模块依赖的具体功能
   - 提高代码可读性和维护性

在实际项目中，按需导入是性能优化的重要手段，特别是在使用大型库（如 lodash、Ant Design 等）时，按需导入可以避免引入大量无用代码，显著提升应用性能。

## 如何在 JavaScript 中实现动态导入？它有什么应用场景？

动态导入是 JavaScript 中一种按需加载模块的机制，主要通过 `import()` 函数实现。

`import()` 是一个异步函数，返回一个 Promise 对象，该 Promise 在模块加载完成后解析为模块对象。与静态 import 语句不同，`import()` 可以在代码的任何位置使用，支持动态地在运行时根据需要加载模块。以下是动态导入的关键点：

1. **基本语法**：

   ```javascript
   // 基本用法
   import('./module.js').then(module => {
     // 使用模块
   });

   // 结合 async/await
   async function loadModule() {
     const module = await import('./module.js');
     module.doSomething();
   }
   ```

2. **主要特点**：
   - **异步加载**：返回一个 Promise 对象
   - **条件加载**：可以在 if 语句、循环或事件处理函数中使用
   - **按需加载**：只在需要时才加载模块

3. **常见应用场景**：
   - **代码分割**：将大型应用拆分为多个小块，按需加载
   - **路由懒加载**：在单页应用中，只在访问特定路由时加载对应组件
   - **条件功能加载**：根据用户设备或权限加载不同功能模块
   - **大型库按需加载**：如只在需要时加载复杂的图表库

4. **性能优势**：
   - 减少初始加载时间
   - 降低内存占用
   - 提高应用响应速度

5. **注意事项**：
   - 动态导入的模块路径可以是动态计算的
   - 需要处理加载状态和错误情况
   - 在服务器端渲染(SSR)项目中需要特殊处理

动态导入是现代前端性能优化的重要手段，特别是在构建大型单页应用时，通过合理的动态导入策略，可以显著提升用户体验和应用性能。

## 请解释一下 ES6 模块中的命名导出和默认导出有什么区别？

ES6 模块系统提供了两种主要的导出方式：命名导出(named exports)和默认导出(default exports)。它们有以下关键区别：

1. **语法形式**：
   - **命名导出**：`export function func() {}` 或 `export { func }`
   - **默认导出**：`export default function() {}` 或 `export default value`

2. **每个模块的限制**：
   - **命名导出**：一个模块可以有**多个**命名导出
   - **默认导出**：一个模块**只能有一个**默认导出

3. **导入方式**：
   - **命名导出**：必须使用**精确的名称**导入，并用花括号包围

     ```javascript
     import { func1, func2 } from './module.js';
     ```

   - **默认导出**：导入时可以**自定义名称**，无需花括号

     ```javascript
     import myModule from './module.js';
     ```

4. **使用场景**：
   - **命名导出**适合**工具库**，导出多个相关函数或变量

     ```javascript
     // utils.js
     export function debounce() {}
     export function throttle() {}
     ```

   - **默认导出**适合**主要功能**或**组件类**

     ```javascript
     // MyComponent.js
     export default class MyComponent {}
     ```

5. **混合使用**：
   - 一个模块可以同时使用命名导出和默认导出

     ```javascript
     export default function main() {}
     export { helper1, helper2 };
     ```

   - 导入时可以同时获取默认导出和命名导出

     ```javascript
     import main, { helper1, helper2 } from './module.js';
     ```

在实际开发中，选择哪种导出方式取决于模块的性质和用途。工具库通常使用命名导出，而主要功能或组件则使用默认导出。合理使用这两种导出方式可以使代码结构更清晰，使用更方便。

## 在 Node.js 中如何处理 ES 模块和 CommonJS 模块的互操作性？

Node.js 中处理 ES 模块（ESM）和 CommonJS（CJS）模块的互操作性是一个常见问题，特别是在混合使用新旧代码的项目中。以下是处理这种互操作性的关键方法：

1. **识别模块类型**：
   - **ES 模块**：使用 `.mjs` 扩展名或在 `package.json` 中设置 `"type": "module"`
   - **CommonJS 模块**：使用 `.cjs` 扩展名或在 `package.json` 中设置 `"type": "commonjs"`（或不设置）

2. **在 ESM 中导入 CJS**：
   - 可以使用 `import` 语法导入 CommonJS 模块
   - CommonJS 模块的 `module.exports` 会被转换为 ESM 的**默认导出**

     ```javascript
     import fs from 'fs';  // 导入 CommonJS 的 fs 模块
     import _ from 'lodash';  // 导入 CommonJS 的 lodash
     ```

3. **在 CJS 中导入 ESM**：
   - 不能直接使用 `require` 导入 ES 模块
   - 需要使用动态 `import()` 函数

     ```javascript
     async function loadESModule() {
       const esModule = await import('./es-module.mjs');
       esModule.doSomething();
     }
     ```

4. **最佳实践**：
   - **新项目**：优先使用 ES 模块，这是未来趋势
   - **现有项目**：可以逐步迁移，先使用 `.mjs` 扩展名标识新模块
   - **库开发**：考虑提供两种格式的包，或使用构建工具生成兼容版本

5. **注意事项**：
   - ES 模块中无法访问 `require`、`__dirname`、`__filename` 等 CommonJS 全局变量
   - ES 模块始终在严格模式下运行
   - 混合使用时需要注意循环依赖的处理

在实际开发中，理解这两种模块系统的互操作性对于维护大型 Node.js 项目至关重要。随着 Node.js 对 ES 模块支持的不断完善，建议新项目尽可能采用 ES 模块，以便与前端开发保持一致并获得更好的静态分析能力。

## JS 中的最大安全整数是什么？为什么是这样的一个值？如果需要更大的整数，可以怎么办？

最大安全整数（`Number.MAX_SAFE_INTEGER`）是 9 007 199 254 740 991（$2^{53}−1$）。

因为 JS 用 64 位浮点数，只能精确到 53 位，再大就丢精度。

如果要更大的整数，可以使用 `BigInt` 类型，或使用三方库。

## 对比一下 JS 中各种继承的实现方法

TODO:

## 介绍一下 instanceof

TODO:
