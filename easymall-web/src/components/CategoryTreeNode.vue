<template>
  <div class="category-node">
    <div
        class="category-item"
        :class="{ active: currentCategoryId === category.categoryId }"
        @click="$emit('select', category.categoryId)"
    >
      <span>{{ category.categoryName }}</span>
      <span class="count" v-if="category.children && category.children.length">
        ({{ category.children.length }})
      </span>
    </div>
    <div v-if="category.children && category.children.length" class="category-children">
      <CategoryTreeNode
          v-for="child in category.children"
          :key="child.categoryId"
          :category="child"
          :current-category-id="currentCategoryId"
          @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@/api/category'

defineProps<{
  category: Category
  currentCategoryId: string
}>()

defineEmits<{
  (e: 'select', categoryId: string): void
}>()
</script>

<style scoped>
.category-node {
  width: 100%;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
  font-size: 14px;
  color: #666;
}

.category-item:hover {
  background-color: #f0f7ff;
  color: #409eff;
}

.category-item.active {
  background-color: #409eff;
  color: white;
}

.category-item .count {
  font-size: 12px;
  color: #999;
}

.category-item.active .count {
  color: rgba(255, 255, 255, 0.8);
}

.category-children {
  padding-left: 20px;
}
</style>