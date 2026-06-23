# 🛒 EasyMall 电商平台

EasyMall 是一个前后端分离的电商系统，包含用户端商城和管理端后台。

---

## 📁 项目结构

```
easymall/
├── easymall-java/           # 后端服务（Spring Boot）
│   ├── easymall-admin/      # 管理端后端（端口 6061）
│   ├── easymall-web/        # 用户端后端（端口 6050）
│   └── easymall-common/     # 公共模块
├── easymall-admin-web/      # 管理端前端（端口 5173）
└── easymall-web/            # 用户端前端（端口 5174）
```

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | Spring Boot 3.2.10 |
| ORM | MyBatis |
| 缓存 | Redis |
| 数据库 | MySQL 8.0 |
| 管理端前端 | Vue 3 + TypeScript + Element Plus |
| 用户端前端 | Vue 3 + TypeScript + Element Plus |
| 构建工具 | Maven / Vite |

---

## ✨ 功能模块

### 👤 用户端
- 商品浏览（分类筛选、搜索、排序）
- 购物车管理（增删改查、批量操作）
- 订单管理（下单、支付、确认收货）
- 用户登录/注册

### 🔧 管理端
- 数据看板（销售趋势、热销排行）
- 商品管理（CRUD、SKU、上下架）
- 分类管理（树形结构、拖拽排序）
- 品牌管理（CRUD、启用/禁用）
- 订单管理（列表、发货、备注）
- 用户管理（CRUD、回收站、重置密码）
- 轮播图管理（CRUD、排序）

---

## 🚀 快速启动

### 1. 环境要求
- JDK 17+
- MySQL 8.0+
- Redis
- Node.js 18+

### 2. 启动后端

```bash
# 进入后端目录
cd easymall-java

# 编译打包
mvn clean install -DskipTests

# 启动管理端（端口 6061）
cd easymall-admin
mvn spring-boot:run

# 启动用户端（端口 6050）
cd ../easymall-web
mvn spring-boot:run
```

### 3. 启动前端

```bash
# 管理端前端（端口 5173）
cd easymall-admin-web
npm install
npm run dev

# 用户端前端（端口 5174）
cd ../easymall-web
npm install
npm run dev
```

### 4. 访问

| 端 | 地址 | 账号 |
|----|------|------|
| 管理端 | http://localhost:5173 | admin / 123456 |
| 用户端 | http://localhost:5174 | 自行注册 |

---

## 📝 端口规划

| 项目 | 端口 | 说明 |
|------|------|------|
| 管理端后端 | 6061 | easymall-admin |
| 用户端后端 | 6050 | easymall-web |
| 管理端前端 | 5173 | easymall-admin-web |
| 用户端前端 | 5174 | easymall-web |

---

## 📦 数据库

执行以下 SQL 创建数据库：

```sql
CREATE DATABASE easymall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

表结构请参考 `easymall-java/` 下的实体类或 SQL 脚本（待补充）。

---

## 📄 许可证

MIT License