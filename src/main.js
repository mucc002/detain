// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css' // 默认主题
import axios from 'axios'
import 'babel-polyfill'

import VDistpicker from 'v-distpicker'

Vue.component('v-distpicker', VDistpicker)

Vue.use(ElementUI, { size: 'small' })

Vue.config.productionTip = false

//引入地图插件
import BaiduMap from 'vue-baidu-map'
Vue.use(BaiduMap, {
    ak: 'ZG0VVTsXar94CNUkrvPwAHNsxQfw0Vbi'
  })




Vue.prototype.$axios = axios
Vue.prototype.baseUrl = 'http://it.etsoft.cn/';

// // 请求拦截器
// const url = process.env.BASE_API
// axios.interceptors.request.use(
//   config => {
//     let token = localStorage.getItem('x-auth-token')
//     if (token) { // 判断是否存在token，如果存在的话，则每个http header都加上token
//       config.headers.token = `${token}`
//     }

//     if (config.url.indexOf(url) === -1) {
//       let getTimestamp = new Date().getTime()
//       if (config.url.indexOf('?') > -1) {
//         config.url = url + config.url + '&timestamp=' + getTimestamp
//       } else {
//         config.url = url + config.url + '?timestamp=' + getTimestamp
//       }
//     }
//     return config
//   },
//   err => {
//     alert(err)
//     return Promise.reject(err)
//   })

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
