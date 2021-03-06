import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import "./assets/css/global.css"
import "./assets/fonts/iconfont.css"
import ZkTable from 'vue-table-with-tree-grid'
Vue.component("tree-table", ZkTable)
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
//设置axios请求拦截器
axios.interceptors.request.use(config=>{
  //请求授权api必须在请求头上加上Authorization,值为token令牌
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
})
Vue.prototype.$http = axios;
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
