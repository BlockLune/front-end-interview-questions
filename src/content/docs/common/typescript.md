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

## any、never、unknown 的区别？

- **any**：关闭类型检查，可赋值给任何类型（不安全）。
- **never**：表示不可能出现的值（如抛出错误）。
- **unknown**：安全版 any，使用时需明确类型（如类型断言或类型守卫）。

**简单比喻**：

- `any` 是 “随意门” 🚪（无限制）。
- `unknown` 是 “需要钥匙的盒子” 🔒（需验证）。
- `never` 是 “空集合” 🚫（无值）。

## TS 条件类型分配是什么？

对联合类型中的 **每个成员** 单独进行条件判断，最终合并结果。

```typescript
type ToArray<T> = T extends any ? T[] : never;
type NumOrStrArr = ToArray<number | string>; // number[] | string[]
```
注意：

用 `T[]` 会返回 `(number | string)[]`，但条件分配会拆开处理，得到 `number[] | string[]`。
