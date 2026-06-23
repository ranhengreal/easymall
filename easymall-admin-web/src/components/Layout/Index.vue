<template>
  <el-container class="layout-container">
    <el-aside :width="sidebarWidth" class="aside">
      <Sidebar />
    </el-aside>

    <el-container>
      <el-header class="header">
        <Header />
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const isCollapsed = ref(false)
const sidebarWidth = ref('220px')

const handleSidebarToggle = (event: CustomEvent) => {
  isCollapsed.value = event.detail.collapsed
  sidebarWidth.value = isCollapsed.value ? '64px' : '220px'
}

onMounted(() => {
  window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  transition: width 0.3s ease;
  overflow-x: hidden;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.main {
  background-color: #f0f2f6;
  padding: 20px;
  overflow-y: auto;
}
</style>