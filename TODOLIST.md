# Date-Mate-AI 开发计划

## 第一阶段：项目初始化与基础设施搭建

### 1.1 Monorepo 项目结构搭建
- [x] 创建 monorepo 根目录结构
- [ ] 初始化根目录 `package.json`（如使用 workspace）
- [x] 创建 `.gitignore` 文件（覆盖整个项目）
- [ ] 创建 `.editorconfig` 统一代码风格
- [ ] 创建 `LICENSE` 文件（MIT 协议）

### 1.2 前端项目初始化 (date-mate-client)
- [x] 使用 Vite + React 18 + TypeScript 初始化项目
- [x] 配置 Tailwind CSS
- [x] 配置 styled-components
- [x] 安装并配置 Radix UI
- [x] 安装并配置 Redux Toolkit
- [x] 安装并配置 React Router v6
- [x] 安装并配置 Axios（含拦截器）
- [x] 安装并配置 React Hook Form
- [x] 配置 ESLint + Prettier
- [x] 配置路径别名（`@/`）
- [x] 配置环境变量（`.env.development`、`.env.production`）

### 1.3 后端项目初始化 (date-mate-service)
- [ ] 使用 Spring Boot 3.x + Java 17 初始化 Maven 项目
- [ ] 配置项目模块结构
- [ ] 添加 Spring Web、Spring Data JPA、Spring Security 依赖
- [ ] 配置 `application.yml`（dev/prod 多环境）
- [ ] 配置 Swagger/OpenAPI 文档
- [ ] 配置 Flyway 数据库迁移
- [ ] 配置 CORS 跨域设置

### 1.4 数据库与基础设施
- [ ] 创建 Docker Compose 文件（本地开发环境）
  - [ ] PostgreSQL 服务
  - [ ] Redis 服务
  - [ ] Elasticsearch 服务
- [ ] 创建初始 Flyway 迁移脚本（数据库 schema）

---

## 第二阶段：认证与用户系统

### 2.1 数据库设计 - 用户模块
- [ ] 设计 `users` 表（id, email, password_hash, phone, created_at, updated_at, status）
- [ ] 设计 `user_profiles` 表（user_id, display_name, avatar_url, bio, gender, birthday, location, occupation, company, education 等）
- [ ] 设计 `user_preferences` 表（user_id, preferred_gender, age_range_min, age_range_max, distance_range 等）
- [ ] 设计 `user_photos` 表（user_id, photo_url, is_primary, order, created_at）
- [ ] 创建用户模块的 Flyway 迁移脚本

### 2.2 后端 - 认证 API
- [ ] 实现 User 实体 + JPA Repository
- [ ] 实现 JWT Token 生成与验证工具类
- [ ] 实现 Spring Security 配置（SecurityFilterChain）
- [ ] 实现 JWT 认证过滤器
- [ ] POST `/api/auth/register` - 用户注册
- [ ] POST `/api/auth/login` - 用户登录（返回 JWT）
- [ ] POST `/api/auth/refresh` - 刷新 Token
- [ ] POST `/api/auth/logout` - 用户登出
- [ ] POST `/api/auth/forgot-password` - 忘记密码
- [ ] 实现全局异常处理器（`@ControllerAdvice`）
- [ ] 实现统一 API 响应格式（Result<T>）

### 2.3 后端 - 用户资料 API
- [ ] 实现 UserProfile 实体 + Repository
- [ ] GET `/api/users/me` - 获取当前用户资料
- [ ] PUT `/api/users/me` - 更新当前用户资料
- [ ] POST `/api/users/me/photos` - 上传照片
- [ ] DELETE `/api/users/me/photos/{id}` - 删除照片
- [ ] PUT `/api/users/me/preferences` - 更新匹配偏好
- [ ] GET `/api/users/{id}` - 获取其他用户的公开资料

### 2.4 前端 - 认证页面
- [ ] 创建项目布局结构（Layout、Header、Footer、Sidebar）
- [ ] 创建路由配置（公开路由 vs 受保护路由）
- [ ] 实现路由守卫（Auth Guard）
- [ ] 实现 Redux auth slice（Token 管理、用户状态）
- [ ] 实现 Axios 拦截器（自动携带 JWT、处理 401）
- [ ] 创建登录页面 UI
- [ ] 创建注册页面 UI（多步骤表单）
  - [ ] 第一步：基本信息（邮箱、密码）
  - [ ] 第二步：个人资料（姓名、性别、生日、所在地）
  - [ ] 第三步：关于我（简介、职业、兴趣爱好）
  - [ ] 第四步：上传照片
- [ ] 创建忘记密码页面 UI
- [ ] 表单验证（React Hook Form + 验证规则）

### 2.5 前端 - 用户资料页面
- [ ] 创建个人资料查看页面
- [ ] 创建个人资料编辑页面
- [ ] 创建照片管理组件（上传、排序、删除）
- [ ] 创建偏好设置页面
- [ ] 创建账户设置页面（修改密码、注销账户）

---

## 第三阶段：发现与匹配系统

### 3.1 数据库设计 - 匹配模块
- [ ] 设计 `swipes` 表（user_id, target_user_id, action: like/dislike/superlike, created_at）
- [ ] 设计 `matches` 表（user1_id, user2_id, matched_at, status）
- [ ] 设计 `user_tags` 表（user_id, tag_name, category）
- [ ] 创建匹配模块的 Flyway 迁移脚本

### 3.2 后端 - 发现 API
- [ ] 实现匹配算法服务
  - [ ] 根据用户偏好过滤（性别、年龄、距离）
  - [ ] 排除已滑动过的用户
  - [ ] 基础评分（共同兴趣、资料完整度）
- [ ] GET `/api/discover` - 获取推荐用户卡片（分页）
- [ ] POST `/api/discover/swipe` - 滑动操作（喜欢/不喜欢/超级喜欢）
- [ ] GET `/api/matches` - 获取所有匹配
- [ ] DELETE `/api/matches/{id}` - 取消匹配

### 3.3 后端 - Elasticsearch 集成
- [ ] 配置 Elasticsearch 连接
- [ ] 创建用户搜索索引映射
- [ ] 实现用户数据同步到 Elasticsearch
- [ ] 实现带过滤条件的高级搜索（位置、兴趣、职业）
- [ ] GET `/api/search/users` - 带过滤条件的用户搜索

### 3.4 前端 - 发现页面
- [ ] 创建发现/探索页面（Tinder 风格卡片堆叠）
- [ ] 实现滑动卡片组件（左滑/右滑/上滑动画）
- [ ] 创建用户卡片组件（照片、姓名、年龄、简介预览）
- [ ] 创建详细资料弹窗（滑动前查看完整资料）
- [ ] 实现"匹配成功"弹窗动画
- [ ] 创建匹配列表页面
- [ ] 创建高级搜索页面（含过滤面板）

---

## 第四阶段：即时通讯系统

### 4.1 数据库设计 - 消息模块
- [ ] 设计 `conversations` 表（id, match_id, created_at, last_message_at）
- [ ] 设计 `messages` 表（id, conversation_id, sender_id, content, type, read_at, created_at）
- [ ] 创建消息模块的 Flyway 迁移脚本

### 4.2 后端 - 消息 API
- [ ] 配置 WebSocket（Spring WebSocket / STOMP）
- [ ] 实现实时消息发送与接收
- [ ] GET `/api/conversations` - 获取会话列表
- [ ] GET `/api/conversations/{id}/messages` - 获取消息历史（分页）
- [ ] POST `/api/conversations/{id}/messages` - 发送消息
- [ ] PUT `/api/conversations/{id}/read` - 标记消息已读
- [ ] 使用 Redis 实现在线状态追踪
- [ ] 实现未读消息计数

### 4.3 前端 - 消息页面
- [ ] 创建会话列表页面（含最后一条消息预览）
- [ ] 创建聊天页面（消息气泡 UI）
- [ ] 实现 WebSocket 连接管理
- [ ] 实现实时消息发送/接收
- [ ] 实现消息已读状态指示器
- [ ] 实现在线/离线状态显示
- [ ] 实现正在输入指示器
- [ ] 实现图片/表情发送支持

---

## 第五阶段：AI 功能

### 5.1 AI - 智能匹配增强
- [ ] 设计 AI 匹配评分模型
- [ ] 实现协同过滤算法
- [ ] 实现基于内容的匹配算法
- [ ] 将匹配评分集成到发现 API
- [ ] 前端：创建兼容性分析可视化组件

### 5.2 AI - 聊天助手
- [ ] 设计对话建议服务
- [ ] 实现破冰建议 API
- [ ] 实现基于共同兴趣的话题推荐
- [ ] 实现对话质量分析
- [ ] 前端：在聊天中创建 AI 建议 UI 组件
- [ ] 前端：创建"话题推荐"功能

### 5.3 AI - 情感分析
- [ ] 实现消息情感分析服务
- [ ] 创建沟通兼容性评分
- [ ] 前端：在匹配资料中展示兼容性洞察

---

## 第六阶段：高级功能与打磨

### 6.1 通知系统
- [ ] 设计 `notifications` 表
- [ ] 实现推送通知服务
- [ ] 实现应用内通知中心
- [ ] 前端：创建通知铃铛 + 下拉菜单
- [ ] 前端：创建通知设置页面

### 6.2 安全与隐私
- [ ] 实现用户拉黑功能
- [ ] 实现用户举报功能
- [ ] 实现照片验证系统
- [ ] 实现资料可见性控制
- [ ] 实现数据导出（GDPR 合规）

### 6.3 UI/UX 打磨
- [ ] 实现深色模式/浅色模式切换
- [ ] 实现响应式设计（移动端优先）
- [ ] 为所有页面添加加载骨架屏
- [ ] 添加错误边界组件
- [ ] 实现平滑页面过渡动画
- [ ] 优化图片加载（懒加载、压缩）
- [ ] 实现 PWA 支持

---

## 第七阶段：测试与质量保证

### 7.1 后端测试
- [ ] Service 层单元测试
- [ ] API 端点集成测试
- [ ] 认证流程安全测试
- [ ] 匹配算法性能测试

### 7.2 前端测试
- [ ] Redux slice 单元测试
- [ ] React Testing Library 组件测试
- [ ] 关键用户流程 E2E 测试（注册、登录、滑动、聊天）

---

## 第八阶段：DevOps 与部署

### 8.1 CI/CD 流水线
- [ ] 创建前端 GitHub Actions 工作流（lint、test、build）
- [ ] 创建后端 GitHub Actions 工作流（test、build）
- [ ] 创建 Docker 构建流水线

### 8.2 生产环境部署
- [ ] 创建前端生产 Dockerfile（Nginx）
- [ ] 创建后端生产 Dockerfile（Java）
- [ ] 创建生产环境 Docker Compose
- [ ] 配置 Prometheus 监控
- [ ] 配置 Grafana 仪表盘
- [ ] 搭建日志系统（ELK 或类似方案）

---

## 开发优先级与里程碑

| 里程碑 | 包含阶段 | 目标 |
|--------|----------|------|
| M1 - 基础搭建 | 第一阶段 + 第二阶段 | 项目搭建完成 + 认证系统可用 |
| M2 - 核心闭环 | 第三阶段 + 第四阶段 | 用户可以发现、匹配、聊天 |
| M3 - 智能化 | 第五阶段 | AI 功能集成 |
| M4 - 上线就绪 | 第六阶段 + 第七阶段 + 第八阶段 | 打磨、测试、部署完成 |

---

## 备注

- 每个阶段完成后需要测试验证，再进入下一阶段
- Swagger API 文档应随后端开发同步更新
- 第一阶段完成后，前端和后端可以并行开发
- 数据库迁移脚本必须是增量的（不要修改已有的迁移脚本）
