<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card class="box-card">
          <el-table :data="rightList" 
                     border 
                     stripe
                     v-loading = "pictLoading"
                     element-loading-text = "数据正在加载中"
                     element-loading-spinner = "el-icon-loading"
        >
              <el-table-column type="index" label="序号"></el-table-column>
              <el-table-column prop="authName" label="权限名称"></el-table-column>
              <el-table-column prop="path" label="路径"></el-table-column>
              <el-table-column prop="level" label="权限等级">
                  <template slot-scope="scope">  
                       <el-tag v-if="scope.row.level==0">一级</el-tag>
                       <el-tag type="warning" v-else-if="scope.row.level==1">二级</el-tag>
                       <el-tag type="danger" v-else>三级</el-tag>
                  </template>
              </el-table-column>
          </el-table>
      </el-card>
    </div>
</template>
<script>
export default {
    data(){
        return{
            rightList:[],
            pictLoading:null
        }
    },
    created(){
       this.getRightList();
    },
    methods:{
       async getRightList(){
           this.pictLoading = true;
           let {data:res} = await this.$http.get("rights/list")
           if(res.meta.status!=200){
               return this.$message.error("获取权限列表失败")
           }else{
                this.pictLoading = false;
                this.$message.success("获取权限列表成功")
                this.rightList = res.data;
           }
        }
    }
}
</script>
<style>

</style>

