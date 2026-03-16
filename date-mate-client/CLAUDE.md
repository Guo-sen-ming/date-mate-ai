# Date-Mate-AI 前端项目说明

## 项目概述

Date-Mate-AI 前端客户端，基于 React 18 + TypeScript + Vite 构建的约会应用。

## 技术栈与第三方依赖

### 核心框架
| 依赖 | 版本 | 用途 |
|------|------|------|
| React | ^19.2.4 | UI 框架 |
| TypeScript | ~5.9.3 | 类型系统 |
| Vite | ^8.0.0 | 构建工具 |

### 路由与状态管理
| 依赖 | 版本 | 用途 |
|------|------|------|
| react-router-dom | ^7.13.1 | 客户端路由 |
| @reduxjs/toolkit | ^2.11.2 | 状态管理 |
| react-redux | ^9.2.0 | React-Redux 绑定 |

### UI 与样式
| 依赖 | 版本 | 用途 |
|------|------|------|
| @radix-ui/themes | ^3.3.0 | UI 组件库 |
| @radix-ui/react-icons | ^1.3.2 | 图标库 |
| tailwindcss | ^4.2.1 | 原子化 CSS |
| styled-components | ^6.3.11 | CSS-in-JS |

### 工具库
| 依赖 | 版本 | 用途 |
|------|------|------|
| axios | ^1.13.6 | HTTP 客户端 |
| react-hook-form | ^7.71.2 | 表单处理 |

### 开发工具
| 依赖 | 版本 | 用途 |
|------|------|------|
| json-server | ^1.0.0-beta.13 | 模拟后端 API |
| eslint | ^9.39.4 | 代码检查 |
| prettier | ^3.8.1 | 代码格式化 |

## 命令说明

```bash
# 启动前端开发服务器（端口 3000）
npx vite 2>&1

# 启动 json-server 模拟 API（端口 3001）
npx json-server db.json --port 3001

# 同时启动前端和模拟 API（需要安装 concurrently）
npm run dev:all

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 项目结构

```
src/
├── assets/          # 静态资源（图片、字体等）
├── components/      # 通用组件
│   ├── AuthGuard.tsx    # 路由守卫
│   └── Header.tsx       # 顶部导航栏
├── layouts/         # 布局组件
│   ├── MainLayout.tsx   # 主布局（含 Header）
│   └── AuthLayout.tsx   # 认证页面布局
├── lib/             # 工具库
│   └── axios.ts         # Axios 实例（含拦截器）
├── pages/           # 页面组件
│   ├── Home.tsx         # 首页
│   ├── Login.tsx        # 登录页
│   ├── Register.tsx     # 注册页
│   ├── Discover.tsx     # 发现页（滑动卡片）
│   ├── Matches.tsx      # 匹配列表页
│   ├── Messages.tsx     # 消息页
│   └── Profile.tsx      # 个人资料页
├── router/          # 路由配置
│   └── index.tsx
├── store/           # Redux 状态管理
│   ├── index.ts         # Store 配置
│   ├── hooks.ts         # 类型化 hooks
│   └── slices/
│       └── authSlice.ts # 认证状态
├── App.tsx          # 根组件
├── main.tsx         # 入口文件
└── index.css        # 全局样式（含 Tailwind）
```

## API 代理配置

开发环境下，Vite 会将 `/api` 开头的请求代理到 `http://localhost:3001`（json-server）。

## 模拟数据

`db.json` 文件包含 json-server 的模拟数据，包括：
- `users` - 用户数据
- `matches` - 匹配数据
- `conversations` - 会话数据
- `messages` - 消息数据

## 路径别名

项目配置了 `@/` 路径别名，指向 `src/` 目录。

示例：`import Header from '@/components/Header'`

## 环境变量

| 变量名 | 说明 |
|--------|------|
| VITE_API_BASE_URL | API 基础地址 |
| VITE_APP_TITLE | 应用标题 |
