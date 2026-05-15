# AGENT.md - 每日待办 (Daily Todo)

> 本文档面向 AI Agent / 开发者，描述项目的智能协作规范、代码生成规则和开发工作流。

---

## 1. 项目概述

**项目名称**：每日待办 (Daily Todo)  
**项目类型**：纯前端 PWA（渐进式 Web 应用）  
**核心定位**：极简每日待办记录工具，零后端、零登录、本地存储  

**技术栈速查**：
- React 19 + TypeScript + Vite 6
- Tailwind CSS + shadcn/ui
- Zustand（状态管理）+ date-fns（日期处理）
- LocalStorage（数据持久化）
- PWA（Service Worker + Manifest）

---

## 2. Agent 工作规范

### 2.1 代码生成原则

#### 极简优先
- **每个功能加入前必须反问**："用户真的需要吗？"
- 不引入任何非必要依赖（如不需要动画库、不需要图表库）
- 保持单文件组件 < 200 行，超过必须拆分
- 不写注释解释"做了什么"，只写"为什么这么做"

#### 类型安全
- **所有数据必须有 TypeScript 类型**，禁止 `any`
- Props 必须显式定义接口
- Hook 返回值必须定义返回类型
- Store 状态必须定义完整 State 接口

#### 性能敏感
- 列表渲染必须加 `key`，且 key 必须是稳定唯一值（id，禁止用 index）
- 大数据计算必须用 `useMemo` / `useCallback`
- 避免在渲染中创建新对象/数组（导致子组件不必要重渲染）
- 事件处理函数必须稳定引用（用 useCallback 包裹或提取到 Hook）

### 2.2 文件操作规范

#### 创建新文件前检查
```
1. 该功能是否已有现成组件/hook/utils 可用？
2. 是否应放入现有文件而非新建？
3. 命名是否符合项目规范？
```

#### 命名规范
| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 组件 | PascalCase + `.tsx` | `TodoItem.tsx`, `CalendarView.tsx` |
| Hooks | camelCase + `use` 前缀 | `useTodos.ts`, `useCalendar.ts` |
| Utils | camelCase + 功能名 | `date.ts`, `storage.ts` |
| 类型 | PascalCase + 名词 | `Todo`, `CalendarDay`, `TodoMap` |
| 常量 | UPPER_SNAKE_CASE | `STORAGE_KEY`, `MAX_TODO_LENGTH` |
| CSS 类 | kebab-case | `todo-item`, `calendar-day` |

#### 目录归属规则
- **components/**：纯展示组件，接收 props，不直接操作 store
- **pages/**：页面级组件，组合 components，可调用 hooks
- **hooks/**：业务逻辑封装，可调用 store，返回数据和操作函数
- **stores/**：Zustand store 定义，仅包含状态和 actions
- **utils/**：纯函数工具，无副作用，不依赖 React
- **types/**：TypeScript 类型定义，可被任何层导入

### 2.3 代码修改规范

#### 修改前
1. 阅读相关文件的完整内容（至少读取目标文件 + 依赖文件）
2. 理解现有代码风格和架构模式
3. 确认修改范围，避免过度重构

#### 修改中
1. **保持向后兼容**：不破坏现有数据结构
2. **最小变更原则**：只改必要部分，不动无关代码
3. **类型一致性**：修改后确保 `tsc --noEmit` 无报错

#### 修改后
1. 检查是否有死代码（未使用的 import、变量、函数）
2. 确保代码格式化（项目已配置 Prettier）
3. 验证关键路径：添加 → 完成 → 删除 → 查看历史

---

## 3. 核心架构约定

### 3.1 数据流（单向）

```
用户交互 → Hook/Component → Zustand Action → 更新 State → 持久化 LocalStorage
                                              ↓
                                        React 自动重渲染
```

**禁止**：
- 组件直接读写 LocalStorage（必须通过 store）
- 跨组件直接传递 setState（必须通过 store）
- 在组件外创建响应式数据（必须用 store 或 state）

### 3.2 Store 设计模式

```typescript
// 标准 Store 结构
interface TodoState {
  // === State ===
  todos: TodoMap;

  // === Getters（计算属性）===
  // 用 Zustand 的 subscribe + selector，不用 getXxx 函数
}

interface TodoActions {
  // === Actions（唯一修改 State 的方式）===
  addTodo: (date: string, content: string) => void;
  toggleTodo: (date: string, todoId: string) => void;
  deleteTodo: (date: string, todoId: string) => void;
  clearAll: () => void;
}
```

**Store 文件规范**：
- 一个 domain 一个 store 文件（如 `todoStore.ts`）
- State 和 Actions 分开定义接口
- Action 中禁止直接修改 state（必须用 immutable update）
- 异步逻辑（如有）在 action 中处理，不在组件中

### 3.3 组件设计模式

#### 智能组件 vs 展示组件

| 类型 | 职责 | 位置 | 示例 |
|------|------|------|------|
| **智能组件** | 获取数据、处理交互、调用 hooks | pages/ | `TodayPage.tsx` |
| **展示组件** | 接收 props、渲染 UI、触发回调 | components/ | `TodoItem.tsx` |

#### 组件文件结构
```tsx
// 1. imports（按类型分组：React → 第三方 → 本地 → 类型）
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Todo } from '@/types';

// 2. Props 接口
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// 3. 组件实现
export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  // 3.1 hooks
  const [isDeleting, setIsDeleting] = useState(false);

  // 3.2 handlers（事件处理）
  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(todo.id), 200);
  };

  // 3.3 render
  return (
    <div className={`flex items-center gap-3 py-3 ${isDeleting ? 'opacity-0 translate-x-[-100%]' : ''}`}>
      <Checkbox checked={todo.completed} onCheckedChange={() => onToggle(todo.id)} />
      <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}>
        {todo.content}
      </span>
    </div>
  );
}
```

### 3.4 Hook 设计模式

#### 自定义 Hook 规范
```typescript
// 命名：use + 功能名
// 参数：明确类型
// 返回值：定义接口，解构使用

export function useDateTodos(date: string) {
  const todos = useTodoStore((state) => state.todos[date] || []);
  const { toggleTodo, deleteTodo } = useTodoStore();

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return {
    pendingTodos,
    completedTodos,
    toggleTodo,
    deleteTodo,
  };
}
```

**禁止**：
- Hook 中定义组件
- Hook 返回值不固定（有时返回对象，有时返回数组）
- Hook 内部使用 `useEffect` 做数据初始化（应在 store 初始化时处理）

---

## 4. 关键实现参考

### 4.1 添加待办（完整流程）

```typescript
// 1. Store Action
addTodo: (date: string, content: string) => {
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 500) return; // 校验

  const newTodo: Todo = {
    id: crypto.randomUUID?.() || uuidv4(), // 兼容旧浏览器
    content: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  set((state) => ({
    todos: {
      ...state.todos,
      [date]: [newTodo, ...(state.todos[date] || [])],
    },
  }));
}

// 2. 组件使用
function TodayPage() {
  const [inputValue, setInputValue] = useState('');
  const addTodo = useTodoStore((state) => state.addTodo);
  const today = getTodayString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addTodo(today, inputValue);
    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="输入待办事项..."
        maxLength={500}
      />
      <button type="submit">添加</button>
    </form>
  );
}
```

### 4.2 日历渲染（性能关键）

```typescript
function CalendarView({ year, month }: CalendarViewProps) {
  const todos = useTodoStore((state) => state.todos);

  // 用 useMemo 缓存日历计算（避免每次渲染重新计算 42 天）
  const weeks = useMemo(() => {
    const statsMap = Object.entries(todos).reduce((acc, [date, list]) => {
      acc[date] = {
        total: list.length,
        completed: list.filter((t) => t.completed).length,
      };
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    return generateCalendarDays(year, month, statsMap);
  }, [year, month, todos]);

  return (
    <div className="grid grid-cols-7">
      {weeks.map((week, wi) => (
        <div key={wi} className="contents">
          {week.map((day) => (
            <CalendarDayCell key={day.fullDate} day={day} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### 4.3 左滑删除手势

```typescript
// 使用原生 Touch API，不引入手势库（保持轻量）
function useSwipeDelete(onDelete: () => void) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startX.current;
    if (diff < 0) setOffset(Math.max(diff, -80)); // 最大左滑 80px
  };

  const onTouchEnd = () => {
    if (offset < -40) {
      onDelete(); // 滑动超过阈值触发删除
    } else {
      setOffset(0); // 回弹
    }
  };

  return { offset, onTouchStart, onTouchMove, onTouchEnd };
}
```

---

## 5. 常见任务指令模板

### 5.1 添加新页面

```
任务：添加「统计」页面

步骤：
1. 在 src/pages/ 创建 StatsPage.tsx
2. 在 App.tsx 路由中添加 /stats 路径
3. 在 BottomNav.tsx 添加「统计」导航项
4. 复用现有 hooks（useTodoStore）获取数据
5. 使用 shadcn/ui 的 Card 组件展示统计卡片
6. 确保移动端适配（底部导航不被遮挡）
```

### 5.2 添加新组件

```
任务：添加「待办项优先级标记」功能

约束：
- 不修改 Todo 类型（保持极简，不加 priority 字段）
- 通过内容前缀实现（如 "! 紧急" 表示高优先级）
- 在 TodoItem 中解析前缀并显示对应颜色标签
- 不影响现有数据兼容性
```

### 5.3 修改数据结构

```
任务：为 Todo 添加「分类」字段

约束：
- 必须提供数据迁移逻辑（migrateData）
- 旧数据无分类字段时，默认值为 "默认"
- 不强制要求用户选择分类（保持快速记录）
- LocalStorage 数据版本号 +1
- 更新 types/index.ts 中的 Todo 接口
```

### 5.4 性能优化

```
任务：优化历史记录页面加载速度

检查点：
1. CalendarView 是否使用了 useMemo？
2. 是否避免了对整个 todoMap 的遍历？
3. 月份切换是否有不必要的重渲染？
4. 日期单元格是否使用了 React.memo？
5. 统计计算是否在渲染中重复执行？
```

---

## 6. 调试与排错指南

### 6.1 常见问题速查

| 现象 | 可能原因 | 排查方法 |
|------|----------|----------|
| 添加待办后页面不更新 | Store 未正确更新 / 组件未订阅 | 检查 Zustand selector 是否正确 |
| 刷新后数据丢失 | persist 中间件未配置 / Storage Key 错误 | 检查 Application → LocalStorage |
| 日历显示错误 | 时区问题 / 月份边界计算错误 | 使用 date-fns 函数，不用原生 Date |
| 动画卡顿 | 大量组件同时渲染 / 未使用 useMemo | React DevTools Profiler 分析 |
| 类型报错 | 接口定义与实际数据不匹配 | 检查 types/index.ts 和实际使用处 |
| PWA 无法安装 | Manifest 路径错误 / Service Worker 未注册 | Chrome DevTools → Application 检查 |

### 6.2 调试工具

```bash
# 启动开发服务器
npm run dev

# 类型检查
npx tsc --noEmit

# 运行测试
npm run test

# 构建生产版本（检查包体积）
npm run build
```

### 6.3 浏览器调试

- **LocalStorage 数据**：Application → Storage → Local Storage
- **PWA 状态**：Application → Manifest / Service Workers
- **性能分析**：Performance → 录制用户操作流程
- **移动端适配**：DevTools → Toggle Device Toolbar

---

## 7. 扩展与迭代规范

### 7.1 添加新功能 checklist

```
□ 该功能是否符合「极简」定位？
□ 是否必须修改核心数据结构？（尽量不改）
□ 是否需要新增依赖？（尽量不用）
□ 是否影响现有功能？（必须向后兼容）
□ 是否需要在 types/index.ts 添加类型？
□ 是否需要更新 storage 的 migrateData？
□ 是否需要在 PRD 中补充产品说明？
□ 是否需要在 Tech Design 中补充技术说明？
```

### 7.2 版本升级规范

| 版本类型 | 规则 | 示例 |
|----------|------|------|
| **Major** | 破坏性变更（数据结构不兼容）| 1.x → 2.0 |
| **Minor** | 新功能（向后兼容）| 1.0 → 1.1 |
| **Patch** | Bug 修复 | 1.0.0 → 1.0.1 |

**数据版本号（dataVersion）独立于应用版本号**：
- 应用版本：面向用户（v1.0.0）
- 数据版本：面向迁移逻辑（CURRENT_DATA_VERSION = 1）

---

## 8. 参考文档

| 文档 | 路径 | 说明 |
|------|------|------|
| PRD | `docs/PRD.md` | 产品需求文档 |
| Tech Design | `docs/TechDesign.md` | 技术设计文档 |
| 本文件 | `AGENT.md` | Agent 协作规范 |
| API 参考 | `src/types/index.ts` | 所有类型定义 |
| Store 实现 | `src/stores/todoStore.ts` | 状态管理核心 |

---

## 9. 快速开始（Agent 首次接入）

```bash
# 1. 阅读项目结构
ls -la src/

# 2. 阅读核心类型
cat src/types/index.ts

# 3. 阅读 Store 实现
cat src/stores/todoStore.ts

# 4. 阅读当前页面
cat src/pages/TodayPage.tsx

# 5. 启动开发服务器
npm run dev

# 6. 打开浏览器验证
open http://localhost:5173
```

---

*文档版本：v1.0*  
*创建日期：2026-05-15*  
*状态：初稿*  
*维护者：Agent / 开发者*
