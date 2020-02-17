<template>
    <div>
        <el-button @click="goOut">退出登录</el-button>
    </div>
</template>
<script>
export default {
    data(){
        return{}
    },
    methods:{
        goOut(){
            window.sessionStorage.clear();
            this.$router.replace("/login");
            this.$message.success("退出成功");
        }
    }
}
</script>
<style lang="less" scoped>
  
</style>
