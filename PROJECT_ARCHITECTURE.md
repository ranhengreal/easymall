## EasyMall 项目架构文档

### 1. 项目概述

- **项目名称**：EasyMall 电商平台
- **项目简介**：基于 Spring Boot 3 + Vue 3 的前后端分离电商平台，包含用户端（商城）和管理端（后台管理系统），支持商品浏览、购物车、订单管理、用户管理等核心电商功能。
- **技术栈总览**：
  - 后端：Spring Boot 3.2.10 + JDK 17 + MyBatis + MySQL + Redis
  - 用户前端：Vue 3 + TypeScript + Element Plus + Pinia + Vite 8
  - 管理前端：Vue 3 + TypeScript + Element Plus + Pinia + ECharts + Vite 8

### 2. 后端架构（`easymall-java/`）

#### 2.1 模块结构

```
easymall-java/
├── easymall-common/          # 公共模块（实体、服务接口、Mapper、工具类）
│   ├── src/main/java/
│   │   ├── com/easymall/auth/        # 认证注解（@CurrentUserId, @CurrentToken）
│   │   ├── com/easymall/component/   # RedisComponent（验证码、Token管理）
│   │   ├── com/easymall/entity/
│   │   │   ├── po/                   # 数据实体（PO）
│   │   │   ├── dto/                  # 数据传输对象（DTO）
│   │   │   ├── vo/                   # 视图对象（VO）
│   │   │   ├── constants/            # 常量定义
│   │   │   └── result/               # 统一响应结果
│   │   ├── com/easymall/exception/   # 异常类和全局异常处理
│   │   ├── com/easymall/mapper/      # MyBatis Mapper 接口
│   │   ├── com/easymall/redis/       # Redis 配置和工具类
│   │   └── com/easymall/service/     # 服务接口 + 实现
│   └── src/main/resources/
│       └── com/easymall/mapper/      # MyBatis XML 映射文件
│
├── easymall-web/             # 用户端后端模块
│   └── src/main/java/com/easymall/
│       ├── EasyMallWebApplication.java  # 启动类
│       └── controller/                 # 用户端 Controller
│
├── easymall-admin/           # 管理端后端模块
│   └── src/main/java/com/easymall/
│       ├── EasyMallAdminApplication.java  # 启动类
│       └── controller/                   # 管理端 Controller
│
└── easymall-mcp/             # MCP 服务模块（Spring AI MCP 扩展）
```

#### 2.2 已实现 Controller 列表

**用户端（easymall-web）**：

| Controller | 路径前缀 | 功能 | 主要端点 |
|------------|----------|------|----------|
| `UserController` | `/user` | 用户认证与信息管理 | GET checkCode, POST register, POST login, POST logout, GET info, PUT info, PUT password |
| `ProductController` | `/product` | 商品浏览 | GET list, GET {productId} |
| `CategoryController` | `/category` | 商品分类 | GET tree |
| `CartController` | `/cart` | 购物车管理 | GET list, POST add, PUT {cartId}/quantity, PUT {cartId}/selected, PUT selected/batch, DELETE {cartId}, DELETE batch, DELETE clear |
| `OrderController` | `/order` | 订单管理 | GET my, GET {orderId}, POST create, PUT {orderId}/pay, PUT {orderId}/confirm, PUT {orderId}/cancel |
| `BannerController` | `/banner` | 轮播图 | GET list |
| `BrandController` | `/brand` | 品牌查询 | GET enabled |
| `UploadController` | `/api/upload` | 文件上传（头像、评论图） | POST avatar, POST review |

**管理端（easymall-admin）**：

| Controller | 路径前缀 | 功能 | 主要端点 |
|------------|----------|------|----------|
| `AccountController` | `/admin/account` | 管理员认证 | GET checkCode, POST login, POST logout, GET info, PUT password |
| `AdminUserController` | `/admin/user` | 用户管理 | GET list, GET {userId}, PUT {userId}/status, PUT {userId}/reset-password, DELETE {userId}, PUT {userId}/restore, GET deleted |
| `BannerController` | `/admin/banner` | 轮播图管理 | GET list, POST add, PUT update, DELETE delete/{id}, PUT status/{id} |
| `BrandController` | `/admin/brand` | 品牌管理 | CRUD + 批量排序 |
| `CategoryController` | `/admin/category` | 分类管理 | CRUD + 树形查询 + 移动 + 批量排序 |
| `ImageController` | 直接映射 | 图片资源访问 | GET /images/brand/{date}/{filename} 等 |
| `OrderController` | `/admin/order` | 订单管理 | GET list, GET {orderId}, PUT {orderId}/ship, PUT {orderId}/cancel, PUT {orderId}/remark, DELETE {orderId} |
| `ProductController` | `/admin/product` | 商品管理 | GET list, GET {productId}, POST create, PUT {productId}, PUT {productId}/status, DELETE {productId} |
| `StatisticsController` | `/admin/statistics` | 数据统计 | GET dashboard, GET trend, GET hot-products |
| `UploadController` | `/admin/upload` | 文件上传 | POST brand, POST product, POST avatar, POST banner |

#### 2.3 已实现 Service 列表

| Service | 实现类 | 功能 | 主要方法 |
|---------|--------|------|----------|
| `UserService` | `UserServiceImpl` | 用户注册/登录/信息管理 | register(), login(), getById(), updateProfile(), changePassword() |
| `ProductService` | `ProductServiceImpl` | 商品查询/管理 | getList(), getById(), create(), update(), delete() |
| `CategoryService` | `CategoryServiceImpl` | 分类管理 | getTree(), getList(), getPath(), create(), update(), delete(), move() |
| `CartService` | `CartServiceImpl` | 购物车操作 | getList(), getSelectedList(), add(), updateQuantity(), updateSelected(), batchUpdateSelected(), delete(), batchDelete(), clear() |
| `OrderService` | `OrderServiceImpl` | 订单管理 | getList(), getById(), getByUserId(), query(), create(), pay(), confirm(), cancel(), ship(), updateStatus(), updateRemark(), delete() |
| `BannerService` | `BannerServiceImpl` | 轮播图管理 | getList(), add(), update(), delete(), updateStatus() |
| `BrandService` | `BrandServiceImpl` | 品牌管理 | getEnabled(), getById(), create(), update(), delete(), batchUpdateSort() |
| `StatisticsService` | `StatisticsServiceImpl` | 数据统计 | getDashboard(), getTrend(), getHotProducts() |
| `UploadService` | `UploadServiceImpl` | 文件上传 | uploadBrandImage(), uploadProductImage(), uploadAvatar(), uploadBannerImage() |

#### 2.4 数据模型（PO）

| 实体 | 表名（推测） | 说明 | 关键字段 |
|------|-------------|------|----------|
| `User` | `user` | 用户 | userId, username, password, nickname, phone, email, gender, avatar, status, isDeleted |
| `Product` | `product` | 商品 | productId, productName, categoryId, brandId, mainImage, images(JSON), description, price, stock, sales, status |
| `ProductSku` | `product_sku` | 商品SKU | skuId, productId, specValues, price, stock, image |
| `Category` | `category` | 分类 | categoryId, categoryName, pCategoryId, sort, level |
| `Brand` | `brand` | 品牌 | brandId, brandName, brandLogo, description, sort, status |
| `Cart` | `cart` | 购物车 | cartId, userId, productId, productName, productImage, skuId, specValues, price, quantity, selected |
| `Order` | `order_` | 订单 | orderId, orderSn, userId, totalAmount, freightAmount, payAmount, orderStatus, payStatus, payType, receiverName/Phone/Address, payTime, shipTime, receiveTime |
| `OrderItem` | `order_item` | 订单明细 | itemId, orderId, productId, productName, productImage, skuId, specValues, price, quantity, totalAmount |
| `Banner` | `banner` | 轮播图 | id, title, imageUrl, linkUrl, sort, status |

#### 2.5 Mapper 接口

| Mapper | 功能 |
|--------|------|
| `UserMapper` | 用户 CRUD、按用户名查询 |
| `ProductMapper` | 商品 CRUD、按条件查询 |
| `ProductSkuMapper` | SKU CRUD、按商品ID查询 |
| `CategoryMapper` | 分类 CRUD、树形查询 |
| `BrandMapper` | 品牌 CRUD、批量排序 |
| `CartMapper` | 购物车 CRUD、按用户查询、按商品查询 |
| `OrderMapper` | 订单 CRUD、按用户/条件查询、发货 |
| `OrderItemMapper` | 订单明细 CRUD、按订单ID查询 |
| `BannerMapper` | 轮播图 CRUD |

#### 2.6 订单状态常量

| 常量名 | 值 | 说明 |
|--------|------|------|
| `ORDER_STATUS_WAIT_PAY` | 0 | 待付款 |
| `ORDER_STATUS_WAIT_SHIP` | 1 | 待发货 |
| `ORDER_STATUS_WAIT_RECEIVE` | 2 | 待收货 |
| `ORDER_STATUS_COMPLETED` | 3 | 已完成 |
| `ORDER_STATUS_CANCELLED` | 4 | 已取消 |
| `ORDER_STATUS_AFTER_SALE` | 5 | 售后中 |

### 3. 前端架构（`easymall-web/` 用户端）

#### 3.1 目录结构

```
easymall-web/
├── index.html
├── package.json
├── vite.config.ts               # Vite 配置（端口 5174，代理 /api → localhost:6050）
├── tsconfig.json                # TypeScript 配置
├── src/
│   ├── main.ts                  # 入口文件
│   ├── App.vue                  # 根组件
│   ├── api/                     # API 调用层
│   │   ├── auth.ts              # 用户认证 API（登录/注册/获取用户信息）
│   │   ├── banner.ts            # 轮播图 API
│   │   ├── cart.ts              # 购物车 API
│   │   ├── category.ts          # 分类 API
│   │   ├── order.ts             # 订单 API（含 ORDER_STATUS_MAP）
│   │   └── product.ts           # 商品 API
│   ├── assets/                  # 静态资源
│   ├── components/              # 通用组件
│   │   ├── common/
│   │   │   └── CategoryTreeNode.vue  # 分类树形节点组件
│   │   └── layout/
│   │       ├── Layout.vue       # 布局容器（Header + main + Footer）
│   │       ├── Header.vue       # 顶部导航栏（Logo、搜索、分类、购物车、用户信息）
│   │       └── Footer.vue       # 页脚
│   ├── router/
│   │   └── index.ts             # 路由配置（含路由守卫）
│   ├── stores/
│   │   └── cart.ts              # Pinia 购物车 Store（本地购物车状态）
│   ├── utils/
│   │   └── request.ts           # Axios 封装（拦截器、Token 注入、错误处理）
│   └── views/                   # 页面组件
│       ├── home/Index.vue       # 首页
│       ├── login/Index.vue      # 登录页
│       ├── login/Register.vue   # 注册页
│       ├── product/List.vue     # 商品列表页
│       ├── product/Detail.vue   # 商品详情页
│       ├── cart/Index.vue       # 购物车页
│       ├── order/Confirm.vue    # 订单确认页
│       ├── order/List.vue       # 订单列表页
│       ├── order/Detail.vue     # 订单详情页
│       └── user/Index.vue       # 个人中心页
```

#### 3.2 页面功能清单

| 页面 | 路径 | 功能 | 状态 |
|------|------|------|------|
| 首页 | `/home` | 轮播图、分类导航、热门商品推荐 | ✅ 已实现 |
| 登录 | `/login` | 验证码登录 | ✅ 已实现 |
| 注册 | `/register` | 用户注册 | ✅ 已实现 |
| 商品列表 | `/product/list` | 分类筛选、分页展示商品 | ✅ 已实现 |
| 商品详情 | `/product/:id` | 商品信息展示、SKU选择、加购/立即购买 | ✅ 已实现 |
| 购物车 | `/cart` | 商品列表、数量修改、选中/删除、去结算 | ✅ 已实现 |
| 订单确认 | `/order/confirm` | 收货地址表单、商品清单、提交订单 | ✅ 已实现 |
| 订单列表 | `/order/list` | 分页展示、按状态筛选、点击跳转详情 | ✅ 已实现 |
| 订单详情 | `/order/detail/:id` | 订单信息、商品清单、时间线、支付/确认收货 | ✅ 已实现 |
| 个人中心 | `/user` | 用户信息展示 | ✅ 已实现 |

#### 3.3 API 接口清单（用户端）

| 接口路径 | 方法 | 功能 | 认证 |
|----------|------|------|------|
| `/user/checkCode` | GET | 获取验证码 | ❌ |
| `/user/register` | POST | 用户注册 | ❌ |
| `/user/login` | POST | 用户登录 | ❌ |
| `/user/logout` | POST | 退出登录 | ✅ |
| `/user/info` | GET | 获取用户信息 | ✅ |
| `/user/info` | PUT | 更新个人信息 | ✅ |
| `/user/password` | PUT | 修改密码 | ✅ |
| `/banner/list` | GET | 获取轮播图列表 | ❌ |
| `/category/tree` | GET | 获取分类树 | ❌ |
| `/brand/enabled` | GET | 获取启用品牌 | ❌ |
| `/product/list` | GET | 商品列表（分页） | ❌ |
| `/product/{productId}` | GET | 商品详情 | ❌ |
| `/cart` | GET | 获取购物车列表 | ✅ |
| `/cart/add` | POST | 添加购物车 | ✅ |
| `/cart/{cartId}/quantity` | PUT | 更新数量 | ✅ |
| `/cart/{cartId}/selected` | PUT | 更新选中状态 | ✅ |
| `/cart/selected/batch` | PUT | 批量更新选中 | ✅ |
| `/cart/{cartId}` | DELETE | 删除购物车项 | ✅ |
| `/cart/batch` | DELETE | 批量删除 | ✅ |
| `/cart/clear` | DELETE | 清空购物车 | ✅ |
| `/order/my` | GET | 我的订单列表 | ✅ |
| `/order/{orderId}` | GET | 订单详情 | ✅ |
| `/order` | POST | 创建订单 | ✅ |
| `/order/{orderId}/pay` | PUT | 支付订单 | ✅ |
| `/order/{orderId}/confirm` | PUT | 确认收货 | ✅ |
| `/order/{orderId}/cancel` | PUT | 取消订单 | ✅ |
| `/api/upload/avatar` | POST | 上传头像 | ✅ |
| `/api/upload/review` | POST | 上传评价图片 | ✅ |

### 4. 前端架构（`easymall-admin-web/` 管理端）

#### 4.1 目录结构

```
easymall-admin-web/
├── index.html
├── package.json
├── vite.config.ts               # Vite 配置（代理 /api → localhost:6061）
├── src/
│   ├── main.ts                  # 入口文件
│   ├── App.vue                  # 根组件
│   ├── api/                     # API 调用层
│   │   ├── auth.ts              # 管理员认证 API
│   │   ├── banner.ts            # 轮播图管理 API
│   │   ├── brand.ts             # 品牌管理 API
│   │   ├── category.ts          # 分类管理 API
│   │   ├── order.ts             # 订单管理 API
│   │   ├── product.ts           # 商品管理 API
│   │   ├── statistics.ts        # 数据统计 API
│   │   └── user.ts              # 用户管理 API
│   ├── components/
│   │   └── Layout/
│   │       ├── Index.vue        # 管理端布局容器
│   │       ├── Header.vue       # 管理端顶部导航
│   │       └── Sidebar.vue      # 管理端侧边栏菜单
│   ├── router/
│   │   └── index.ts             # 路由配置（含路由守卫）
│   ├── stores/
│   │   └── user.ts              # Pinia 用户 Store（Token 管理）
│   ├── utils/
│   │   └── request.ts           # Axios 封装
│   └── views/                   # 页面组件
│       ├── login/Login.vue      # 管理端登录页
│       ├── dashboard/Dashboard.vue  # 数据看板（含 ECharts 图表）
│       ├── category/Category.vue    # 分类管理（树形拖拽）
│       ├── brand/Brand.vue      # 品牌管理
│       ├── product/Product.vue  # 商品管理
│       ├── order/Order.vue      # 订单管理
│       ├── user/User.vue        # 用户管理
│       ├── banner/Banner.vue    # 轮播图管理
│       └── profile/Profile.vue  # 个人中心
```

#### 4.2 页面功能清单

| 页面 | 路径 | 功能 | 状态 |
|------|------|------|------|
| 管理端登录 | `/login` | 管理员验证码登录 | ✅ 已实现 |
| 数据看板 | `/dashboard` | 用户数/订单数/销售额统计、销售趋势图、热销商品排行 | ✅ 已实现 |
| 分类管理 | `/category` | 分类树形展示、新增/编辑/删除/拖拽移动、批量排序 | ✅ 已实现 |
| 品牌管理 | `/brand` | 品牌 CRUD、批量排序 | ✅ 已实现 |
| 商品管理 | `/product` | 商品 CRUD、SKU管理、上下架 | ✅ 已实现 |
| 订单管理 | `/order` | 订单列表、详情、发货、取消、备注 | ✅ 已实现 |
| 用户管理 | `/user` | 用户列表、状态禁用/启用、密码重置、逻辑删除/恢复 | ✅ 已实现 |
| 轮播图管理 | `/banner` | 轮播图 CRUD、状态切换 | ✅ 已实现 |
| 个人中心 | `/profile` | 管理员信息、修改密码 | ✅ 已实现 |

#### 4.3 API 接口清单（管理端）

| 接口路径 | 方法 | 功能 | 认证 |
|----------|------|------|------|
| `/admin/account/checkCode` | GET | 获取验证码 | ❌ |
| `/admin/account/login` | POST | 管理员登录 | ❌ |
| `/admin/account/logout` | POST | 管理员登出 | ✅ |
| `/admin/account/info` | GET | 获取管理员信息 | ✅ |
| `/admin/account/password` | PUT | 修改密码 | ✅ |
| `/admin/user/list` | GET | 用户列表 | ✅ |
| `/admin/user/{userId}` | GET | 用户详情 | ✅ |
| `/admin/user/{userId}/status` | PUT | 更新用户状态 | ✅ |
| `/admin/user/{userId}/reset-password` | PUT | 重置密码 | ✅ |
| `/admin/user/{userId}` | DELETE | 删除用户（逻辑） | ✅ |
| `/admin/user/{userId}/restore` | PUT | 恢复用户 | ✅ |
| `/admin/user/deleted` | GET | 已删除用户列表 | ✅ |
| `/admin/product` | GET | 商品列表 | ✅ |
| `/admin/product/{productId}` | GET | 商品详情 | ✅ |
| `/admin/product` | POST | 新增商品 | ✅ |
| `/admin/product/{productId}` | PUT | 更新商品 | ✅ |
| `/admin/product/{productId}/status` | PUT | 更新商品状态 | ✅ |
| `/admin/product/{productId}` | DELETE | 删除商品 | ✅ |
| `/admin/category/tree` | GET | 分类树 | ✅ |
| `/admin/category/list` | GET | 分类列表 | ✅ |
| `/admin/category/{categoryId}` | GET | 分类详情/路径 | ✅ |
| `/admin/category/{categoryId}` | DELETE | 删除分类 | ✅ |
| `/admin/category/batch` | DELETE | 批量删除 | ✅ |
| `/admin/category/sort/batch` | PUT | 批量排序 | ✅ |
| `/admin/category/move` | PUT | 移动分类 | ✅ |
| `/admin/brand` | GET | 品牌列表 | ✅ |
| `/admin/brand` | POST | 新增品牌 | ✅ |
| `/admin/brand/{brandId}` | GET/PUT/DELETE | 品牌 CRUD | ✅ |
| `/admin/brand/batch` | DELETE | 批量删除品牌 | ✅ |
| `/admin/brand/sort/batch` | PUT | 批量排序品牌 | ✅ |
| `/admin/order/list` | GET | 订单列表 | ✅ |
| `/admin/order/{orderId}` | GET | 订单详情 | ✅ |
| `/admin/order/{orderId}/ship` | PUT | 发货 | ✅ |
| `/admin/order/{orderId}/cancel` | PUT | 取消订单 | ✅ |
| `/admin/order/{orderId}/remark` | PUT | 更新备注 | ✅ |
| `/admin/order/{orderId}` | DELETE | 删除订单 | ✅ |
| `/admin/banner/list` | GET | 轮播图列表 | ✅ |
| `/admin/banner/add` | POST | 新增轮播图 | ✅ |
| `/admin/banner/update` | PUT | 更新轮播图 | ✅ |
| `/admin/banner/delete/{id}` | DELETE | 删除轮播图 | ✅ |
| `/admin/banner/status/{id}` | PUT | 更新轮播图状态 | ✅ |
| `/admin/statistics/dashboard` | GET | 看板核心数据 | ✅ |
| `/admin/statistics/trend` | GET | 近7天销售趋势 | ✅ |
| `/admin/statistics/hot-products` | GET | 热销商品排行 | ✅ |
| `/admin/upload/brand` | POST | 上传品牌图片 | ✅ |
| `/admin/upload/product` | POST | 上传商品图片 | ✅ |
| `/admin/upload/avatar` | POST | 上传头像 | ✅ |
| `/admin/upload/banner` | POST | 上传轮播图 | ✅ |

### 5. 技术栈详情

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端框架 | Spring Boot | 3.2.10 |
| Java | JDK | 17 |
| ORM | MyBatis + mybatis-spring | 3.0.3 |
| 数据库 | MySQL | 8.3.0+ |
| 缓存 | Redis | （通过 Spring Data Redis） |
| 数据库连接池 | HikariCP | Spring Boot 默认 |
| 验证码 | easy-captcha (com.wf.captcha.ArithmeticCaptcha) | （包含在依赖中） |
| AI/MCP | Spring AI + MCP | 1.1.2 |
| 用户前端框架 | Vue 3 + Composition API | ^3.5.31 |
| 用户前端UI库 | Element Plus | ^2.13.7 |
| 用户前端状态管理 | Pinia | ^3.0.4 |
| 用户前端路由 | Vue Router | ^5.0.4 |
| 用户前端构建 | Vite | ^8.0.3 |
| 用户前端HTTP | Axios | ^1.15.0 |
| 用户前端语言 | TypeScript | ~6.0.0 |
| 管理前端框架 | Vue 3 + Composition API | ^3.5.31 |
| 管理前端UI库 | Element Plus | ^2.13.6 |
| 管理前端图表 | ECharts | ^6.0.0 |
| 管理前端拖拽 | SortableJS | ^1.15.7 |
| 管理前端构建 | Vite | ^8.0.3 |

### 6. 配置文件说明

#### 6.1 后端 `easymall-web/src/main/resources/application.yml`

```yaml
server:
  port: 6050                    # 用户端后端端口
  servlet.context-path: /api    # API 前缀
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/easymall    # MySQL 连接
    username: root
    password: root
  data:
    redis:
      host: 127.0.0.1
      port: 6379
  autoconfigure:
    exclude:
      - SecurityAutoConfiguration
      - Mcp Sse/Streamable 自动配置
app:
  admin-account: admin          # 默认管理员账号（仅初始化参考）
  admin-password: 123456
upload:
  path: ${user.dir}/easymall-uploads  # 文件上传根目录
```

#### 6.2 后端 `easymall-admin/src/main/resources/application.yml`

```yaml
server:
  port: 6061                    # 管理端后端端口
  servlet.context-path: /api    # API 前缀
spring:
  datasource:                   # 与用户端相同的数据库
    url: jdbc:mysql://localhost:3306/easymall
    username: root
    password: root
  data:
    redis:
      host: 127.0.0.1
      port: 6379
  servlet.multipart:
    max-file-size: 5MB
    max-request-size: 10MB
admin:
  account: admin                # 默认管理员账号
  password: admin123
upload:
  path: ${user.dir}/easymall-uploads
```

#### 6.3 用户前端 `vite.config.ts`

```typescript
server:
  port: 5174                    # 用户前端开发端口
  proxy:
    '/api':
      target: 'http://localhost:6050'
      changeOrigin: true
```

#### 6.4 管理前端 `vite.config.ts`

```typescript
server:
  proxy:
    '/api':
      target: 'http://localhost:6061'
      changeOrigin: true
    '/admin':
      target: 'http://localhost:6061'
      changeOrigin: true
```

#### 6.5 认证方式

- **用户端**：登录成功后返回 token（UUID 字符串），前端保存在 `localStorage['token']`，后续请求通过 `Authorization: Bearer {token}` 传递
- **管理端**：同上，token 保存在 `localStorage['token']`
- **Token 存储**：Redis key 模式 `easymall:user:token:{token}` → userId，有效期 24 小时
- **验证码**：算术验证码（ArithmeticCaptcha），结果为整数，Redis key 模式 `easymall:checkCode:{key}`，有效期 10 分钟

### 7. 已实现功能模块汇总

| 模块 | 用户端 | 管理端 | 说明 |
|------|--------|--------|------|
| 商品浏览/管理 | ✅ | ✅ | 用户端：列表+详情+SKU选择；管理端：CRUD+上下架 |
| 购物车 | ✅ | - | 加购、数量修改、选中/取消、删除、清空 |
| 订单 | ✅ | ✅ | 用户端：创建+列表+详情+支付+确认收货；管理端：列表+详情+发货+取消+备注 |
| 支付 | ✅ | - | 模拟支付（直接更新状态） |
| 用户管理 | ✅ | ✅ | 用户端：注册+登录+信息修改+密码修改；管理端：列表+状态+重置密码+删除/恢复 |
| 分类管理 | ✅ | ✅ | 用户端：树形查询；管理端：CRUD+树形拖拽移动+批量排序 |
| 品牌管理 | ✅ | ✅ | 用户端：启用品牌查询；管理端：CRUD+批量排序 |
| 轮播图 | ✅ | ✅ | 用户端：启用列表查询；管理端：CRUD+状态切换 |
| 数据看板 | - | ✅ | 核心数据统计+销售趋势图+热销排行 |
| 文件上传 | ✅ | ✅ | 用户端：头像+评价图片；管理端：品牌/商品/头像/轮播图 |

### 8. 待开发/待完善功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 售后服务 | 中 | 售后申请、退款流程（状态5已定义但未实现） |
| 物流追踪 | 中 | 管理端已支持发货填写物流信息，但用户端未展示物流轨迹 |
| 商品评价 | 中 | 已完成订单后可评价商品（API已预设上传评价图片接口） |
| 收藏/关注 | 低 | 商品收藏功能 |
| 优惠券/促销 | 低 | 营销活动支持 |
| 搜索功能增强 | 中 | 目前仅支持简单关键字搜索，未集成 Elasticsearch 全文检索 |
| 支付网关对接 | 中 | 目前为模拟支付，需对接微信/支付宝 |
| 权限管理（RBAC） | 低 | 管理端仅支持单一管理员，无角色权限细分 |
| 多语言/国际化 | 低 | 目前仅支持中文 |
| 单元测试覆盖 | 中 | 后端缺少单元测试和集成测试 |

---

> **文档版本**：v1.0
> **生成日期**：2026-06-25
> **生成方式**：基于代码库自动扫描生成
