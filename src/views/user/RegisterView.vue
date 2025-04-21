<template>
  <div id="RegisterView">
    <h2 class="title">共享云图库 - 用户注册</h2>
    <div class="desc">智能协同云图库</div>
    <a-form
      :model="formState"
      name="normal_register"
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

      <a-form-item name="code" :rules="[{ required: true, message: '验证码不能为空!' }]">
        <a-row justify="space-between">
          <a-col :span="14">
            <a-input v-model:value="formState.code" placeholder="请输入验证码">
              <template #prefix>
                <LockOutlined class="site-form-item-icon" />
              </template>
            </a-input>
          </a-col>
          <a-col :span="8" >
            <a-button type="dashed" :disabled="codeDisabled" @click="fetchEmailCode" style="width: 100%">获取验证码</a-button>
          </a-col>
        </a-row>
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
        name="checkPassword"
        :rules="[
          { required: true, message: '确认密码不能为空!' },
          { min: 8, message: '确认密码不能小于8位' },
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <div class="tips">
          已有账号?
          <RouterLink to="/user/login">去登录</RouterLink>
        </div>
        <a-button :disabled="disabled" type="primary" html-type="submit" style="width: 100%"> 注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userRegisterUsingPost, getEmailCodeUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

// 接收表单输入的值(注册账号,密码,验证码)
const formState = reactive<API.UserRegisterRequest & { emailSuffix?: string }>({
  email: '',
  code: '',
  userPassword: '',
  checkPassword: '',
})
// 获取邮箱验证码
const fetchEmailCode = async () => {
  // 添加邮箱格式校验
  if (!formState.email) {
    message.error('邮箱不能为空')
    return
  }
  if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(formState.email)) {
    message.error('邮箱格式不正确')
    return
  }

  try {
    const res = await getEmailCodeUsingPost({
      email: formState.email,
      type: 'register'
    })

    // 添加 1 秒延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (res.data.code === 0) {
      message.success('验证码已发送到您的邮箱')
    } else {
      message.error('获取验证码失败,' + res.data.message)
    }
  } catch (error) {
    message.error('请求异常，请稍后重试')
  }
}
const emailPrefix = ref<string>('')
const emailSuffix = ref<string>('')

const codeDisabled = computed(() => {
  return !(formState.email )
})
const disabled = computed(() => {
  return !(formState.email && formState.userPassword && formState.code && formState.checkPassword)
})

// 提交表单
const handleSubmit = async (values: any) => {
  formState.email = emailPrefix.value + emailSuffix.value
  if (values.checkPassword !== values.userPassword) {
    message.error('两次密码不一致')
    return
  }
  const res = await userRegisterUsingPost(values)
  // 注册成功,跳转到登录页面
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败,' + res.data.message)
  }
}
</script>
<style scoped>
#RegisterView {
  /* 原有样式保留 */
  max-width: 450px;
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
