<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-links">
          <div class="link-group">
            <h4>关于我们</h4>
            <a href="#">公司简介</a>
            <a href="#">联系我们</a>
            <a href="#">加入我们</a>
          </div>
          <div class="link-group">
            <h4>客户服务</h4>
            <a href="#">帮助中心</a>
            <a href="#">退换货政策</a>
            <a href="#">配送说明</a>
          </div>
          <div class="link-group">
            <h4>关注我们</h4>
            <a href="#">官方微博</a>
            <a href="#">微信公众号</a>
          </div>
        </div>
        <div class="footer-copyright">
          <p>© 2026 EasyMall 版权所有</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  margin-top: 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.footer-links {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.link-group h4 {
  font-size: 16px;
  margin-bottom: 5px;
  color: #ffd700;
}

.link-group a {
  color: #bdc3c7;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.link-group a:hover {
  color: #ff6b6b;
}

.footer-copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #34495e;
  font-size: 12px;
  color: #bdc3c7;
}
</style>