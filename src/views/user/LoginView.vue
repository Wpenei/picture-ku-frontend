<template>
  <div id="loginView">
    <h2 class="title">共享云图库 - 用户登录</h2>
    <div class="desc">智能协同云图库</div>
    <a-form :model="formState" name="normal_login" autocomplete="off" class="login-form" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '账号不能为空!' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号">
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

      <!--  记住密码 && 忘记密码-->
      <!--      <a-form-item>
              <a-form-item name="remember" no-style>
                <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
              </a-form-item>
              <a class="forgot" href="">忘记密码</a>
            </a-form-item>-->

      <a-form-item>
        <div class="tips">
          没有账号?
          <RouterLink to="/user/register">去注册</RouterLink>
        </div>
        <a-button type="primary" html-type="submit" style="width: 100%"> 登录 </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive, computed } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userLoginUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import router from '@/router'

// 接收表单输入的值(登录账号,密码)
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

// 获取全局状态
const loginUserStore = useLoginUserStore()
// 提交表单
const handleSubmit = async (values: any) => {
  const res = await userLoginUsingPost(values)
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
  max-width: 450px;
  margin: 0 auto;
  padding: 64px;
}

.title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
}

.desc {
  font-size: 16px;
  text-align: center;
  margin-bottom: 16px;
  color: #bbb;
}

.forgot {
  float: right;
}

.tips {
  color: #bbb;
  font-size: 13px;
  margin-bottom: 16px;
  float: right;
}
</style>
