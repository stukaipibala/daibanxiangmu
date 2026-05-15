# 每日待办 (Daily Todo) - 技术设计文档 (Tech Design)

---

## 1. 技术栈选择

### 1.1 方案对比

| 方案 | 前端 | 后端 | 数据库 | 适用场景 |
|------|------|------|--------|----------|
| A: 纯前端 PWA | React/Vue | 无 | IndexedDB/LocalStorage | 极简、离线优先、无需同步 |
| B: 全栈 Web | React | Node.js/Go | PostgreSQL/MongoDB | 需要多端同步、用户系统 |
| C: 原生 App | Flutter/React Native | 可选 | SQLite | 需要原生体验、推送等 |

### 1.2 推荐方案：方案 A（纯前端 PWA）

**选择理由：**
- 产品定位极简，无需用户系统、云同步、社交等复杂功能
- 纯本地存储即可满足需求，数据隐私性更好
- PWA 可安装到桌面/手机主屏，体验接近原生 App
- 开发成本低，维护简单，适合 MVP 快速上线
- 无需服务器成本，零运维负担

### 1.3 具体技术栈

#### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| **React 19** | ^19.0 | UI 框架，组件化开发 |
| **TypeScript** | ^5.7 | 类型安全，提升代码质量 |
| **Vite** | ^6.0 | 构建工具，极速 HMR |
| **Tailwind CSS** | ^4.0 | 原子化 CSS，快速样式开发 |
| **shadcn/ui** | latest | 基础 UI 组件库（按钮、输入框、对话框等）|
| **date-fns** | ^4.0 | 日期处理库，轻量且功能完善 |
| **lucide-react** | ^0.460 | 图标库，与 shadcn/ui 配套 |
| **uuid** | ^11.0 | 生成唯一 ID |

#### 存储
| 技术 | 用途 |
|------|------|
| **LocalStorage** | 主存储，存储所有待办数据（JSON 序列化）|
| **IndexedDB** | 备选方案，数据量大时切换（>5MB）|

#### 部署
| 技术 | 用途 |
|------|------|
| **Vercel / Netlify** | 静态站点托管，自动 CI/CD |
| **PWA** | Service Worker + Manifest，支持离线使用和安装 |

---

## 2. 项目结构

```
daily-todo/
├── public/
│   ├── manifest.json          # PWA 配置
│   ├── sw.js                  # Service Worker（离线缓存）
│   └── icons/                 # 应用图标（192x192, 512x512）
│
├── src/
│   ├── main.tsx               # 应用入口
│   ├── App.tsx                # 根组件，路由配置
│   ├── index.css              # 全局样式 + Tailwind 导入
│   │
│   ├── components/            # 公共组件
│   │   ├── ui/                # shadcn/ui 组件（自动生成的）
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── TodoItem.tsx       # 待办项组件（单条）
│   │   ├── TodoList.tsx       # 待办列表组件
│   │   ├── CalendarView.tsx   # 日历视图组件
│   │   ├── DateDetail.tsx     # 日期详情组件
│   │   ├── EmptyState.tsx     # 空状态组件
│   │   └── BottomNav.tsx      # 底部导航栏
│   │
│   ├── pages/                 # 页面组件
│   │   ├── TodayPage.tsx      # 今日待办页
│   │   ├── HistoryPage.tsx    # 历史记录页
│   │   └── SettingsPage.tsx   # 设置页
│   │
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useTodos.ts        # 待办数据管理（CRUD）
│   │   ├── useDateTodos.ts    # 按日期获取待办
│   │   ├── useCalendar.ts     # 日历逻辑（月份切换、日期计算）
│   │   └── useStorage.ts      # 本地存储封装
│   │
│   ├── stores/                # 状态管理
│   │   └── todoStore.ts       # Zustand 待办状态存储
│   │
│   ├── types/                 # TypeScript 类型定义
│   │   └── index.ts           # 所有类型导出
│   │
│   ├── utils/                 # 工具函数
│   │   ├── date.ts            # 日期格式化、计算
│   │   ├── storage.ts         # LocalStorage 封装
│   │   └── constants.ts       # 常量定义
│   │
│   └── lib/                   # 第三方库配置
│       └── utils.ts           # shadcn 工具函数（cn 合并）
│
├── index.html                 # HTML 模板
├── vite.config.ts             # Vite 配置
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.ts         # Tailwind 配置
├── components.json            # shadcn/ui 配置
├── package.json
└── README.md
```

### 2.1 目录设计原则

1. **按职责分层**：components（展示）、pages（页面）、hooks（逻辑）、stores（状态）
2. **组件粒度**：TodoItem 负责单条渲染，TodoList 负责列表管理，避免组件过大
3. **Hooks 抽离**：数据操作逻辑从 UI 中剥离，便于复用和测试
4. **类型集中**：所有类型定义在 types/ 目录，避免散落在各文件中

---

## 3. 数据模型

### 3.1 核心类型定义

```typescript
// src/types/index.ts

/**
 * 待办事项状态
 */
export type TodoStatus = 'pending' | 'completed';

/**
 * 待办事项对象
 */
export interface Todo {
  /** 唯一标识 */
  id: string;
  /** 待办内容 */
  content: string;
  /** 完成状态 */
  completed: boolean;
  /** 创建时间（ISO 8601）*/
  createdAt: string;
  /** 完成时间（ISO 8601，未完成时为 null）*/
  completedAt: string | null;
}

/**
 * 按日期分组的待办数据
 * Key: 日期字符串 YYYY-MM-DD
 * Value: 当日待办数组
 */
export type TodoMap = Record<string, Todo[]>;

/**
 * 日历日期单元格数据
 */
export interface CalendarDay {
  /** 日期数字（1-31）*/
  date: number;
  /** 完整日期字符串 YYYY-MM-DD */
  fullDate: string;
  /** 是否属于当前月份 */
  isCurrentMonth: boolean;
  /** 是否是今天 */
  isToday: boolean;
  /** 是否有待办记录 */
  hasRecords: boolean;
  /** 是否全部完成（有记录时有效）*/
  allCompleted: boolean;
  /** 待办数量 */
  todoCount: number;
  /** 已完成数量 */
  completedCount: number;
}

/**
 * 应用设置
 */
export interface AppSettings {
  /** 是否首次使用（用于显示引导）*/
  isFirstUse: boolean;
  /** 数据版本（用于未来迁移）*/
  dataVersion: number;
}

/**
 * 存储数据结构（LocalStorage 中的完整数据）
 */
export interface StorageData {
  /** 待办数据映射 */
  todos: TodoMap;
  /** 应用设置 */
  settings: AppSettings;
  /** 最后更新时间 */
  lastUpdated: string;
}
```

### 3.2 数据流设计

```
用户操作（添加/完成/删除）
    ↓
Zustand Store（todoStore）
    ↓
更新内存状态 + 持久化到 LocalStorage
    ↓
React 组件自动重渲染
```

### 3.3 存储格式示例

```json
{
  "todos": {
    "2026-05-15": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "content": "完成项目周报",
        "completed": true,
        "createdAt": "2026-05-15T09:00:00.000Z",
        "completedAt": "2026-05-15T10:30:00.000Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "content": "买牛奶",
        "completed": false,
        "createdAt": "2026-05-15T14:00:00.000Z",
        "completedAt": null
      }
    ],
    "2026-05-14": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "content": "整理桌面",
        "completed": true,
        "createdAt": "2026-05-14T09:00:00.000Z",
        "completedAt": "2026-05-14T09:30:00.000Z"
      }
    ]
  },
  "settings": {
    "isFirstUse": false,
    "dataVersion": 1
  },
  "lastUpdated": "2026-05-15T14:30:00.000Z"
}
```

### 3.4 数据操作 API 设计

```typescript
// src/hooks/useTodos.ts

interface UseTodosReturn {
  // 获取指定日期的待办列表
  getTodosByDate: (date: string) => Todo[];

  // 添加待办
  addTodo: (date: string, content: string) => Todo;

  // 切换完成状态
  toggleTodo: (date: string, todoId: string) => void;

  // 删除待办
  deleteTodo: (date: string, todoId: string) => void;

  // 获取日期统计（用于日历标记）
  getDateStats: (date: string) => { total: number; completed: number };

  // 清除所有数据
  clearAllData: () => void;
}
```

---

## 4. 关键技术点

### 4.1 本地存储方案选型

#### 方案对比

| 特性 | LocalStorage | IndexedDB | sessionStorage |
|------|-------------|-----------|----------------|
| 容量限制 | ~5-10MB | ~50MB+ | ~5-10MB |
| 数据类型 | 仅字符串 | 任意对象 | 仅字符串 |
| 同步/异步 | 同步 | 异步 | 同步 |
| 性能 | 简单操作快 | 大数据量更优 | 同 LocalStorage |
| 离线支持 | ✅ | ✅ | ❌（标签页关闭即清除）|

#### 实现策略

**阶段一（MVP）：LocalStorage**
- 数据量小（日均 3-10 条待办），JSON 序列化后 < 100KB
- 同步 API，代码简单，无需处理异步状态
- 封装 `storage.ts` 统一读写，便于未来切换

```typescript
// src/utils/storage.ts
const STORAGE_KEY = 'daily-todo-data';

export const storage = {
  get(): StorageData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(data: StorageData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // 存储空间不足处理
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('存储空间不足');
        // 可提示用户清理旧数据
      }
    }
  },

  remove(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
```

**阶段二（未来）：IndexedDB**
- 当用户数据量增长（多年记录）时切换
- 使用 `idb` 库简化 IndexedDB API
- 保持 storage.ts 接口不变，内部实现替换

---

### 4.2 状态管理设计

#### 选择 Zustand 而非 Redux/Context

| 特性 | Zustand | Redux | Context |
|------|---------|-------|---------|
| 学习成本 | 极低 | 高 | 低 |
| 样板代码 | 极少 | 多 | 中等 |
| 性能 | 优（细粒度订阅）| 优 | 差（任意更新全量渲染）|
| 持久化 | 中间件一行代码 | 需 redux-persist | 自行实现 |
| 适用规模 | 中小型 | 大型 | 极小 |

#### Store 设计

```typescript
// src/stores/todoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TodoMap, Todo, StorageData } from '@/types';
import { storage } from '@/utils/storage';

interface TodoState {
  todos: TodoMap;

  // Actions
  addTodo: (date: string, content: string) => void;
  toggleTodo: (date: string, todoId: string) => void;
  deleteTodo: (date: string, todoId: string) => void;
  clearAll: () => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: {},

      addTodo: (date, content) => {
        const newTodo: Todo = {
          id: crypto.randomUUID(), // 或使用 uuid 库
          content: content.trim(),
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
      },

      toggleTodo: (date, todoId) => {
        set((state) => ({
          todos: {
            ...state.todos,
            [date]: state.todos[date]?.map((todo) =>
              todo.id === todoId
                ? {
                    ...todo,
                    completed: !todo.completed,
                    completedAt: !todo.completed ? new Date().toISOString() : null,
                  }
                : todo
            ) || [],
          },
        }));
      },

      deleteTodo: (date, todoId) => {
        set((state) => {
          const filtered = state.todos[date]?.filter((t) => t.id !== todoId) || [];
          const newTodos = { ...state.todos };

          if (filtered.length === 0) {
            delete newTodos[date]; // 清理空日期
          } else {
            newTodos[date] = filtered;
          }

          return { todos: newTodos };
        });
      },

      clearAll: () => set({ todos: {} }),
    }),
    {
      name: 'daily-todo-storage',
      storage: {
        getItem: (name) => {
          const data = storage.get();
          return data ? { state: { todos: data.todos } } : null;
        },
        setItem: (name, value) => {
          const existing = storage.get();
          storage.set({
            ...existing,
            todos: value.state.todos,
            lastUpdated: new Date().toISOString(),
          });
        },
        removeItem: () => storage.remove(),
      },
    }
  )
);
```

---

### 4.3 日历组件实现

#### 核心算法：生成日历网格

```typescript
// src/utils/date.ts

import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
         addDays, format, isSameMonth, isToday } from 'date-fns';
import { CalendarDay } from '@/types';

/**
 * 生成日历网格数据（6行 x 7列 = 42天）
 * 包含上月末尾 + 当月全部 + 下月开头
 */
export function generateCalendarDays(
  year: number, 
  month: number,
  todoMap: Record<string, { total: number; completed: number }>
): CalendarDay[][] {
  const date = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 周日开始
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: CalendarDay[] = [];
  let current = calendarStart;

  while (current <= calendarEnd) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const stats = todoMap[dateStr] || { total: 0, completed: 0 };

    days.push({
      date: current.getDate(),
      fullDate: dateStr,
      isCurrentMonth: isSameMonth(current, monthStart),
      isToday: isToday(current),
      hasRecords: stats.total > 0,
      allCompleted: stats.total > 0 && stats.completed === stats.total,
      todoCount: stats.total,
      completedCount: stats.completed,
    });

    current = addDays(current, 1);
  }

  // 分割为 6 行（每周一行）
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}
```

#### 性能优化
- 使用 `useMemo` 缓存日历计算结果，避免每次渲染重新计算
- 月份切换时使用 CSS transform 实现滑动动画，而非重新渲染

---

### 4.4 跨天数据处理

#### 场景
用户晚上 11:59 打开应用，过了 12:00 后添加待办，应该算到哪一天？

#### 策略：以操作时刻的本地日期为准

```typescript
/**
 * 获取当前本地日期字符串 YYYY-MM-DD
 * 基于用户设备时区
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * 判断两个日期是否是同一天
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}
```

**关键处理：**
- 应用启动时记录 `appOpenDate`
- 添加待办时，始终使用 `getTodayString()` 获取当前日期
- 如果用户从「今天」页面切换到其他页面再回来，重新检查日期变化
- 若检测到跨天，自动刷新页面显示新的一天

---

### 4.5 PWA 离线支持

#### Service Worker 策略

```javascript
// public/sw.js
const CACHE_NAME = 'daily-todo-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 网络优先策略（数据用 LocalStorage，静态资源用缓存）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

#### Manifest 配置

```json
{
  "name": "每日待办",
  "short_name": "待办",
  "description": "简单记录每一天的待办事项",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4A90D9",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

### 4.6 数据迁移与版本控制

#### 场景
未来 V1.1 版本可能需要扩展数据结构，如何保证旧数据兼容？

#### 实现

```typescript
// src/utils/storage.ts
const CURRENT_DATA_VERSION = 1;

export function migrateData(data: any): StorageData {
  // 默认数据结构
  const defaultData: StorageData = {
    todos: {},
    settings: { isFirstUse: true, dataVersion: CURRENT_DATA_VERSION },
    lastUpdated: new Date().toISOString(),
  };

  if (!data) return defaultData;

  const version = data.settings?.dataVersion || 0;

  // V0 → V1 迁移
  if (version < 1) {
    // 旧版本数据结构转换
    return {
      todos: data.todos || {},
      settings: {
        isFirstUse: false,
        dataVersion: CURRENT_DATA_VERSION,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  return data;
}
```

---

### 4.7 动画实现方案

| 动画 | 实现方式 | 库/技术 |
|------|----------|---------|
| 列表项添加/删除 | CSS Transition + 条件渲染 | Tailwind transition |
| 列表项移动（完成/取消）| CSS Transition + 绝对定位 | Tailwind transition |
| 月份切换滑动 | CSS Transform translateX | Tailwind transition |
| 复选框勾选 | CSS Transform scale | Tailwind animate |
| 页面切换 | CSS Opacity fade | Tailwind transition |
| 左滑删除 | Touch Event + CSS Transform | 原生 Touch API |

#### 列表动画关键实现

```tsx
// 使用 CSS Grid/Flex + transition 实现平滑移动
// 无需引入 Framer Motion（减少包体积）

// TodoList.tsx
<div className="flex flex-col">
  {pendingTodos.map((todo) => (
    <div 
      key={todo.id}
      className="transition-all duration-300 ease-in-out"
    >
      <TodoItem todo={todo} />
    </div>
  ))}

  {completedTodos.length > 0 && (
    <div className="transition-all duration-300">
      <CompletedSection todos={completedTodos} />
    </div>
  )}
</div>
```

---

### 4.8 性能优化策略

| 优化点 | 方案 |
|--------|------|
| 大数据量列表 | 虚拟滚动（待办项通常 < 50 条，暂不启用）|
| 日历渲染 | `useMemo` 缓存日历计算 |
| 存储写入 | 防抖（Debounce）批量写入，500ms 间隔 |
| 图片资源 | 使用 SVG 图标（lucide-react），无额外请求 |
| 首屏加载 | Vite 代码分割，路由懒加载 |
| 包体积 | Tree Shaking，仅引入使用的 date-fns 函数 |

---

### 4.9 测试策略

| 类型 | 工具 | 覆盖范围 |
|------|------|----------|
| 单元测试 | Vitest | utils/date.ts, storage.ts, hooks |
| 组件测试 | React Testing Library | TodoItem, CalendarView |
| E2E 测试 | Playwright | 核心用户流程（添加→完成→查看历史→删除）|

#### 关键测试用例

```typescript
// 示例：useTodos hook 测试
describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add todo to today', () => {
    const { result } = renderHook(() => useTodoStore());

    act(() => {
      result.current.addTodo('2026-05-15', '测试待办');
    });

    const todos = result.current.getTodosByDate('2026-05-15');
    expect(todos).toHaveLength(1);
    expect(todos[0].content).toBe('测试待办');
  });

  it('should toggle todo completion', () => {
    // ...
  });

  it('should persist data to localStorage', () => {
    // ...
  });
});
```

---

## 5. 开发环境配置

### 5.1 初始化命令

```bash
# 1. 创建 Vite + React + TypeScript 项目
npm create vite@latest daily-todo -- --template react-ts

cd daily-todo

# 2. 安装依赖
npm install

# 3. 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. 安装 shadcn/ui
npx shadcn@latest init

# 5. 安装业务依赖
npm install zustand date-fns uuid lucide-react
npm install -D @types/uuid

# 6. 安装测试依赖
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 5.2 关键配置

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['date-fns', 'uuid'],
        },
      },
    },
  },
});
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 6. 部署方案

### 6.1 Vercel 部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录并部署
vercel login
vercel --prod
```

### 6.2 自动 HTTPS + CDN
- Vercel 自动提供 HTTPS
- 全球 CDN 加速静态资源
- 自动 CI/CD（Git push 即部署）

### 6.3 自定义域名（可选）
在 Vercel Dashboard 中配置自定义域名，自动申请 SSL 证书。

---

## 7. 风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| LocalStorage 被用户手动清除 | 数据丢失 | 提供数据导出功能（V1.1）|
| 存储空间不足（>5MB）| 无法保存 | 优雅降级，提示用户清理；未来迁移 IndexedDB |
| 浏览器隐私模式 | LocalStorage 不可用 | 检测并提示用户关闭隐私模式 |
| 跨浏览器数据不互通 | 换设备/浏览器数据丢失 | 预期内，产品定位为单机工具 |
| iOS Safari PWA 限制 | 部分 PWA 功能受限 | 测试并适配，核心功能不受影响 |

---

## 8. 里程碑

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| 环境搭建 | Day 1 | 项目骨架，Tailwind + shadcn 配置完成 |
| 核心功能 | Day 2-3 | 今日待办（增删改查），LocalStorage 持久化 |
| 历史记录 | Day 4-5 | 日历视图，日期详情，月份切换 |
| 设置+优化 | Day 6 | 清除数据，PWA 配置，动画优化 |
| 测试+部署 | Day 7 | 单元测试，E2E 测试，Vercel 部署 |

---

*文档版本：v1.0*  
*创建日期：2026-05-15*  
*状态：初稿*
