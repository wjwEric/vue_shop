import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login.vue"
import Home from "../components/Home.vue"
import Welcome from "../components/Welcome.vue"
import Users from "../components/user/Users.vue"
import Roles from "../components/power/Roles.vue"
import Rights from "../components/power/Rights.vue"
import Category from "../components/good/Category.vue"
import Good from "../components/good/Good.vue"
import Params from "../components/good/Params.vue"
import Order from "../components/order/Order.vue"
import Report from "../components/report/Report.vue"
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
    component:Home,
    redirect:"/welcome",
    children:[
      {
        path:"/welcome",
        component:Welcome
      },
      {
        path:"/users",
        component:Users
      },
      {
        path:"/roles",
        component:Roles
      },
      {
        path:"/rights",
        component:Rights
      },
      {
        path:"/categories",
        component:Category
      },
      {
        path:"/goods",
        component:Good
      },
      {
        path:"/params",
        component:Params
      },
      {
        path:"/orders",
        component:Order
      },
      {
        path:"/reports",
        component:Report
      }
    ]
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
