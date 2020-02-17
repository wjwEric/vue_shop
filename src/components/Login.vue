<template>
    <div class="login_container">
        <div class="login_box">
            <div class="login_touxiang">
                <img src="../assets/logo.png" alt="">
            </div>
            <el-form ref="loginForm" :model="loginForm" :rules="loginFormRules" label-width="80px" class="login_form">
                 <el-form-item prop="username" label="用户名">
                      <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                 </el-form-item>
                  <el-form-item prop="password" label="密码">
                      <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
                 </el-form-item>
                  <el-form-item class="button">
                      <el-button type="primary" @click="login">登录</el-button>
                      <el-button type="info" @click="reset">重置</el-button>  
                  </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return{
            //数据绑定
            loginForm:{
                username:"admin",
                password:"123456"
            },
            //验证规则
            loginFormRules:{
                username:[
                   { required: true, message: '请输入用户名', trigger: 'blur' },
                   { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password:[
                   { required: true, message: '请输入密码', trigger: 'blur' },
                   { min: 3, max:12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods:{
        reset(){
           this.$refs.loginForm.resetFields();
        },
        login(){
            this.$refs.loginForm.validate(async validate=>{
                if(!validate) return;
                let {data:res} = await this.$http.post("login",this.loginForm);
                console.log(res)
                if(res.meta.status!=200){
                    this.$message.error("登录失败")
                }else{
                    this.$message.success("登录成功");

                    //把token保存到sessionStorage里面以便之后访问权限api接口
                    window.sessionStorage.setItem("token",res.data.token);
                    //通过编程路由导航跳转到后台管理页面
                    this.$router.push("/home");
                }
            })
        }
    }
};
</script>
<style lang = "less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
  .login_box {
    position: absolute;
    border-radius: 3px;
    width: 450px;
    height: 300px;
    left: 50%;
    top: 50%;
    margin-left: -225px;
    margin-top: -150px;
    background-color: #fff;
    .login_touxiang {
      width: 130px;
      height: 130px;
      border-radius: 50% 50%;
      padding: 10px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: aqua;
      box-shadow: 0 0 5px #fff;
      img {
        width: 130px;
        height: 130px;
        border-radius: 50% 50%;
        background-color: #eee;
        &:hover {
          background-color: aquamarine;
        }
      }
    }
    .login_form{
        position:absolute;
        bottom:0px;
        width:400px;
        left:2%;
        .button{
            display:flex;
            justify-content: flex-end;
        }
    }
  }
}
</style>

