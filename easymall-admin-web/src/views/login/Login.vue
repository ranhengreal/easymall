<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>EasyMall 管理后台</h2>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入管理员账号" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" placeholder="请输入密码" show-password />
        </el-form-item>
        
        <el-form-item label="验证码" prop="checkCode">
          <div class="captcha-wrapper">
            <el-input v-model="form.checkCode" placeholder="请输入验证码" style="width: 150px" />
            <img :src="captchaImage" class="captcha-img" @click="refreshCaptcha" />
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCheckCode, login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const captchaImage = ref('')
const checkCodeKey = ref('')

const form = reactive({
  account: '',
  password: '',
  checkCode: ''
})

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const refreshCaptcha = async () => {
  const res = await getCheckCode()
  checkCodeKey.value = res.checkCodeKey
  captchaImage.value = res.checkCode
}

const handleLogin = async () => {
  await formRef.value.validate()
  
  loading.value = true
  try {
    const token = await login({
      account: form.account,
      password: form.password,
      checkCode: form.checkCode,
      checkCodeKey: checkCodeKey.value
    })
    
    userStore.setToken(token)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    refreshCaptcha()
    form.checkCode = ''
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 450px;
}

.card-header {
  text-align: center;
}

.captcha-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-img {
  height: 32px;
  cursor: pointer;
}
</style>
