<template>
  <el-container class="home">
      <el-header>
        <div class="left">
          <img src="../assets/lhy.jpeg" alt=""/>
          <span>电商后台管理系统</span>
        </div>
        <el-button @click="goOut">退出登录</el-button>
      </el-header>
  <el-container>
<el-aside :width="isCollapse?'64px':'200px'">
  <div class="collapse" @click="isCollapse=!isCollapse">|||</div>
  <el-menu class="el-menu-vertical-demo"  background-color="#333744"
    text-color="#fff" active-text-color="#409EFF" :default-active="activePath" :collapse="isCollapse" :collapse-transition="false" router unique-opened>
    <el-submenu :index="subItem.id+''" v-for="subItem in menuList" :key="subItem.id">
      <template slot="title">
        <i :class="iconFont[subItem.id]"></i>
        <span>{{subItem.authName}}</span>
      </template>
      <el-menu-item :index="'/'+item.path" @click="saveActivePath(item.path)" v-for="item in subItem.children" :key="item.id">
        <i class="el-icon-menu"></i>
        <span>{{item.authName}}</span>
      </el-menu-item>
    </el-submenu>
  </el-menu>
</el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menuList:[],
      iconFont:{
        "125":"iconfont icon-user",
        "103":"iconfont icon-tijikongjian",
        "101":"iconfont icon-shangpin",
        "102":"iconfont icon-danju",
        "145":"iconfont icon-baobiao"
      },
      isCollapse:false,
      activePath:""
    };
  },
  created(){
     this.getMenus();

     this.activePath = "/"+window.sessionStorage.getItem("activePath")||"";
  },
  watch:{
    //实时监听路由变化，切换到最新激活导航
    $route(to,from){
      this.activePath=to.path;
    }
  },
  methods: {
    goOut() {
      window.sessionStorage.clear();
      this.$router.replace("/login");
      this.$message.success("退出成功");
    },
    async getMenus(){

      let {data:res} = await this.$http.get("menus");
      if(res.meta.status!=200){
        this.$message.error(res.meta.msg);
      }else{
        this.menuList = res.data;
      } 
    },
    //保存当前激活路径
    saveActivePath(activePath){
       window.sessionStorage.setItem("activePath",activePath);
       this.activePath = "/"+activePath;
    }
  }
};
</script>
<style lang="less" scoped>
.iconfont{
  margin-right:10px;
}
.el-menu{
  border:none;
}
.home {
  height: 100%;
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left {
      display: flex;
      align-items: center;
      img {
        width: 60px;
        height: 60px;
        border-radius: 50% 50%;
        margin-right: 30px;
      }
      span {
        font-size: 20px;
        color: #fff;
      }
    }
    .el-button {
      background-color: cadetblue;
      color: #fff;
    }
  }
  .el-aside {
    background-color: #333744;
    .collapse{
      background:cadetblue;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
      line-height: 100%;
      color:#fff;
    }
  }
  .el-main {
    background-color: #eaeaf1;
  }
}
</style>
