# 需求文档

## 简介

本文档定义了 Profile 编辑页面移动端重新设计的功能需求。重新设计的目标是将编辑表单从平铺布局重构为卡片化分组布局，并增加固定底部操作栏，以提升移动端（375px 及以上）的编辑体验。顶部 ID Card 区域保持不变，仅重构编辑表单部分。

## 术语表

- **Profile_Page**：用户个人资料页面，包含查看模式和编辑模式
- **ID_Card**：页面顶部的用户身份卡片区域，展示头像、用户名、性别标签、简介、职业和邮箱信息
- **Edit_Mode**：编辑模式，用户点击 "Edit Profile" 后进入的表单编辑状态
- **View_Mode**：查看模式，展示用户信息的只读状态
- **Form_Section**：表单分组卡片，将表单字段按逻辑分组并用卡片容器包裹
- **Basic_Info_Card**：基本信息卡片，包含 displayName 和 bio 字段
- **Personal_Details_Card**：个人详情卡片，包含 gender、birthday、location、occupation、company 字段
- **Sticky_Actions_Bar**：固定底部操作栏，包含 Save 和 Cancel 按钮，固定在视口底部
- **Glassmorphism**：毛玻璃效果，使用半透明背景和 backdrop-filter blur 实现的视觉效果
- **Mobile_Breakpoint**：移动端断点，屏幕宽度小于 640px
- **Tablet_Breakpoint**：平板断点，屏幕宽度大于等于 640px

## 需求

### 需求 1：编辑模式下 ID Card 保持不变

**用户故事：** 作为用户，我希望在编辑个人资料时仍然能看到完整的 ID Card 信息，以便在编辑过程中确认自己的身份信息。

#### 验收标准

1. WHEN 用户进入 Edit_Mode，THE Profile_Page SHALL 在表单上方完整展示 ID_Card，包括头像、用户名、性别标签、简介、职业信息和邮箱行
2. WHILE 用户处于 Edit_Mode，THE ID_Card SHALL 保持与 View_Mode 完全一致的布局和样式

### 需求 2：表单字段卡片化分组

**用户故事：** 作为用户，我希望编辑表单的字段按逻辑分组展示在卡片中，以便更清晰地理解和填写各类信息。

#### 验收标准

1. WHEN 用户进入 Edit_Mode，THE Profile_Page SHALL 将表单字段分为两个 Form_Section 卡片展示
2. THE Basic_Info_Card SHALL 包含 displayName 和 bio 两个字段
3. THE Personal_Details_Card SHALL 包含 gender、birthday、location、occupation、company 五个字段
4. THE Form_Section SHALL 使用圆角边框和阴影样式呈现卡片外观
5. THE Form_Section SHALL 在卡片顶部展示分组标题文本

### 需求 3：移动端单列布局

**用户故事：** 作为移动端用户，我希望所有表单字段以单列方式排列，以便在小屏幕上获得舒适的填写体验。

#### 验收标准

1. WHILE 屏幕宽度小于 Mobile_Breakpoint（640px），THE Profile_Page SHALL 将所有表单字段以单列垂直排列展示
2. WHILE 屏幕宽度小于 Mobile_Breakpoint，THE Profile_Page SHALL 取消 gender/birthday 和 occupation/company 的并排布局

### 需求 4：平板及以上响应式并排布局

**用户故事：** 作为平板或桌面端用户，我希望部分相关字段能够并排展示，以便更高效地利用屏幕空间。

#### 验收标准

1. WHILE 屏幕宽度大于等于 Tablet_Breakpoint（640px），THE Personal_Details_Card SHALL 将 gender 和 birthday 字段并排展示
2. WHILE 屏幕宽度大于等于 Tablet_Breakpoint，THE Personal_Details_Card SHALL 将 occupation 和 company 字段并排展示

### 需求 5：固定底部操作栏

**用户故事：** 作为移动端用户，我希望 Save 和 Cancel 按钮始终固定在屏幕底部可见，以便无需滚动即可提交或取消编辑。

#### 验收标准

1. WHILE 屏幕宽度小于 Mobile_Breakpoint，THE Sticky_Actions_Bar SHALL 固定在视口底部展示 Save 和 Cancel 按钮
2. THE Sticky_Actions_Bar SHALL 使用半透明白色背景和 Glassmorphism 效果与页面内容区分
3. THE Sticky_Actions_Bar SHALL 在顶部显示边框线以区分内容区域
4. THE Sticky_Actions_Bar SHALL 将 Save 按钮置于左侧、Cancel 按钮置于右侧，水平排列
5. THE Sticky_Actions_Bar SHALL 通过 safe-area-inset-bottom 适配带有底部安全区域的设备
6. WHILE 屏幕宽度小于 Mobile_Breakpoint，THE Profile_Page SHALL 在表单底部添加额外的内边距，防止 Sticky_Actions_Bar 遮挡表单内容
7. WHILE 屏幕宽度大于等于 Tablet_Breakpoint，THE Profile_Page SHALL 将操作按钮改为非固定模式，跟随表单底部展示


### 需求 6：按钮样式规范

**用户故事：** 作为用户，我希望操作按钮的样式统一且符合设计规范，以获得一致的视觉体验。

#### 验收标准

1. THE Sticky_Actions_Bar SHALL 将两个按钮设置为等宽，容器最大宽度为 300px
2. THE Profile_Page SHALL 确保所有按钮不硬编码 Radix Button 的 color 属性，由主题 accentColor 自动控制
3. THE Profile_Page SHALL 使用 SASS Module 样式文件定义所有按钮样式，不使用内联样式

### 需求 7：表单验证

**用户故事：** 作为用户，我希望在提交表单时获得即时的验证反馈，以便快速修正错误信息。

#### 验收标准

1. WHEN 用户提交表单且 displayName 字段为空，THE Profile_Page SHALL 在该字段下方显示红色错误提示信息
2. WHEN 用户提交表单且 bio 字段超过 200 个字符，THE Profile_Page SHALL 在该字段下方显示红色错误提示信息
3. WHEN 用户修正了验证错误的字段，THE Profile_Page SHALL 自动清除对应的错误提示

### 需求 8：表单提交与状态管理

**用户故事：** 作为用户，我希望保存编辑后的个人资料时获得明确的操作反馈，以便确认修改是否成功。

#### 验收标准

1. WHEN 用户点击 Save 按钮且表单验证通过，THE Profile_Page SHALL 通过 Redux dispatch updateProfile 将数据提交至后端 API
2. WHEN API 更新成功，THE Profile_Page SHALL 退出 Edit_Mode 并显示成功 Toast 提示
3. IF API 更新失败，THEN THE Profile_Page SHALL 显示错误 Toast 提示并保持 Edit_Mode 不退出，允许用户重试

### 需求 9：取消编辑

**用户故事：** 作为用户，我希望能够取消编辑并恢复到修改前的状态，以便在不想保存时安全退出。

#### 验收标准

1. WHEN 用户点击 Cancel 按钮，THE Profile_Page SHALL 将表单所有字段重置为编辑前的原始值
2. WHEN 用户点击 Cancel 按钮，THE Profile_Page SHALL 退出 Edit_Mode 并恢复 View_Mode

### 需求 10：编辑模式进入与表单预填充

**用户故事：** 作为用户，我希望进入编辑模式时表单自动填充当前的个人资料信息，以便在现有数据基础上进行修改。

#### 验收标准

1. WHEN 用户点击 "Edit Profile" 按钮，THE Profile_Page SHALL 进入 Edit_Mode
2. WHEN 进入 Edit_Mode，THE Profile_Page SHALL 使用当前 profile 数据预填充所有表单字段

### 需求 11：查看模式保持不变

**用户故事：** 作为用户，我希望查看模式的页面布局和功能保持不变，以便获得一致的浏览体验。

#### 验收标准

1. THE Profile_Page SHALL 在 View_Mode 下保持现有的 ID_Card、信息列表和操作按钮布局不变
2. THE Profile_Page SHALL 在 View_Mode 下继续展示 Birthday、Location、Occupation、Company 信息列表

### 需求 12：无新增依赖

**用户故事：** 作为开发者，我希望本次重构不引入新的第三方依赖，以保持项目依赖的精简和可维护性。

#### 验收标准

1. THE Profile_Page SHALL 仅使用现有项目依赖（React、Radix UI、react-hook-form、Redux Toolkit、SASS Modules）完成重构
