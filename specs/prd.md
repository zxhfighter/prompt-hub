# 提示词管理平台需求分析文档

## 1. 项目概述

### 1.1 项目背景

构建一个现代化的提示词管理平台，支持用户创建、管理、优化和版本控制 AI 提示词。平台面向需要管理和复用 AI 提示词的开发者、内容创作者和 AI 应用使用者。

### 1.2 核心目标

- 提供专业的提示词版本管理功能
- 支持 Markdown 格式的提示词编辑和预览
- 集成 AI 诊断优化能力
- 实现多端适配的响应式设计
- 确保用户数据隔离和安全

### 1.3 目标用户

- **AI 开发者**：需要管理和迭代多个提示词版本
- **内容创作者**：使用 AI 辅助写作，需要积累高质量提示词
- **企业用户**：需要标准化和复用提示词模板

---

## 2. 功能需求

### 2.1 用户认证与授权

| 功能     | 描述                               | 优先级 |
| -------- | ---------------------------------- | ------ |
| 用户注册 | 通过邮箱 + 密码注册，发送验证邮件  | P0     |
| 用户登录 | 支持邮箱/用户名 + 密码登录         | P0     |
| 数据隔离 | 用户只能访问自己的提示词数据       | P0     |
| 会话管理 | 登录状态保持 24 小时，支持刷新令牌 | P0     |
| 密码重置 | 通过邮箱验证重置密码               | P1     |

### 2.2 提示词核心管理

#### 2.2.1 状态管理

提示词有以下三种状态：

| 状态         | 描述               | 视觉标识            |
| ------------ | ------------------ | ------------------- |
| 纯草稿       | 从未发布过的提示词 | 灰色标签            |
| 已发布无更新 | 最新修改已发布     | 绿色标签            |
| 已发布有更新 | 有未发布的修改     | 橙色标签 + "有更新" |

**状态流转图**：

```
新建 → 草稿 → 发布 → 编辑 → 草稿(有更新) → 发布(新版本)
                  ↑                              ↓
                  └────────────────────────────────┘
```

#### 2.2.2 版本控制

- **版本号策略**：自动递增（V1, V2, V3...）
- **版本描述**：每个发布版本可添加变更描述
- **版本切换**：支持查看和编辑任意历史版本
- **版本对比**：
  - 支持选择任意两个版本进行对比
  - 使用 diff 算法高亮差异（新增、删除、修改）
  - 提供并排视图和统一视图两种模式
- **版本回滚**：可将任意历史版本恢复为当前版本

### 2.3 提示词操作功能

#### 2.3.1 创建功能

- **新建提示词**：创建新的提示词记录
- **初始状态**：新建后默认为草稿状态
- **必填字段**：标题、内容
- **可选字段**：标签、描述
- **保存选项**：
  - 保存草稿：保存但不发布
  - 直接发布：触发发布流程

#### 2.3.2 编辑功能

- **版本选择**：可选择任意历史版本作为基准进行编辑
- **状态感知**：根据当前状态显示不同的操作按钮
- **实时预览**：编辑时同步显示 Markdown 渲染效果
- **自动保存**：每 30 秒自动保存草稿（本地存储）

#### 2.3.3 查看功能

- **多格式查看**：支持 Raw 文本和 Markdown 预览双模式
- **版本选择器**：下拉切换不同版本
- **快捷操作**：一键复制当前显示的提示词内容
- **元信息显示**：创建时间、更新时间、版本数量

#### 2.3.4 删除功能

- **二次确认**：删除操作需用户输入确认文字
- **级联删除**：删除提示词时同步删除所有版本
- **软删除**：数据保留 30 天后永久删除（可选）

### 2.4 列表与筛选

#### 2.4.1 列表展示

- **信息显示**：标题、标签、最后修改时间、状态标识
- **卡片布局**：桌面端支持网格视图，移动端列表视图
- **操作入口**：编辑、查看、删除、复制快捷操作

#### 2.4.2 筛选功能

| 筛选项   | 说明                             |
| -------- | -------------------------------- |
| 状态筛选 | Tab 页切换"全部"/"已发布"/"草稿" |
| 标签筛选 | 多选标签，支持 AND/OR 逻辑       |
| 时间排序 | 按创建时间/更新时间排序          |

#### 2.4.3 搜索功能

- **标题搜索**：模糊匹配标题
- **内容搜索**：全文搜索（使用数据库全文索引）
- **搜索防抖**：300ms 延迟触发
- **高亮显示**：搜索结果高亮关键词

#### 2.4.4 分页设计

- **默认分页**：每页 20 条记录
- **无限滚动**：移动端支持滚动加载
- **状态保持**：分页参数保存在 URL 查询参数中

### 2.5 AI 集成功能

#### 2.5.1 AI 提供商配置

- **默认提供商**：OpenAI GPT-4o-mini（成本优化）
- **备选提供商**：支持配置 Anthropic Claude、Google Gemini
- **自动切换**：请求失败时自动切换到备选提供商
- **响应超时**：30 秒超时限制

#### 2.5.2 诊断功能

对提示词进行多维度分析：

| 维度   | 说明               | 评分范围 |
| ------ | ------------------ | -------- |
| 清晰度 | 表达是否清晰明确   | 1-10     |
| 完整性 | 上下文信息是否完整 | 1-10     |
| 有效性 | 是否能达到预期效果 | 1-10     |
| 结构性 | 组织结构是否合理   | 1-10     |

输出包含：

- 综合评分
- 各维度详细评分和说明
- 具体改进建议列表

#### 2.5.3 优化建议

- **流式输出**：逐步显示优化建议
- **差异对比**：展示原文和优化后的对比
- **选择性应用**：用户可逐条接受或拒绝建议
- **一键应用**：接受建议后自动更新内容

### 2.6 标签系统

- **标签创建**：用户可自定义标签名称和颜色
- **标签关联**：每个提示词可关联多个标签
- **标签管理**：支持重命名和删除标签
- **智能推荐**：根据内容自动推荐相关标签（AI 功能）

---

## 3. 页面设计

### 3.1 公开页面

#### 3.1.1 Landing 页面 (`/`)

**布局结构**：

- Hero 区域：产品标语 + CTA 按钮
- 特性展示：版本管理、AI 优化、Markdown 支持
- 使用演示：GIF 或视频展示核心功能
- 定价说明：免费/付费计划对比（如有）
- 页脚：链接、版权信息

**设计要点**：

- 响应式设计，移动端优先
- 深色/浅色主题支持
- 动画效果增强视觉吸引力

#### 3.1.2 登录页面 (`/login`)

- 登录表单：邮箱/用户名 + 密码
- 记住登录状态复选框
- 忘记密码链接
- 注册引导链接
- 第三方登录入口（可选：GitHub、Google）

#### 3.1.3 注册页面 (`/register`)

- 注册表单：用户名 + 邮箱 + 密码 + 确认密码
- 密码强度指示器
- 服务条款和隐私政策确认
- 登录引导链接

### 3.2 应用主页面

#### 3.2.1 仪表盘 (`/dashboard`)

- **统计卡片**：总提示词数、已发布数、草稿数
- **最近编辑**：最近编辑的 5 个提示词
- **快速操作**：新建提示词按钮

#### 3.2.2 提示词列表页 (`/dashboard/prompts`)

**操作区**：

- 新建提示词按钮
- 搜索输入框
- 标签筛选器
- 视图切换（卡片/列表）

**Tab 导航**：

- 全部 | 已发布 | 草稿

**列表区**：

- 提示词卡片/行展示
- 每卡片显示：标题、标签、更新时间、状态
- Hover 显示操作按钮

#### 3.2.3 提示词详情页 (`/dashboard/prompts/[id]`)

**顶部工具栏**：

- 返回按钮
- 版本选择器
- 编辑按钮
- 更多操作（删除、导出）

**内容区**：

- Tab 切换：预览 | 原始文本
- Markdown 渲染预览
- 元信息侧边栏

**操作栏**：

- 复制内容按钮
- AI 诊断按钮
- 版本历史按钮

#### 3.2.4 提示词编辑页 (`/dashboard/prompts/[id]/edit`)

**编辑器区域**：

- 左侧：Markdown 编辑器（支持工具栏）
- 右侧：实时预览（可折叠）

**表单字段**：

- 标题输入
- 标签选择器（支持创建新标签）

**操作按钮**：

- 保存草稿
- 发布 / 发布更新
- 取消

#### 3.2.5 新建提示词页 (`/dashboard/prompts/new`)

- 同编辑页布局
- 初始内容为空
- 提供模板选择（可选）

### 3.3 模态框设计

#### 3.3.1 发布确认模态框

```
┌─────────────────────────────────────┐
│  发布新版本                          │
├─────────────────────────────────────┤
│  版本号：V3 (自动生成)                │
│                                     │
│  版本描述：                          │
│  ┌─────────────────────────────────┐│
│  │ 输入本次发布的变更说明...         ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│         [取消]    [确认发布]         │
└─────────────────────────────────────┘
```

#### 3.3.2 删除确认模态框

```
┌─────────────────────────────────────┐
│  ⚠️ 确认删除                         │
├─────────────────────────────────────┤
│  此操作将删除该提示词及其所有版本，    │
│  且无法恢复。                        │
│                                     │
│  请输入 "DELETE" 确认删除            │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│         [取消]    [确认删除]         │
└─────────────────────────────────────┘
```

#### 3.3.3 AI 诊断结果模态框

```
┌─────────────────────────────────────┐
│  AI 诊断报告                         │
├─────────────────────────────────────┤
│  综合评分：8.5 / 10                  │
│                                     │
│  清晰度：9/10  ████████████░░       │
│  完整性：8/10  ██████████░░░░       │
│  有效性：8/10  ██████████░░░░       │
│  结构性：9/10  ████████████░░       │
│                                     │
│  改进建议：                          │
│  • 建议添加输出格式的具体示例         │
│  • 可以增加错误处理的说明             │
│                                     │
│         [关闭]    [应用优化]         │
└─────────────────────────────────────┘
```

---

## 4. 数据模型

### 4.1 ER 图

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   users     │     │    prompts      │     │prompt_versions│
├─────────────┤     ├─────────────────┤     ├──────────────┤
│ id (PK)     │────<│ id (PK)         │────<│ id (PK)      │
│ email       │     │ user_id (FK)    │     │ prompt_id(FK)│
│ username    │     │ title           │     │ version_num  │
│ password    │     │ current_ver_id  │     │ content      │
│ created_at  │     │ status          │     │ description  │
│ updated_at  │     │ created_at      │     │ is_published │
└─────────────┘     │ updated_at      │     │ published_at │
                    └─────────────────┘     │ created_at   │
                            │               └──────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
              ┌─────┴─────┐   ┌─────┴─────┐
              │prompt_tags│   │   tags    │
              ├───────────┤   ├───────────┤
              │prompt_id  │──>│ id (PK)   │
              │tag_id     │   │ user_id   │
              └───────────┘   │ name      │
                              │ color     │
                              │ created_at│
                              └───────────┘
```

### 4.2 表结构详情

#### 4.2.1 users 表

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### 4.2.2 prompts 表

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  current_version_id UUID, -- 指向最新发布版本，可为空
  draft_content TEXT, -- 当前草稿内容
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'published_with_updates')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_updated_at ON prompts(updated_at DESC);
CREATE INDEX idx_prompts_user_status ON prompts(user_id, status);
```

#### 4.2.3 prompt_versions 表

```sql
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(prompt_id, version_number)
);

CREATE INDEX idx_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_versions_published ON prompt_versions(prompt_id, is_published);
```

#### 4.2.4 tags 表

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1', -- HEX 颜色值
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
```

#### 4.2.5 prompt_tags 表

```sql
CREATE TABLE prompt_tags (
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

  PRIMARY KEY (prompt_id, tag_id)
);

CREATE INDEX idx_prompt_tags_tag_id ON prompt_tags(tag_id);
```

### 4.3 行级安全策略 (RLS)

```sql
-- 启用 RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;

-- prompts 策略：用户只能访问自己的数据
CREATE POLICY prompts_user_policy ON prompts
  FOR ALL USING (user_id = auth.uid());

-- prompt_versions 策略：通过 prompts 表关联检查
CREATE POLICY versions_user_policy ON prompt_versions
  FOR ALL USING (
    prompt_id IN (SELECT id FROM prompts WHERE user_id = auth.uid())
  );

-- tags 策略
CREATE POLICY tags_user_policy ON tags
  FOR ALL USING (user_id = auth.uid());

-- prompt_tags 策略
CREATE POLICY prompt_tags_user_policy ON prompt_tags
  FOR ALL USING (
    prompt_id IN (SELECT id FROM prompts WHERE user_id = auth.uid())
  );
```

---

## 5. API 设计

### 5.1 概述

- **协议**：RESTful API over HTTPS
- **认证**：JWT Bearer Token / Session Cookie
- **响应格式**：JSON
- **版本**：v1（路径前缀 `/api/v1`）

### 5.2 认证接口

| 方法 | 路径                        | 描述             |
| ---- | --------------------------- | ---------------- |
| POST | `/api/auth/register`        | 用户注册         |
| POST | `/api/auth/login`           | 用户登录         |
| POST | `/api/auth/logout`          | 用户登出         |
| GET  | `/api/auth/me`              | 获取当前用户信息 |
| POST | `/api/auth/refresh`         | 刷新访问令牌     |
| POST | `/api/auth/forgot-password` | 忘记密码         |
| POST | `/api/auth/reset-password`  | 重置密码         |

#### 5.2.1 注册请求/响应示例

```typescript
// POST /api/auth/register
// Request
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecureP@ss123"
}

// Response 201
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe"
  },
  "message": "注册成功，请查收验证邮件"
}
```

### 5.3 提示词管理接口

| 方法   | 路径               | 描述                   |
| ------ | ------------------ | ---------------------- |
| GET    | `/api/prompts`     | 获取提示词列表         |
| POST   | `/api/prompts`     | 创建新提示词           |
| GET    | `/api/prompts/:id` | 获取单个提示词详情     |
| PATCH  | `/api/prompts/:id` | 更新提示词（保存草稿） |
| DELETE | `/api/prompts/:id` | 删除提示词             |

#### 5.3.1 获取列表

```typescript
// GET /api/prompts?page=1&limit=20&status=published&tag=writing&search=gpt

// Response 200
{
  "data": [
    {
      "id": "uuid",
      "title": "文章写作助手",
      "status": "published",
      "tags": [
        { "id": "uuid", "name": "写作", "color": "#6366f1" }
      ],
      "currentVersion": {
        "versionNumber": 3,
        "publishedAt": "2024-01-15T10:00:00Z"
      },
      "createdAt": "2024-01-10T08:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### 5.3.2 创建提示词

```typescript
// POST /api/prompts
// Request
{
  "title": "代码审查助手",
  "content": "你是一个专业的代码审查专家...",
  "tagIds": ["uuid1", "uuid2"],
  "publish": false // true 则直接发布
}

// Response 201
{
  "id": "uuid",
  "title": "代码审查助手",
  "status": "draft",
  "draftContent": "你是一个专业的代码审查专家...",
  "tags": [...],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 5.4 版本管理接口

| 方法 | 路径                                           | 描述           |
| ---- | ---------------------------------------------- | -------------- |
| GET  | `/api/prompts/:id/versions`                    | 获取版本列表   |
| POST | `/api/prompts/:id/versions`                    | 发布新版本     |
| GET  | `/api/prompts/:id/versions/:versionId`         | 获取特定版本   |
| POST | `/api/prompts/:id/versions/:versionId/restore` | 恢复到指定版本 |

#### 5.4.1 发布新版本

```typescript
// POST /api/prompts/:id/versions
// Request
{
  "description": "优化了输出格式，增加了错误处理说明"
}

// Response 201
{
  "id": "uuid",
  "versionNumber": 4,
  "content": "...",
  "description": "优化了输出格式...",
  "isPublished": true,
  "publishedAt": "2024-01-16T14:30:00Z"
}
```

### 5.5 AI 集成接口

| 方法 | 路径               | 描述               |
| ---- | ------------------ | ------------------ |
| POST | `/api/ai/diagnose` | 诊断提示词         |
| POST | `/api/ai/optimize` | 优化提示词（流式） |

#### 5.5.1 诊断请求

```typescript
// POST /api/ai/diagnose
// Request
{
  "content": "提示词内容...",
  "promptId": "uuid", // 可选，用于记录
  "versionId": "uuid" // 可选
}

// Response 200
{
  "overallScore": 8.5,
  "scores": {
    "clarity": { "score": 9, "feedback": "表达清晰明确" },
    "completeness": { "score": 8, "feedback": "建议添加示例" },
    "effectiveness": { "score": 8, "feedback": "目标明确" },
    "structure": { "score": 9, "feedback": "结构合理" }
  },
  "suggestions": [
    "建议添加输出格式的具体示例",
    "可以增加错误处理的说明"
  ]
}
```

#### 5.5.2 优化请求（流式）

```typescript
// POST /api/ai/optimize
// Request
{
  "content": "提示词内容..."
}

// Response: text/event-stream
data: {"type": "start"}

data: {"type": "chunk", "content": "优化后的"}

data: {"type": "chunk", "content": "提示词内容..."}

data: {"type": "done", "fullContent": "完整优化内容"}
```

### 5.6 标签管理接口

| 方法   | 路径            | 描述             |
| ------ | --------------- | ---------------- |
| GET    | `/api/tags`     | 获取用户标签列表 |
| POST   | `/api/tags`     | 创建新标签       |
| PATCH  | `/api/tags/:id` | 更新标签         |
| DELETE | `/api/tags/:id` | 删除标签         |

### 5.7 统一错误响应

```typescript
// 错误响应格式
{
  "error": {
    "code": "VALIDATION_ERROR" | "AUTH_ERROR" | "NOT_FOUND" | "FORBIDDEN" | "SERVER_ERROR",
    "message": "用户友好的错误消息",
    "details": {} // 仅开发环境返回
  }
}

// HTTP 状态码
// 400 - 请求参数错误
// 401 - 未认证
// 403 - 无权限
// 404 - 资源不存在
// 429 - 请求频率限制
// 500 - 服务器错误
```

---

## 6. 技术架构

### 6.1 技术栈

#### 6.1.1 核心技术

| 类别    | 技术选型                 | 说明           |
| ------- | ------------------------ | -------------- |
| 包管理  | pnpm                     | 高效的包管理器 |
| 框架    | Next.js 16+ (App Router) | React 全栈框架 |
| 语言    | TypeScript（严格模式）   | 类型安全       |
| 样式    | Tailwind CSS             | 原子化 CSS     |
| UI 组件 | shadcn/ui (Radix UI)     | 可定制组件库   |
| 图标    | lucide-react             | 一致的图标系统 |

#### 6.1.2 关键依赖

| 功能          | 库                          | 版本要求 |
| ------------- | --------------------------- | -------- |
| Markdown 编辑 | @uiw/react-md-editor        | ^4.0.0   |
| Markdown 渲染 | react-markdown + remark-gfm | ^9.0.0   |
| 表单处理      | react-hook-form + zod       | ^7.0.0   |
| 状态管理      | Zustand                     | ^4.0.0   |
| 数据库 ORM    | Drizzle ORM                 | ^0.30.0  |
| 数据库        | PostgreSQL (Supabase)       | 15+      |
| 认证          | Supabase Auth / Auth.js     | -        |
| AI SDK        | Vercel AI SDK               | ^3.0.0   |
| Diff 对比     | react-diff-viewer-continued | ^3.0.0   |

### 6.2 目录结构

```
prompt-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # 公开页面
│   │   │   ├── page.tsx       # Landing
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # 应用页面
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── prompts/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── new/
│   │   │   │       └── [id]/
│   │   │   │           ├── page.tsx
│   │   │   │           └── edit/
│   │   │   └── settings/
│   │   └── api/               # API 路由
│   │       ├── auth/
│   │       ├── prompts/
│   │       ├── tags/
│   │       └── ai/
│   ├── components/
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── layout/            # 布局组件
│   │   ├── prompts/           # 提示词相关组件
│   │   │   ├── prompt-card.tsx
│   │   │   ├── prompt-editor.tsx
│   │   │   ├── version-selector.tsx
│   │   │   └── version-diff.tsx
│   │   └── ai/                # AI 功能组件
│   ├── lib/
│   │   ├── db/                # 数据库配置
│   │   │   ├── schema.ts      # Drizzle schema
│   │   │   └── index.ts
│   │   ├── auth/              # 认证逻辑
│   │   ├── ai/                # AI 服务
│   │   └── utils.ts           # 工具函数
│   ├── hooks/                 # 自定义 Hooks
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript 类型定义
├── public/
├── specs/                     # 需求文档
├── drizzle/                   # 数据库迁移
├── .env.local                 # 环境变量
├── drizzle.config.ts
├── next.config.js
├── tailwind.config.ts
└── package.json
```

### 6.3 环境变量配置

使用 `@t3-oss/env-nextjs` 进行类型安全的环境变量管理：

```typescript
// src/lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string(),
    NEXTAUTH_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    // ... 其他变量
  },
});
```

**环境变量清单**：

| 变量名                          | 必需 | 说明                             |
| ------------------------------- | ---- | -------------------------------- |
| `DATABASE_URL`                  | ✅   | PostgreSQL 连接字符串            |
| `OPENAI_API_KEY`                | ✅   | OpenAI API 密钥                  |
| `NEXT_PUBLIC_APP_URL`           | ✅   | 应用公开 URL                     |
| `NEXTAUTH_SECRET`               | ⚪   | NextAuth 密钥（使用 Auth.js 时） |
| `NEXT_PUBLIC_SUPABASE_URL`      | ⚪   | Supabase URL（使用 Supabase 时） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⚪   | Supabase 匿名密钥                |
| `RESEND_API_KEY`                | ⚪   | 邮件服务密钥                     |

---

## 7. 非功能需求

### 7.1 性能要求

#### 7.1.1 前端性能指标

| 指标 | 目标值  | 说明         |
| ---- | ------- | ------------ |
| LCP  | < 2.5s  | 最大内容绘制 |
| FID  | < 100ms | 首次输入延迟 |
| CLS  | < 0.1   | 累积布局偏移 |
| TTI  | < 3.5s  | 可交互时间   |

#### 7.1.2 优化策略

**前端优化**：

- 路由级代码分割（Next.js 自动）
- 图片优化（Next.js Image）
- Markdown 编辑器动态导入
- 长列表虚拟滚动（react-window）

**数据加载**：

- 默认分页，每页 20 条
- 使用 SWR 或 TanStack Query 缓存
- 关键数据预加载

**数据库优化**：

- 合理的索引设计（见数据模型章节）
- 查询只返回必要字段
- 使用连接池

### 7.2 安全需求

#### 7.2.1 身份认证

- **密码存储**：使用 bcrypt，成本因子 >= 10
- **会话管理**：JWT 有效期 24 小时，支持刷新令牌
- **登录保护**：5 次失败后锁定 15 分钟

#### 7.2.2 API 安全

- **认证中间件**：所有 `/api/prompts/*`, `/api/tags/*`, `/api/ai/*` 路由
- **速率限制**：
  - 登录接口：5 次/分钟
  - AI 接口：10 次/分钟
  - 其他接口：60 次/分钟
- **CSRF 保护**：状态变更操作使用 CSRF Token

#### 7.2.3 数据安全

- **行级安全**：PostgreSQL RLS 策略
- **SQL 注入**：ORM 参数化查询
- **XSS 防护**：
  - Markdown 渲染使用 DOMPurify 清理
  - React 自动转义用户输入
- **敏感数据**：不在日志中记录用户提示词内容

#### 7.2.4 HTTPS

- 强制 HTTPS
- HSTS 头部
- 安全 Cookie 属性

### 7.3 可用性需求

- **响应式设计**：支持桌面（1280px+）、平板（768px-1279px）、手机（<768px）
- **浏览器支持**：Chrome/Edge/Firefox/Safari 最新两个版本
- **可访问性**：
  - 键盘导航支持
  - 图片 alt 属性
  - 足够的颜色对比度
  - Screen Reader 友好

### 7.4 可靠性需求

- **错误处理**：
  - 前端 Error Boundary 捕获渲染错误
  - API 统一错误响应格式
  - 用户友好的错误提示
- **数据备份**：
  - 数据库每日自动备份
  - 保留 30 天备份历史
- **监控告警**：
  - API 错误率监控
  - 响应时间监控
  - AI 服务可用性监控

---

## 8. 测试策略

### 8.1 单元测试

- **框架**：Vitest
- **覆盖范围**：
  - 工具函数（utils）
  - 自定义 Hooks
  - 状态管理（stores）
- **覆盖率目标**：> 80%

### 8.2 集成测试

- **框架**：Vitest + Testing Library
- **覆盖范围**：
  - 组件渲染和交互
  - 表单验证
  - API 调用 mock

### 8.3 端到端测试

- **框架**：Playwright
- **关键路径**：
  - 用户注册 → 登录
  - 创建提示词 → 编辑 → 发布
  - 版本切换和对比
  - AI 诊断功能
- **执行时机**：CI/CD 流水线

### 8.4 测试数据

- 使用 Faker.js 生成测试数据
- 独立测试数据库
- 每次测试后清理数据

---

## 9. 部署与运维

### 9.1 部署架构

```
                    ┌─────────────┐
                    │   Vercel    │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
    │  Supabase   │ │   OpenAI    │ │   Resend    │
    │ (Database)  │ │    API      │ │   (Email)   │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### 9.2 CI/CD 流程

```yaml
# GitHub Actions 示例
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

### 9.3 环境管理

| 环境        | 用途     | 数据库      |
| ----------- | -------- | ----------- |
| Development | 本地开发 | 本地/测试库 |
| Preview     | PR 预览  | 测试库      |
| Production  | 生产环境 | 生产库      |

---

## 10. MVP 范围

### 10.1 V1.0（MVP）

**必须包含**：

- [x] 用户注册/登录
- [x] 提示词 CRUD
- [x] 版本发布和查看
- [x] 基础状态管理（草稿/发布）
- [x] Markdown 编辑和预览
- [x] 标签管理和筛选
- [x] 响应式设计
- [x] 一键复制

**预计开发周期**：4-6 周

### 10.2 V1.1

- [ ] AI 诊断功能
- [ ] AI 优化建议
- [ ] 版本对比视图
- [ ] 搜索功能
- [ ] 快捷键支持

**预计开发周期**：2-3 周

### 10.3 V1.2

- [ ] 数据导出（JSON/Markdown）
- [ ] 自动保存草稿
- [ ] 暗色主题
- [ ] 提示词模板

### 10.4 V2.0（未来版本）

- [ ] 团队协作
- [ ] 公开分享
- [ ] 使用统计
- [ ] 浏览器插件
- [ ] 移动端 APP

---

## 11. 附录

### 11.1 术语表

| 术语             | 定义                           |
| ---------------- | ------------------------------ |
| 提示词（Prompt） | 用于指导 AI 模型行为的文本指令 |
| 草稿（Draft）    | 未发布的提示词版本             |
| 发布（Publish）  | 将当前内容创建为正式版本       |
| 版本（Version）  | 提示词的历史快照               |
| 诊断（Diagnose） | AI 分析提示词质量              |

### 11.2 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [shadcn/ui 组件](https://ui.shadcn.com)

### 11.3 变更历史

| 版本 | 日期    | 变更内容                                             | 作者 |
| ---- | ------- | ---------------------------------------------------- | ---- |
| V1.0 | 2024-01 | 初始版本                                             | -    |
| V2.0 | 2026-01 | 完整修订：增加数据模型、API 设计、技术架构、安全策略 | -    |

---

**文档版本**：V2.0  
**最后更新**：2026-01-19  
**状态**：评审中
