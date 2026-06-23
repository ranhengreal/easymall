<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>EasyMall</h1>
        <p>欢迎回来，请登录您的账号</p>
      </div>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
          class="login-form"
      >
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
              clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
          />
        </el-form-item>

        <el-form-item prop="checkCode">
          <div class="captcha-wrapper">
            <el-input
                v-model="loginForm.checkCode"
                placeholder="请输入验证码"
                prefix-icon="Key"
                size="large"
                clearable
            />
            <img
                :src="captchaUrl"
                alt="验证码"
                class="captcha-img"
                @click="refreshCaptcha"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <span>还没有账号？</span>
          <el-link type="primary" @click="goRegister">立即注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCheckCode, login } from '@/api/auth'
import type { LoginParams } from '@/api/auth'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const captchaUrl = ref('')
const captchaKey = ref('')

const loginForm = reactive<LoginParams>({
  username: '',
  password: '',
  checkCode: '',
  checkCodeKey: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
  ],
  checkCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
    // 删除长度限制
  ]
}

// 刷新验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCheckCode()
    captchaUrl.value = res.checkCode
    captchaKey.value = res.checkCodeKey
    loginForm.checkCodeKey = res.checkCodeKey
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const token = await login(loginForm)
    localStorage.setItem('token', token)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error?.message || '登录失败')
    refreshCaptcha()
    loginForm.checkCode = ''
  } finally {
    loading.value = false
  }
}

// 跳转注册
const goRegister = () => {
  router.push('/register')
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
}

.login-card {
  width: 420px;
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 8px;
}

.login-header p {
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 8px 15px;
}

.captcha-wrapper {
  display: flex;
  gap: 12px;
}

.captcha-wrapper .el-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 40px;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.login-btn {
  width: 100%;
  border-radius: 8px;
  margin-top: 8px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}

.login-footer .el-link {
  margin-left: 5px;
}
</style>