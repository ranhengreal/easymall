<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>EasyMall</h1>
        <p>注册新账号</p>
      </div>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="0"
          class="register-form"
      >
        <el-form-item prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名（3-20个字符）"
              prefix-icon="User"
              size="large"
              clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（6-20个字符）"
              prefix-icon="Lock"
              size="large"
              show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="Lock"
              size="large"
              show-password
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Phone"
              size="large"
              clearable
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
              size="large"
              clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              class="register-btn"
              :loading="loading"
              @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <el-link type="primary" @click="goLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '@/api/auth'
import type { RegisterParams } from '@/api/auth'

const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive<RegisterParams>({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: ''
})

// 自定义确认密码验证
const validateConfirmPassword = (_rule: any, value: string, callback: Function) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 自定义手机号验证
const validatePhone = (_rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 自定义邮箱验证
const validateEmail = (_rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ]
}

// 注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await register(registerForm)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error?.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 跳转登录
const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
}

.register-card {
  width: 460px;
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h1 {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 8px;
}

.register-header p {
  color: #909399;
  font-size: 14px;
}

.register-form {
  margin-top: 20px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 8px 15px;
}

.register-btn {
  width: 100%;
  border-radius: 8px;
  margin-top: 8px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}

.register-footer .el-link {
  margin-left: 5px;
}
</style>