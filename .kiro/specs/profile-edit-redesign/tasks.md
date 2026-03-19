# 实现计划：Profile 编辑页面移动端重新设计

## 概述

将 Profile 编辑页面的表单部分重构为卡片化分组布局 + 固定底部操作栏模式。仅修改 `Profile.tsx` 和 `Profile.module.scss` 两个文件，不引入新依赖。查看模式和 ID Card 区域保持不变。

## 任务

- [x] 1. 重构 SCSS 样式文件 — 新增卡片分组和固定底部操作栏样式
  - [x] 1.1 新增 FormSection 卡片样式（`.formSection`、`.sectionTitle`、`.sectionBody`）
    - 卡片使用 `$radius-md` 圆角 + `$shadow-sm` 阴影
    - 卡片内部 padding: `$spacing-md`
    - 字段间距: `$spacing-md`
    - 分组标题: 12px, font-weight 500, `$color-text-muted`
    - 卡片之间间距: `$spacing-md`
    - _需求: 2.4, 2.5_

  - [x] 1.2 新增固定底部操作栏样式（`.stickyActions`）
    - `position: fixed; bottom: 0; left: 0; right: 0`
    - 半透明白色背景 + `backdrop-filter: blur(12px)` 毛玻璃效果
    - 上边框: 1px solid `$color-border`
    - padding: `$spacing-sm $spacing-md`，底部加 `env(safe-area-inset-bottom)`
    - 按钮容器 flex 水平排列，gap: `$spacing-sm`，max-width: 300px，居中
    - 两个按钮等宽（flex: 1）
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1_

  - [x] 1.3 新增移动端单列布局样式
    - 移动端（< 640px）下 `.fieldRow` 改为 `flex-direction: column`，取消并排
    - 编辑模式下表单底部添加额外 padding 防止固定操作栏遮挡内容
    - _需求: 3.1, 3.2, 5.6_

  - [x] 1.4 新增平板及以上响应式样式
    - `@media (min-width: $breakpoint-sm)` 下 `.fieldRow` 恢复 `flex-direction: row` 并排
    - 操作栏改为非固定模式（`position: static`），跟随表单底部
    - 移除表单底部额外 padding
    - _需求: 4.1, 4.2, 5.7_

- [x] 2. 重构 Profile.tsx 编辑模式 JSX 结构
  - [x] 2.1 将编辑表单字段拆分为两个 FormSection 卡片
    - 卡片 1「Basic Info」：displayName、bio
    - 卡片 2「Personal Details」：gender、birthday、location、occupation、company
    - 每个卡片包含 `.sectionTitle` 标题和 `.sectionBody` 字段容器
    - _需求: 2.1, 2.2, 2.3_

  - [x] 2.2 将 Gender/Birthday 和 Occupation/Company 放入 `.fieldRow` 容器
    - 移动端通过 CSS 自动变为单列，平板及以上恢复并排
    - _需求: 3.1, 3.2, 4.1, 4.2_

  - [x] 2.3 将 Save/Cancel 按钮移至固定底部操作栏容器
    - 使用 `.stickyActions` 包裹按钮
    - Save 按钮在左，Cancel 按钮在右，水平排列
    - 确保按钮不硬编码 Radix Button 的 `color` prop
    - 不使用内联样式
    - _需求: 5.1, 5.4, 6.1, 6.2, 6.3_

  - [x] 2.4 确保编辑模式下 ID Card 完整保留
    - ID Card 渲染逻辑不变，编辑模式和查看模式共享同一 ID Card 区域
    - _需求: 1.1, 1.2_

- [x] 3. 检查点 — 确保样式和结构正确
  - 确保所有代码无语法错误，请用户在浏览器中验证：375px 单列布局、640px+ 并排布局、固定底部操作栏毛玻璃效果。如有问题请反馈。

- [x] 4. 验证表单逻辑和交互行为
  - [x] 4.1 验证表单预填充和提交逻辑保持正常
    - 进入编辑模式时 react-hook-form reset 预填充当前 profile 数据
    - Save 提交通过 dispatch updateProfile 发送数据
    - 成功后退出编辑模式并显示成功 Toast
    - 失败时显示错误 Toast 并保持编辑模式
    - _需求: 8.1, 8.2, 8.3, 10.1, 10.2_

  - [x] 4.2 验证 Cancel 按钮重置表单并退出编辑模式
    - 点击 Cancel 调用 reset() 恢复原始值
    - 退出编辑模式恢复查看模式
    - _需求: 9.1, 9.2_

  - [x] 4.3 验证表单验证规则正常工作
    - displayName 必填验证
    - bio 最大 200 字符验证
    - 修正后错误自动清除
    - _需求: 7.1, 7.2, 7.3_

  - [x] 4.4 验证查看模式保持不变
    - 查看模式下 ID Card、信息列表、操作按钮布局不变
    - _需求: 11.1, 11.2_

- [x] 5. 检查点 — 确保所有功能正常
  - 确保所有代码无错误，表单交互正常。如有问题请反馈。

- [ ]* 6. 编写属性测试验证正确性
  - [ ]* 6.1 编写属性测试：表单预填充与 Profile 数据一致性
    - **Property 1: 表单预填充与 Profile 数据一致性**
    - 对任意有效 UserProfile 对象，进入编辑模式后表单各字段值应与 profile 属性完全一致
    - **验证: 需求 10.2**

  - [ ]* 6.2 编写属性测试：Cancel 重置表单到原始值
    - **Property 2: Cancel 重置表单到原始值**
    - 对任意 profile 数据和任意修改操作，Cancel 后所有字段恢复为原始值
    - **验证: 需求 9.1**

  - [ ]* 6.3 编写属性测试：有效表单数据正确提交
    - **Property 3: 有效表单数据正确提交**
    - 对任意通过验证的表单数据，Save 后 dispatch 的 action 应携带一致数据
    - **验证: 需求 8.1**

  - [ ]* 6.4 编写属性测试：Bio 超长字符串触发验证错误
    - **Property 4: Bio 超长字符串触发验证错误**
    - 对任意长度超过 200 的 bio 字符串，提交时应触发验证错误
    - **验证: 需求 7.2**

  - [ ]* 6.5 编写属性测试：按钮不硬编码 color 属性
    - **Property 5: 按钮不硬编码 color 属性**
    - 所有 Radix Button 组件不应显式设置 color prop
    - **验证: 需求 6.2**

- [x] 7. 最终检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请反馈。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号以确保可追溯性
- 仅修改 `Profile.tsx` 和 `Profile.module.scss`，不引入新依赖（需求 12.1）
- 所有代码注释使用英文，文档使用中文
