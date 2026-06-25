<div align="center">

# 🛒 EasyMall 电商平台

**基于 Spring Boot 3 + Vue 3 的前后端分离电商平台**

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.10-6DB33F?logo=spring-boot)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?logo=redis)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 📌 项目简介

EasyMall 是一个功能完整的电商平台，采用前后端分离架构，包含 **用户端商城** 和 **管理端后台** 两套系统，覆盖商品浏览、购物车、订单管理、用户管理等电商核心业务场景。

- **用户端**：商品浏览与购买、购物车管理、订单全流程（下单 → 支付 → 确认收货）
- **管理端**：商品/分类/品牌/订单/用户/轮播图管理和数据看板

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | Spring Boot 3.2.10 + JDK 17 |
| ORM | MyBatis 3.0.3 + MySQL 8.0 |
| 缓存 | Redis（Token 存储、数据缓存、验证码） |
| 用户前端 | Vue 3 + TypeScript + Element Plus + Pinia + Vue Router |
| 管理前端 | Vue 3 + TypeScript + Element Plus + ECharts + SortableJS |
| 构建工具 | Maven（后端）/ Vite 8（前端） |

---

## ✨ 功能特性

### 👤 用户端（商城）

| 模块 | 功能 |
|------|------|
| **商品浏览** | 分类导航、商品列表（分页/排序）、商品详情（SKU规格选择、价格联动） |
| **购物车** | 添加商品、数量修改、选中/取消、批量删除、清空购物车 |
| **订单管理** | 订单确认（收货地址表单）、订单列表（状态筛选/分页）、订单详情（时间线/商品清单） |
| **支付流程** | 模拟支付、确认收货、取消订单（状态：待付款→待发货→待收货→已完成） |
| **用户认证** | 注册、登录（验证码）、信息修改、密码修改、退出登录 |
| **轮播图** | 首页轮播展示（管理端可配置） |

### 🔧 管理端（后台）

| 模块 | 功能 |
|------|------|
| **数据看板** | 总用户数/订单数/销售额统计、近7天销售趋势图、热销商品排行 |
| **商品管理** | 商品 CRUD、多规格 SKU 管理、上下架、图片上传 |
| **分类管理** | 树形结构展示、新增/编辑/删除、拖拽移动、批量排序 |
| **品牌管理** | 品牌 CRUD、批量排序、启用/禁用 |
| **订单管理** | 订单列表/搜索、订单详情、发货（物流信息）、取消、备注 |
| **用户管理** | 用户列表/搜索、状态禁用/启用、密码重置、逻辑删除/恢复、回收站 |
| **轮播图管理** | 轮播图 CRUD、排序、启用/禁用状态切换 |
| **图片上传** | 品牌Logo、商品图片、用户头像、轮播图上传 |

---

## 📁 项目结构

```
easymall/
├── easymall-java/               # 后端（Spring Boot 多模块 Maven 项目）
│   ├── easymall-common/         # 公共模块（PO实体、Service接口/实现、Mapper、Redis）
│   ├── easymall-web/            # 用户端后端（端口 6050）
│   ├── easymall-admin/          # 管理端后端（端口 6061）
│   └── easymall-mcp/            # MCP 服务扩展（Spring AI）
├── easymall-web/                # 用户端前端（Vue 3 + TS，端口 5174）
└── easymall-admin-web/          # 管理端前端（Vue 3 + TS，端口 5173）
```

详细架构文档见 [`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md)。

---

## 🚀 快速启动

### 1. 环境要求

- JDK 17+
- MySQL 8.0+
- Redis 7.0+
- Node.js 18+（推荐 22+）
- Maven 3.8+

### 2. 数据库初始化

```sql
CREATE DATABASE IF NOT EXISTS easymall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> 表结构由 MyBatis 实体类自动映射，首次启动时建议手动执行 SQL 脚本（如已提供 `schema.sql`），或通过 `ddl-auto` 参数自动建表。

### 3. 启动后端

```bash
# 克隆项目后进入后端目录
cd easymall-java

# 编译全部模块
mvn clean install -DskipTests

# 启动用户端后端（端口 6050）
cd easymall-web
mvn spring-boot:run

# 新开终端，启动管理端后端（端口 6061）
cd ../easymall-admin
mvn spring-boot:run
```

### 4. 启动前端

```bash
# 用户端前端（端口 5174）
cd easymall-web
npm install
npm run dev

# 管理端前端（端口 5173）
cd ../easymall-admin-web
npm install
npm run dev
```

### 5. 访问系统

| 端 | 地址 | 默认账号 |
|----|------|----------|
| 管理端后台 | [http://localhost:5173](http://localhost:5173) | `admin` / `admin123` |
| 用户端商城 | [http://localhost:5174](http://localhost:5174) | 自行注册 |

---

## 📝 端口规划

| 服务 | 端口 | 说明 |
|------|------|------|
| 用户端后端（easymall-web） | 6050 | 用户端 API 服务 |
| 管理端后端（easymall-admin） | 6061 | 管理端 API 服务 |
| 用户端前端（Vite） | 5174 | 商城页面开发服务器 |
| 管理端前端（Vite） | 5173 | 后台页面开发服务器 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存/会话 |

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md) | 完整架构文档（Controller/Service/API清单、数据模型、技术栈详情） |

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交变更：`git commit -m "Add: some feature"`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

---

## 📄 许可证

[MIT License](./LICENSE) © 2026 EasyMall
