# NaviHive - 现代化的网站导航管理系统

![NaviHive 导航站](https://img.shields.io/badge/NaviHive-导航站-blue)
![React](https://img.shields.io/badge/React-19.0.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6)
![Material UI](https://img.shields.io/badge/Material_UI-7.0-0081cb)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020)

NaviHive 是一个精美的网站导航管理系统，帮助你整理和管理你收藏的网站链接。支持分组管理、拖拽排序、暗色模式等功能，让你的网站收藏更有条理、更易访问。

## ✨ 特性

- 📚 **分组管理** - 将网站按类别整理成分组
- 🔄 **拖拽排序** - 直观地调整分组和网站的排列顺序
- 🔐 **用户认证** - 内置登录系统，保护你的导航数据
- 🌓 **暗色/亮色模式** - 随时切换主题，保护你的眼睛
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **自定义配置** - 支持自定义网站标题、名称和CSS样式
- 🚀 **高性能** - 基于Cloudflare Workers和D1数据库构建

## 🛠️ 技术栈

- **前端**：
  - React 19
  - TypeScript
  - Material UI 7.0
  - DND Kit (拖拽功能)
  - Tailwind CSS

- **后端**：
  - Cloudflare Workers
  - Cloudflare D1 (SQLite)
  - JWT 认证

## 📦 安装

1. 克隆仓库
```bash
git clone https://github.com/zqq-nuli/NaviHive.git
cd NaviHive
```

2. 安装依赖
```bash
pnpm install
```

3. 开发模式
```bash
pnpm dev
```

4. 构建项目
```bash
pnpm build
```

## ⚙️ 配置

### 环境变量

在 `wrangler.toml` 文件中配置以下环境变量：

```toml
[vars]
AUTH_ENABLED = "true"  # 是否启用认证系统
AUTH_USERNAME = "admin"  # 管理员用户名
AUTH_PASSWORD = "password"  # 管理员密码
AUTH_SECRET = "your-secret-key"  # JWT密钥，请使用随机字符串
```

### 数据库配置

```toml
[[d1_databases]]
binding = "DB"
database_name = "navigation-db"
database_id = "your-database-id"
```

## 🚀 部署

使用 Cloudflare Wrangler 部署:

```bash
# 登录到你的Cloudflare账户
npx wrangler login

# 部署应用
npx wrangler publish
```

## 🗂️ 项目结构

```
├── functions/            # Cloudflare Workers函数
│   └── api/              # API端点
├── public/               # 静态资源
│   └── svg/              # SVG图标
├── src/                  # 前端源码
│   ├── API/              # API客户端
│   ├── components/       # React组件
│   └── App.tsx           # 主应用组件
├── wrangler.toml         # Cloudflare Workers配置
├── package.json          # 项目依赖
└── README.md             # 项目说明
```

## 🔧 主要功能

### 分组管理
- 创建新分组
- 管理分组内的网站
- 拖拽排序分组

### 网站管理
- 添加网站（名称、URL、图标、描述等）
- 编辑网站信息
- 删除网站
- 站点内拖拽排序

### 认证系统
- 用户登录
- JWT令牌认证
- 可选的认证功能

### 主题切换
- 支持亮色/暗色主题
- 记住用户主题偏好

### 系统配置
- 自定义网站标题
- 自定义网站名称
- 支持自定义CSS

## 💡 使用提示

1. **初始化设置**：首次使用时，访问 `/api/init` 初始化数据库
2. **默认登录**：使用在 `wrangler.toml` 中配置的用户名和密码登录
3. **添加网站**：点击分组中的"添加卡片"按钮添加新网站
4. **排序**：点击"编辑排序"按钮进入排序模式，拖拽调整顺序

## 📚 API文档

NaviHive 提供以下API端点：

- `POST /api/login` - 用户登录
- `GET /api/groups` - 获取所有分组
- `POST /api/groups` - 创建新分组
- `GET /api/sites` - 获取所有站点
- `POST /api/sites` - 创建新站点
- `PUT /api/group-orders` - 更新分组排序
- `PUT /api/site-orders` - 更新站点排序
- `GET /api/configs` - 获取系统配置
- `PUT /api/configs/{key}` - 更新系统配置

## 🤝 贡献

欢迎贡献代码、报告问题或提出改进建议！

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📄 许可证

此项目采用 MIT 许可证 - 详情见 [LICENSE](LICENSE) 文件

## 🙏 鸣谢

- [React](https://reactjs.org/)
- [Material UI](https://mui.com/)
- [DND Kit](https://dndkit.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Vite](https://vitejs.dev/)

---

**NaviHive** - 让网站导航更简单、更美观！