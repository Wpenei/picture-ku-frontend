import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController.ts'

// 一个状态就存储一类要共享的数据(存一类常量)
export const useLoginUserStore = defineStore('loginUser', () => {
  // 定义状态的初始值
  const loginUser = ref<API.LoginUserVO>({
    userName:"未登录"
  })
  // 定义变量的计算逻辑 getter
  async function fetchLoginUser() {
    // 获取登录用户
    const res = await getLoginUserUsingGet();
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data;
    }
    // 假数据, 3秒后模拟登录
    // setTimeout(() => {
    //   loginUser.value = { userName: "TextUser", id: 0 }
    // }, 3000)
  }

  // 定义怎么更改状态
  function setLoginUser(newLoginUser:any) {
    loginUser.value = newLoginUser;
  }
  // 返回值就是store的属性和方法
  return { loginUser, fetchLoginUser, setLoginUser }
})
