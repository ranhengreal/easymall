<template>
  <div class="logo">
    <h2 v-show="!isCollapse">EasyMall</h2>
    <h2 v-show="isCollapse">EM</h2>
  </div>

  <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
  >
    <el-menu-item index="/dashboard">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>

    <el-menu-item index="/category">
      <el-icon><Folder /></el-icon>
      <span>分类管理</span>
    </el-menu-item>

    <el-menu-item index="/brand">
      <el-icon><ShoppingCart /></el-icon>
      <span>品牌管理</span>
    </el-menu-item>

    <el-menu-item index="/product">
      <el-icon><Goods /></el-icon>
      <span>商品管理</span>
    </el-menu-item>

    <el-menu-item index="/order">
      <el-icon><Document /></el-icon>
      <span>订单管理</span>
    </el-menu-item>

    <el-menu-item index="/banner">
      <el-icon><Picture /></el-icon>
      <span>轮播图管理</span>
    </el-menu-item>

    <el-menu-item index="/user">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Folder, ShoppingCart, Goods, Document, User, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
const isCollapse = ref(false)

const handleSidebarToggle = (event: CustomEvent) => {
  isCollapse.value = event.detail.collapsed
}

onMounted(() => {
  window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
})
</script>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #263445;
}

.logo h2 {
  font-size: 20px;
  margin: 0;
  transition: all 0.3s;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 60px);
}
</style>