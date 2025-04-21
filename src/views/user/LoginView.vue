<template>
  <div id="loginView">
    <div class="content">
      <div class="form-container">
        <h2 class="title">共享云图库 - 用户登录</h2>
        <div class="desc">智能协同云图库</div>
        <a-form
          :model="formState"
          name="normal_login"
          autocomplete="off"
          class="login-form"
          @finish="handleSubmit"
        >
          <a-form-item name="email" :rules="[{ required: true, message: '邮箱不能为空!' }]">
            <a-input v-model:value="formState.email" placeholder="请输入邮箱">
              <template #prefix>
                <UserOutlined class="site-form-item-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="userPassword"
            :rules="[
              { required: true, message: '密码不能为空!' },
              { min: 8, message: '密码不能小于8位' },
            ]"
          >
            <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码">
              <template #prefix>
                <LockOutlined class="site-form-item-icon" />
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item
            name="inputVerifyCode"
            :rules="[{ required: true, message: '验证码不能为空!' }]"
          >
            <a-row>
              <a-col :span="16">
                <a-input v-model:value="formState.inputVerifyCode" placeholder="请输入验证码">
                  <template #prefix>
                    <LockOutlined class="site-form-item-icon" />
                  </template>
                </a-input>
              </a-col>
              <a-col :span="8">
                <img
                  :src="captchaImage"
                  alt="验证码"
                  @click="fetchCaptcha"
                  style="cursor: pointer; height: 32px; width: 100%; padding-left: 16px"
                />
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item>
            <div class="tips">
              没有账号?
              <RouterLink to="/user/register">去注册</RouterLink>
            </div>
            <a-button :disabled="disabled" type="primary" html-type="submit" style="width: 100%">
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
<!--  <div class="image-container">-->
<!--    <img-->
<!--      src="https://pic2.zhimg.com/v2-60c254dd8ebe57779d3ba359ff1fc321_r.jpg?source=1940ef5c"-->
<!--      alt="登录图片"-->
<!--      class="login-image"-->
<!--      style="width: 100%"-->
<!--    />-->
<!--  </div>-->
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userLoginUsingPost, getLoginCaptchaUsingGet } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import router from '@/router'

// 接收表单输入的值(登录账号,密码,验证码，验证码id)
const formState = reactive<API.UserLoginRequest>({
  email: '',
  userPassword: '',
  inputVerifyCode: '',
  serverVerifyCode: '',
})

// 获取全局状态
const loginUserStore = useLoginUserStore()

// 定义captchaImage用于存储验证码图片的Base64编码
const captchaImage = ref('')

// 获取验证码
const fetchCaptcha = async () => {
  const res = await getLoginCaptchaUsingGet()
  if (res.data.code === 0 && res.data.data) {
    captchaImage.value = `data:image/png;base64,${res.data.data.base64Captcha}`
    formState.serverVerifyCode = res.data.data.encryptedCaptcha
  } else {
    message.error('获取验证码失败,' + res.data.message)
  }
}

// 在页面加载时获取验证码
fetchCaptcha()

const disabled = computed(() => {
  return !(formState.email && formState.userPassword && formState.inputVerifyCode)
})
// 提交表单
const handleSubmit = async (values: any) => {
  console.log('Server Verify Code:', formState.serverVerifyCode)
  const loginData = {
    ...values,
    serverVerifyCode: formState.serverVerifyCode,
  }
  const res = await userLoginUsingPost(loginData)
  // 登录成功,将登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败,' + res.data.message)
  }
}
</script>
<style scoped>
#loginView {
  /* 原有样式保留 */
  max-width: 400px;
  margin: 0 auto;
  padding: 32px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
  color: #333;
}

.desc {
  font-size: 16px;
  text-align: center;
  margin-bottom: 16px;
  color: #666;
}

.login-form {
  padding: 24px;
}

.a-form-item {
  margin-bottom: 16px;
}

.a-button {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
  font-weight: bold;
}

.a-button:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.tips {
  color: #bbb;
  font-size: 13px;
  margin-bottom: 16px;
  float: right;
}
</style>
