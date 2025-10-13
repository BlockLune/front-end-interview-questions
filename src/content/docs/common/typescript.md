---
title: TypeScript
---

## TS 如何实现模块扩展？

使用 `declare module` 语法。在 `.d.ts` 文件中声明要扩展的模块，并添加新类型或值即可。

```typescript
// 扩展 'axios' 模块
declare module 'axios' {
  export interface CustomConfig { timeout: number }
}
```

## TS 如何实现安全枚举效果？

使用 **常量对象** (`as const`) + `keyof typeof` 获取联合类型。避免数字枚举的不安全值。

```typescript
const Status = {
  Open: 0,
  Closed: 1
} as const; // 固定值

type Status = keyof typeof Status; // "Open" | "Closed"
```

## any、unknown、never 的区别？

- **any**：关闭类型检查，可赋值给任何类型（不安全）
- **unknown**：安全版 any，使用时需明确类型（如类型断言或类型守卫）
- **never**：表示不可能出现的值（如抛出错误）

```js
// 1. any：完全放弃类型检查
let anything: any = 4;
anything = "oops";          // OK
anything.push(123);         // 运行时才可能崩溃，TS 不报错
let num: number = anything; // 任何类型都能互相赋值（危险）

// 2. unknown：安全版 any，使用前必须“证明”类型
let safe: unknown = 4;
// safe.push(123);          // ❌ 直接访问属性/方法会报错
if (typeof safe === "number") {
  console.log(safe.toFixed(2)); // ✅ 类型守卫后安全使用
}
let n: number = safe as number; // 或显式断言

// 3. never：表示“永远不会有值”的返回类型
function fail(msg: string): never {
  throw new Error(msg);   // 函数永不正常返回
}

function exhaustive(x: "a" | "b"): never {
  // 借助 never 做穷尽检查
  throw new Error(`Unhandled case: ${(x as never)}`);
}

// 使用示例
let v: unknown = JSON.parse('{"type":"c"}'); // 解析结果未知
if (v && typeof v === "object" && "type" in v && v.type === "a") {
  console.log("got a");
} else if (v && typeof v === "object" && "type" in v && v.type === "b") {
  console.log("got b");
} else {
  exhaustive(v as never); // 如果还有别的值，编译器会报错
}
```

## TS 条件类型分配是什么？

对联合类型中的 **每个成员** 单独进行条件判断，最终合并结果。

```typescript
type ToArray<T> = T extends any ? T[] : never;
type NumOrStrArr = ToArray<number | string>; // number[] | string[]
```
注意：

用 `T[]` 会返回 `(number | string)[]`，但条件分配会拆开处理，得到 `number[] | string[]`。
