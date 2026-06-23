<template>
  <div class="category-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <!-- 树形拖拽组件 -->
      <div class="tree-wrapper">
        <el-tree
            ref="treeRef"
            :data="categoryTree"
            :props="treeProps"
            node-key="categoryId"
            :expand-on-click-node="false"
            :highlight-current="true"
            :default-expand-all="true"
            draggable
            :allow-drop="allowDrop"
            :allow-drag="allowDrag"
            @node-drop="handleDrop"
            v-loading="loading"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <div class="node-info">
                <el-icon class="node-icon"><Folder /></el-icon>
                <span class="node-name">{{ data.categoryName }}</span>
                <el-tag v-if="!data.pcategoryId || data.pcategoryId === '0'" size="small" type="info">
                  顶级
                </el-tag>
                <el-tag v-else size="small" type="warning">
                  子分类
                </el-tag>
                <span class="node-id">({{ data.categoryId }})</span>
              </div>
              <div class="node-actions">
                <el-button type="primary" link size="small" @click="handleEdit(data)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="danger" link size="small" @click="handleDelete(data)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" destroy-on-close>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName" required>
          <el-input v-model="formData.categoryName" placeholder="请输入分类名称" clearable />
          <div class="form-tip">分类名称将显示在商品分类选择中</div>
        </el-form-item>

        <el-form-item label="父分类" prop="pCategoryId">
          <el-tree-select
              v-model="formData.pCategoryId"
              :data="categoryTree"
              :props="{
              label: 'categoryName',
              value: 'categoryId',
              children: 'children',
              disabled: (data) => isDescendantOrSelf(data, formData.categoryId)
            }"
              placeholder="请选择父分类（不选则为顶级分类）"
              check-strictly
              clearable
              filterable
              default-expand-all
          />
          <div class="form-tip">
            <span>选择父分类后，当前分类将成为子分类</span>
            <span v-if="formData.pCategoryId" class="parent-path">
              → 将移动到：{{ getParentPath(formData.pCategoryId) }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
          <div class="form-tip">数字越小，显示越靠前</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">
          {{ isEdit ? '保存修改' : '立即创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Folder } from '@element-plus/icons-vue'
import { getCategoryTree, addCategory, updateCategory, deleteCategory, moveCategory, batchUpdateSort } from '@/api/category'
import type { Category } from '@/api/category'
import type Node from 'element-plus/es/components/tree/src/model/node'

const loading = ref(false)
const submitLoading = ref(false)
const categoryTree = ref<Category[]>([])
const treeRef = ref()

const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const formRef = ref()
const isEdit = ref(false)

const formData = ref({
  categoryId: '',
  categoryName: '',
  pCategoryId: '',
  sort: 0
})

const rules = {
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const treeProps = {
  children: 'children',
  label: 'categoryName'
}

// 获取父分类的完整路径
const getParentPath = (categoryId: string): string => {
  if (!categoryId) return ''

  const findPath = (list: Category[], targetId: string, path: string[] = []): string[] | null => {
    for (const item of list) {
      if (item.categoryId === targetId) {
        return [...path, item.categoryName]
      }
      if (item.children && item.children.length) {
        const result = findPath(item.children, targetId, [...path, item.categoryName])
        if (result) return result
      }
    }
    return null
  }

  const path = findPath(categoryTree.value, categoryId)
  return path ? path.join(' → ') : ''
}

// 检查是否为自身或子节点（防止循环引用）
const isDescendantOrSelf = (node: Category, targetId: string): boolean => {
  if (!targetId) return false
  if (node.categoryId === targetId) return true
  if (node.children) {
    for (const child of node.children) {
      if (isDescendantOrSelf(child, targetId)) return true
    }
  }
  return false
}

// 获取扁平化的分类列表
const getFlatList = (list: Category[], result: Category[] = []): Category[] => {
  for (const item of list) {
    result.push(item)
    if (item.children && item.children.length) {
      getFlatList(item.children, result)
    }
  }
  return result
}

// 判断是否允许拖拽
const allowDrag = (draggingNode: Node): boolean => {
  // 所有节点都可以拖拽
  return true
}

// 判断是否允许放置
const allowDrop = (draggingNode: Node, dropNode: Node, type: string): boolean => {
  // 不允许拖拽到自己的子节点中
  if (type === 'inner') {
    // 检查是否拖拽到自己的子节点
    const isChild = (parent: Category, child: Category): boolean => {
      if (!parent.children) return false
      for (const item of parent.children) {
        if (item.categoryId === child.categoryId) return true
        if (item.children && isChild(item, child)) return true
      }
      return false
    }
    if (isChild(draggingNode.data, dropNode.data)) {
      return false
    }
  }
  return true
}

// 处理拖拽放置
const handleDrop = async (draggingNode: Node, dropNode: Node, dropType: string) => {
  const draggedData = draggingNode.data as Category
  const targetData = dropNode.data as Category

  if (dropType === 'inner') {
    // 移动到目标节点内部作为子分类
    try {
      await ElMessageBox.confirm(
          `确定将"${draggedData.categoryName}"移动到"${targetData.categoryName}"下吗？`,
          '确认移动',
          { type: 'info', confirmButtonText: '确认', cancelButtonText: '取消' }
      )
      await moveCategory({
        categoryId: draggedData.categoryId,
        targetCategoryId: targetData.categoryId,
        moveType: 'inner'
      })
      ElMessage.success('移动成功')
      await loadData()
    } catch {
      await loadData()
    }
  } else if (dropType === 'before' || dropType === 'after') {
    // 同级排序：调整顺序
    await handleSortChange(draggedData, targetData, dropType)
  }
}

// 处理排序变化
const handleSortChange = async (draggedData: Category, targetData: Category, dropType: string) => {
  // 获取同一父节点下的所有兄弟节点
  const findParent = (list: Category[], childId: string): Category[] | null => {
    for (const item of list) {
      if (item.children && item.children.length) {
        if (item.children.some(c => c.categoryId === childId)) {
          return item.children
        }
        const result = findParent(item.children, childId)
        if (result) return result
      }
    }
    return null
  }

  const siblings = findParent(categoryTree.value, draggedData.categoryId)
  if (!siblings) return

  // 重新计算排序值
  const sortList = siblings.map((item, idx) => ({
    categoryId: item.categoryId,
    sort: idx + 1
  }))

  try {
    await batchUpdateSort(sortList)
    ElMessage.success('排序更新成功')
    await loadData()
  } catch (error) {
    console.error('排序更新失败:', error)
    ElMessage.error('排序更新失败')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    categoryTree.value = await getCategoryTree()
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  formData.value = {
    categoryId: '',
    categoryName: '',
    pCategoryId: '',
    sort: 0
  }
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  formData.value = {
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    pCategoryId: row.pcategoryId === '0' ? '' : row.pcategoryId,
    sort: row.sort
  }
  dialogVisible.value = true
}

const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm(`确定删除分类"${row.categoryName}"吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })
    await deleteCategory(row.categoryId)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const submitForm = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateCategory({
        categoryId: formData.value.categoryId,
        categoryName: formData.value.categoryName,
        pCategoryId: formData.value.pCategoryId || '0',
        sort: formData.value.sort
      })
      ElMessage.success('更新成功')
    } else {
      await addCategory({
        categoryName: formData.value.categoryName,
        pCategoryId: formData.value.pCategoryId || '0',
        sort: formData.value.sort
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('提交失败', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.parent-path {
  color: #409eff;
  margin-left: 8px;
}

.tree-wrapper {
  max-height: 600px;
  overflow-y: auto;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  color: #e6a23c;
}

.node-name {
  font-weight: 500;
}

.node-id {
  color: #909399;
  font-size: 12px;
}

.node-actions {
  display: flex;
  gap: 4px;
}

:deep(.el-tree-node__content) {
  height: 40px;
  padding: 0 8px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree--draggable .el-tree-node__content) {
  cursor: grab;
}

:deep(.el-tree--draggable .el-tree-node__content:active) {
  cursor: grabbing;
}

:deep(.el-dialog__body) {
  padding: 20px 30px;
}
</style>