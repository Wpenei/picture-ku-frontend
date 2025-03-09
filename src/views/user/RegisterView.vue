<template>
  <div id="RegisterView">
    <h2 class="title">共享云图库 - 用户注册</h2>
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

      <!--  记住密码 && 忘记密码-->
      <!--      <a-form-item>
              <a-form-item name="remember" no-style>
                <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
              </a-form-item>
              <a class="forgot" href="">忘记密码</a>
            </a-form-item>-->

      <a-form-item>
        <div class="tips">
          已有账号?
          <RouterLink to="/user/login">去登录</RouterLink>
        </div>
        <a-button type="primary" html-type="submit" style="width: 100%"> 注册 </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive, computed } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userRegisterUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import router from '@/router'

// 接收表单输入的值(注册账号,密码)
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

// 获取全局状态
const loginUserStore = useLoginUserStore()
// 提交表单
const handleSubmit = async (values: any) => {
  if (values.checkPassword !== values.userPassword){
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
