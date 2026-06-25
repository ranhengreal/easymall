-- ============================================
-- EasyMall 演示数据初始化脚本
-- 使用 INSERT IGNORE 避免重复插入
-- ============================================

-- ============================================
-- 1. 商品分类
-- ============================================
INSERT IGNORE INTO category (category_id, category_name, p_category_id, sort) VALUES
('C001', '电子产品',   '0',  1),
('C002', '服装鞋包',   '0',  2),
('C003', '家居生活',   '0',  3),
('C004', '手机通讯',   'C001', 1),
('C005', '电脑办公',   'C001', 2),
('C006', '智能穿戴',   'C001', 3);

-- ============================================
-- 2. 品牌
-- ============================================
INSERT IGNORE INTO brand (brand_id, brand_name, brand_logo, description, sort, status, create_time, update_time) VALUES
('B001', '华为',     '', '全球领先的信息与通信技术解决方案供应商',     1, 1, NOW(), NOW()),
('B002', '小米',     '', '专注于智能硬件和电子产品研发的互联网公司',     2, 1, NOW(), NOW()),
('B003', '苹果',     '', '全球知名的科技公司，以iPhone和Mac闻名',      3, 1, NOW(), NOW()),
('B004', '三星',     '', '韩国最大的电子工业企业',                     4, 1, NOW(), NOW()),
('B005', '联想',     '', '全球最大的PC制造商之一',                     5, 1, NOW(), NOW()),
('B006', '戴尔',     '', '全球领先的计算机系统提供商',                 6, 1, NOW(), NOW()),
('B007', 'OPPO',     '', '全球领先的智能设备制造商',                   7, 1, NOW(), NOW()),
('B008', 'vivo',     '', '专业智能手机品牌',                           8, 1, NOW(), NOW());

-- ============================================
-- 3. 商品（含 SKU）
-- ============================================

-- 3.1 华为 P60 Pro（手机通讯 - 含颜色规格）
INSERT IGNORE INTO product (product_id, product_name, category_id, brand_id, main_image, images, description, price, stock, sales, status, create_time, update_time) VALUES
('P000001', '华为 P60 Pro', 'C004', 'B001',
 'https://picsum.photos/seed/p60pro/400/400',
 '["https://picsum.photos/seed/p60pro1/400/400","https://picsum.photos/seed/p60pro2/400/400"]',
 '超聚光影像旗舰，搭载骁龙8+芯片，支持双向北斗卫星消息。',
 5999.00, 100, 0, 1, NOW(), NOW());

INSERT IGNORE INTO product_sku (sku_id, product_id, spec_values, price, stock, image) VALUES
('SKU00001', 'P000001', '颜色:羽砂黑,存储:256GB', 5999.00, 40, 'https://picsum.photos/seed/p60black/200/200'),
('SKU00002', 'P000001', '颜色:羽砂黑,存储:512GB', 6999.00, 30, 'https://picsum.photos/seed/p60black/200/200'),
('SKU00003', 'P000001', '颜色:洛可可白,存储:256GB', 5999.00, 30, 'https://picsum.photos/seed/p60white/200/200');

-- 3.2 小米 13 Ultra（手机通讯 - 含颜色规格）
INSERT IGNORE INTO product (product_id, product_name, category_id, brand_id, main_image, images, description, price, stock, sales, status, create_time, update_time) VALUES
('P000002', '小米 13 Ultra', 'C004', 'B002',
 'https://picsum.photos/seed/mi13u/400/400',
 '["https://picsum.photos/seed/mi13u1/400/400","https://picsum.photos/seed/mi13u2/400/400"]',
 '徕卡光学镜头，一英寸大底，骁龙8 Gen2旗舰芯片。',
 5999.00, 80, 0, 1, NOW(), NOW());

INSERT IGNORE INTO product_sku (sku_id, product_id, spec_values, price, stock, image) VALUES
('SKU00004', 'P000002', '颜色:黑色,存储:256GB', 5999.00, 30, 'https://picsum.photos/seed/mi13black/200/200'),
('SKU00005', 'P000002', '颜色:黑色,存储:512GB', 6499.00, 25, 'https://picsum.photos/seed/mi13black/200/200'),
('SKU00006', 'P000002', '颜色:白色,存储:256GB', 5999.00, 25, 'https://picsum.photos/seed/mi13white/200/200');

-- 3.3 iPhone 14 Pro（手机通讯 - 含颜色/存储规格）
INSERT IGNORE INTO product (product_id, product_name, category_id, brand_id, main_image, images, description, price, stock, sales, status, create_time, update_time) VALUES
('P000003', 'iPhone 14 Pro', 'C004', 'B003',
 'https://picsum.photos/seed/iphone14p/400/400',
 '["https://picsum.photos/seed/iphone14p1/400/400","https://picsum.photos/seed/iphone14p2/400/400"]',
 'A16仿生芯片，灵动岛设计，4800万像素主摄。',
 6999.00, 60, 0, 1, NOW(), NOW());

INSERT IGNORE INTO product_sku (sku_id, product_id, spec_values, price, stock, image) VALUES
('SKU00007', 'P000003', '颜色:深空黑,存储:256GB', 6999.00, 20, 'https://picsum.photos/seed/iphone14black/200/200'),
('SKU00008', 'P000003', '颜色:深空黑,存储:512GB', 8499.00, 20, 'https://picsum.photos/seed/iphone14black/200/200'),
('SKU00009', 'P000003', '颜色:银色,存储:256GB', 6999.00, 20, 'https://picsum.photos/seed/iphone14silver/200/200');

-- 3.4 联想 ThinkPad X1 Carbon（电脑办公）
INSERT IGNORE INTO product (product_id, product_name, category_id, brand_id, main_image, images, description, price, stock, sales, status, create_time, update_time) VALUES
('P000004', '联想 ThinkPad X1 Carbon', 'C005', 'B005',
 'https://picsum.photos/seed/x1carbon/400/400',
 '["https://picsum.photos/seed/x1carbon1/400/400"]',
 '第13代酷睿i7处理器，14英寸2.8K OLED屏，轻薄商务旗舰。',
 12999.00, 30, 0, 1, NOW(), NOW());

INSERT IGNORE INTO product_sku (sku_id, product_id, spec_values, price, stock, image) VALUES
('SKU00010', 'P000004', '内存:16GB,存储:512GB', 12999.00, 15, 'https://picsum.photos/seed/x1c16/200/200'),
('SKU00011', 'P000004', '内存:32GB,存储:1TB',  14999.00, 15, 'https://picsum.photos/seed/x1c32/200/200');

-- 3.5 华为 MatePad Pro（电脑办公 - 平板）
INSERT IGNORE INTO product (product_id, product_name, category_id, brand_id, main_image, images, description, price, stock, sales, status, create_time, update_time) VALUES
('P000005', '华为 MatePad Pro 13.2', 'C005', 'B001',
 'https://picsum.photos/seed/matepad/400/400',
 '["https://picsum.photos/seed/matepad1/400/400"]',
 '13.2英寸OLED柔性屏，星闪连接，天生会画。',
 4999.00, 50, 0, 1, NOW(), NOW());

INSERT IGNORE INTO product_sku (sku_id, product_id, spec_values, price, stock, image) VALUES
('SKU00012', 'P000005', '颜色:曜金黑,存储:256GB', 4999.00, 25, 'https://picsum.photos/seed/matepadblack/200/200'),
('SKU00013', 'P000005', '颜色:晶钻白,存储:512GB', 5699.00, 25, 'https://picsum.photos/seed/matepadwhite/200/200');

-- 3.6 OPPO Find X6 Pro（手机通讯）
INSERT IGNORE INTO product (product_id, product_name, category_id, brand_id, main_image, images, description, price, stock, sales, status, create_time, update_time) VALUES
('P000006', 'OPPO Find X6 Pro', 'C004', 'B007',
 'https://picsum.photos/seed/findx6/400/400',
 '["https://picsum.photos/seed/findx61/400/400"]',
 '超光影三主摄，马里亚纳X影像芯片，骁龙8 Gen2。',
 4999.00, 70, 0, 1, NOW(), NOW());

INSERT IGNORE INTO product_sku (sku_id, product_id, spec_values, price, stock, image) VALUES
('SKU00014', 'P000006', '颜色:大漠银月,存储:256GB', 4999.00, 35, 'https://picsum.photos/seed/findx6silver/200/200'),
('SKU00015', 'P000006', '颜色:云墨黑,存储:256GB',   4999.00, 35, 'https://picsum.photos/seed/findx6black/200/200');

-- ============================================
-- 4. 轮播图
-- ============================================
INSERT IGNORE INTO banner (title, image_url, link_url, sort, status) VALUES
('春季新品首发',  'https://picsum.photos/seed/banner1/1200/400', '/product/list',        1, 1),
('限时特惠7折起', 'https://picsum.photos/seed/banner2/1200/400', '/product/P000001',     2, 1),
('新品上市',      'https://picsum.photos/seed/banner3/1200/400', '/product/P000002',     3, 1),
('品牌日大促',    'https://picsum.photos/seed/banner4/1200/400', '/product/list',        4, 1);

-- ============================================
-- 5. 测试用户
-- ============================================
-- 注意：密码使用 BCrypt 加密，此处为明文演示用
-- 实际密码 "Test123456" 的 BCrypt 哈希
INSERT IGNORE INTO user (user_id, username, password, nickname, phone, email, gender, status, is_deleted, create_time) VALUES
('U000001', 'testuser', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 '测试用户', '13800000001', 'test@easymall.com', 1, 1, 0, NOW());
