import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login.vue"
import Home from "../components/Home.vue"
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect:"/login"
  },
  {
    path:"/login",
    component:Login
  },
  {
    path:"/home",
    component:Home
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to,from,next)=>{
  let token = window.sessionStorage.getItem("token");
  if(to.path=="/login"){
     if(token){
       Vue.prototype.$message.info("请先退出登录状态");
       next(from.path)
     }else{
       next();
     }
    
  }else{
    
    if(!token){
      next("/login")
    }else{
      next();
    }
  }
})
export default router
