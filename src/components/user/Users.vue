<template>
   <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
<el-card class="box-card">
    <el-row :gutter="20">
        <el-col :span="8">
            <el-input v-model="queryParams.query" clearable @change="getUserList" @input="getUserList" @clear="getUserList" placeholder="请输入查询关键字" class="input-with-select">
                <el-button slot="append" icon="el-icon-search" @click="getUserList" ></el-button>
            </el-input>
        </el-col>
        <el-col :span="5">
            <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
        </el-col>
    </el-row>
    <el-table :data="userList" border style="width: 100%" stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="180">   
        </el-table-column>
        <el-table-column prop="mg_state" label="状态" width="100"> 
            <template slot-scope="scope"><!--作用域插槽 -->
                <el-switch @change="userStateChange(scope.row)"
                   v-model="scope.row.mg_state"
                >
                </el-switch>

            </template>  
        </el-table-column>
        <el-table-column label="操作" width="180">   
            <template slot-scope="scope">
               <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editUserBtn(scope.row.id)"></el-button>
               </el-tooltip><!--文字提示 -->
               <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUser(scope.row.id)"></el-button>
               </el-tooltip>
               
               <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                   <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
               </el-tooltip>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryParams.pagenum"
      :page-sizes="[1, 2, 3, 5,8]"
      :page-size="queryParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
</el-card>
<el-dialog
  title="添加用户"
  @close="addDialogClose"
  :visible.sync="dialogVisible"
  width="50%"
  >
  <el-form :model="addUserFormData" :rules="addUserFormRules" ref="addUserForm" label-width="80px" class="demo-ruleForm">
  <el-form-item label="用户名" prop="username">
    <el-input v-model="addUserFormData.username"></el-input>
  </el-form-item>
  <el-form-item label="密码" prop="password">
    <el-input v-model="addUserFormData.password"></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="addUserFormData.email"></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="addUserFormData.mobile"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
</el-dialog>


<el-dialog
  title="修改用户"
  @close="editDialogClose"
  :visible.sync="editDialogVisible"
  width="50%"
  >
  <el-form :model="editUserFormData" :rules="editUserFormRules" ref="editUserFormRef" label-width="80px" class="demo-ruleForm">
  <el-form-item label="用户名" >
    <el-input v-model="editUserFormData.username" disabled></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="editUserFormData.email"></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="editUserFormData.mobile"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUser">确 定</el-button>
  </span>
</el-dialog>
</div>
</template>
<script>
    export default {
        data() {
            let checkEmail = (rule,value,callback)=>{
               const emailReg = /[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
               if(!emailReg.test(value)){
                  return callback(new Error("邮箱地址不合法"));
               }else{
                  return callback();
               }
            };
            let checkMobile = (rule,value,callback)=>{
                const mobileReg = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/;
                if(!mobileReg.test(value)){
                    return callback(new Error("手机号码不合法"))
                }else{
                    return callback();
                }
            }
            return {
                queryParams: {
                    query: "",
                    pagenum: 1,
                    pagesize:3 
                },
                userList: [],
                total: 0,
                dialogVisible:false,//控制添加用户对话框的显示与隐
                //添加用户表单的校验规则
                addUserFormRules:{
                   username:[
                       { required: true, message: '请输入用户名', trigger: 'blur' },
                       { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
                   ],
                   password:[
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
                   ],
                   email:[
                        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                        { validator:checkEmail, trigger: 'blur' }
                   ],
                   mobile:[
                        { required: true, message: '请输入手机号码', trigger: 'blur' },
                        {validator:checkMobile, trigger: 'blur' }
                   ]
                },
                //添加用户表单的数据
                addUserFormData:{
                    username:"",
                    password:"",
                    email:"",
                    mobile:""
                },
                //控制修改用户对话框的隐藏显示
                editDialogVisible:false,
                editUserFormData:{
                    username:"",
                    email:"",
                    mobile:""
                },
                editUserFormRules:{
                     email:[
                        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                        { validator:checkEmail, trigger: 'blur' }
                   ],
                   mobile:[
                        { required: true, message: '请输入手机号码', trigger: 'blur' },
                        {validator:checkMobile, trigger: 'blur' }
                   ]
                } 
            };
        },
        created() {
            this.getUserList();
        },
        methods: {
            async getUserList() {
                let {
                    data: res
                } = await this.$http.get("users", {
                    params: this.queryParams
                });
                if (res.meta.status != 200) {
                    this.$message.error("请求用户列表失败");
                } else {
                    this.userList = res.data.users;
                    this.total = res.data.total;
                }
            },
            handleSizeChange(newSize){//改变每页展示条数是触发
               this.queryParams.pagesize = newSize;
               this.getUserList();
            },
            handleCurrentChange(newPageNum){
                this.queryParams.pagenum = newPageNum;
                this.getUserList();
            },
            async userStateChange(userInfo){
             let {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
             console.log(res)
             if(res.meta.status!=200){
                 userInfo.mg_state = !userInfo.mg_state;
                 return this.$message.error(res.meta.msg);
             }else{
                 this.$message.success(res.meta.msg);
             }
            },
            //监听添加用户对话框关闭事件处理程序
            addDialogClose(){
               this.$refs.addUserForm.resetFields();  
            },
            //添加用户确定按钮点击响应程序
            addUser(){
                this.$refs.addUserForm.validate(async valid=>{
                    if(!valid){
                        return
                    }else{
                     let {data:res} =await this.$http.post("users",this.addUserFormData)
                      console.log(res);
                     if(res.meta.status!=201){
                       return this.$message.error(res.meta.msg)
                     }else{
                       this.$message.success("添加用户成功");
                       this.dialogVisible = false; 
                       this.getUserList();  
                     }
                    }
                })
            },
            async editUserBtn(id){
               let {data:res} = await this.$http.get("users/"+id);
               this.editUserFormData = res.data;
               this.editDialogVisible = true;
            },
            //修改用户对话框关闭监听处理程序
            editDialogClose(){
                
            },
            //修改用户确定按钮点击响应程序
            editUser(){
               this.$refs.editUserFormRef.validate(async valid=>{
                   if(!valid){
                       return;
                   }else{
                       let {data:res} = await this.$http.put("users/"+this.editUserFormData.id,
                           {
                           email:this.editUserFormData.email,
                           mobile:this.editUserFormData.mobile
                           })
                        if(res.meta.status!=200){
                            this.$message.error(res.meta.msg)
                        }else{
                            this.$message.success(res.meta.msg)
                            this.editDialogVisible = false;
                            this.getUserList(); 
                        }
                   }
               })
            },
            //删除用户事件程序
            async removeUser(id){
                let result =await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                 }).catch(error=>error)
                 console.log(result)
                 if(result=="cancel"){
                     return this.$message.info("删除取消")
                 }else if(result=="confirm"){
                    let {data:res} = await this.$http.delete("users/"+id)
                    if(res.meta.status!=200){
                        return this.$message.error("删除失败")
                    }else{
                        this.$message.success(res.meta.msg);
                        this.getUserList();
                    }
                 }
            }
        }
    };
</script>
<style>
</style>
