import axios from 'axios'

const HttpServer = {}

HttpServer.install = function (Vue) {
  axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
  // 发请求
  // 当请求不是login时, 就设置头部,
  // 如果请求标识是login时, 就不需要头部
  // 请求拦截器
  axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    if (config.url !== 'login') {
      const AUTH_TOKEN = localStorage.getItem('token')
      // axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
      config.headers['Authorization'] = AUTH_TOKEN
    }
    return config
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  })

  Vue.prototype.$http = axios
}

export default HttpServer
