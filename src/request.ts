import axios from 'axios'
import { message } from 'ant-design-vue'

const myAxios = axios.create({
  baseURL: 'http://localhost:8123',
  timeout: 60000,
  withCredentials: true,
});

// Add a request interceptor 请求拦截器
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor 响应拦截器
axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  const { data } = response;
  // 未登录
  if (data.code === 40100) {
    // 不是获取用户信息的请求,并且用户目前不是已经在用户登录页面,则跳转到登录页面
    if(
      !response.request.responseURL.includes("/user/get/login") &&
      !response.request.responseURL.includes("/user/login")
    ){
      message.warning("登录后访问更多内容")
      window.location.href = `/user/login?redirect=${window.location.href}`
    }
  }
  if (data.code === 50000) {
    // 处理服务器异常
    message.error("服务器异常,请稍后再试")
  }

  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});

// 导出实例,可以被其他文件引用
export default myAxios;
