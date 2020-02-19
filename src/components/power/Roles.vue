<template>
   <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>

       <el-card class="box-card">
           <el-row>
               <el-col :span="6">
                   <el-button @click="addRoleBtn" type="primary" icon="el-icon-circle-plus">添加角色</el-button>
               </el-col>
           </el-row>
          <el-table :data="roleList" 
                     border 
                     stripe
                     v-loading = "pictLoading"
                     element-loading-text = "数据正在加载中"
                     element-loading-spinner = "el-icon-loading"
        >
              <el-table-column type="expand">
                  <template slot-scope="scoped">
                     <el-row :class="['border_bottom','vertical_center',index==0?'border_top':null]" v-for="(item,index) in scoped.row.children" :key="item.id">
                       <!-- 一级权限渲染区域 -->
                       <el-col :span="5">
                           <el-tag closable @close="removeRightById(scoped.row,item.id)">{{item.authName}}</el-tag>
                           <i class="el-icon-caret-right"></i>
                       </el-col>
                       <!-- 二级/三级级权限渲染区域 -->
                       <el-col :span="19">
                           <el-row :class="['vertical_center',index==0?'':'border-top']" v-for="(item_2,index) in item.children" :key="item_2.id">
                               <el-col :span = "6">
                                   <el-tag closable @close="removeRightById(scoped.row,item_2.id)" type="success">{{item_2.authName}}</el-tag>
                                   <i class="el-icon-caret-right"></i>
                               </el-col>
                               <el-col :span = "18">
                                   <el-tag  closable @close="removeRightById(scoped.row,item_3.id)" type="warning" v-for="item_3 in item_2.children" :key="item_3.id">{{item_3.authName}}</el-tag>
                               </el-col>
                           </el-row>
                       </el-col>       
                     </el-row>  
                  </template>
              </el-table-column>
              <el-table-column type="index" label="序号"></el-table-column>
              <el-table-column prop="roleName" label="角色名称"></el-table-column>
              <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
              <el-table-column label="操作" width="300">
                  <template slot-scope="scope">  
                      <el-button type="primary" icon="el-icon-edit" size="small" @click="editRole(scope.row)">编辑</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="small" @click="removeRoleById(scope.row)">删除</el-button>
                      <el-button type="warning" icon="el-icon-setting" size="small" @click="showRightsDialog(scope.row)">分配权限</el-button>
                  </template>
              </el-table-column>
          </el-table>
      </el-card>
    <!--添加角色--> 
    <el-dialog
       title="添加角色"
       :visible.sync="addDialogVisible"
        width="50%"
        @close="closeAddDialog"
    >
       <el-form :model="addFormData" :rules="addFormRule" ref="addFormRef" label-width="80px" class="demo-ruleForm">
            <el-form-item label="角色名称" prop="roleName">
               <el-input v-model="addFormData.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
               <el-input v-model="addFormData.roleDesc"></el-input>
            </el-form-item>
       </el-form>
       <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveNewRole">确 定</el-button>
       </span>
</el-dialog>

<!--编辑角色-->
    <el-dialog
        title="编辑角色"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="closeEditDialog"
    >
       <el-form :model="editFormData" :rules="addFormRule" ref="editFormRef" label-width="80px" class="demo-ruleForm">
            <el-form-item label="角色名称" prop="roleName">
               <el-input v-model="editFormData.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
               <el-input v-model="editFormData.roleDesc"></el-input>
            </el-form-item>
       </el-form>
       <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editNewRole">确 定</el-button>
       </span>
    </el-dialog>


      <!--分配权限对话框-->
      <el-dialog
         title="分配权限"
         :visible.sync="rightsDialogVisible"
          width="50%"
          @close="setRightsDialog"
      >
            <!--树结构 -->
             <el-tree
              :data="rightsList" 
              :props="treeProps" 
              show-checkbox
              node-key="id"
              default-expand-all
              :default-checked-keys="checkedKeys"
              ref="treeRef"
              >
             </el-tree>
            <span slot="footer" class="dialog-footer">
               <el-button @click="rightsDialogVisible = false">取 消</el-button>
               <el-button type="primary" @click="setRights">确 定</el-button>
            </span>
       </el-dialog>
   </div>
</template>
<script>
export default {
    data(){
        return{
            //控制loading效果显示
            pictLoading:null,
            roleList:[],
            //控制添加对话框的显示与隐藏
            addDialogVisible:false,
            // 添加角色对话框绑定数据
            addFormData:{
               roleName:"",
               roleDese:""
            },
            //添加角色对话框表单校验规则
            addFormRule:{
               roleName:[
                   { required: true, message: '请输入角色名称', trigger: 'blur' },
                   { min: 2, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
               ],
               roleDesc:[
                   {
                       min:3,max:12,message:"长度在3到12个字符",trigger:"blur"
                   }
               ]
            },
            //控制编辑角色对话框的显示/隐藏
            editDialogVisible:false,
            editFormData:{
                 roleName:"",
                 roleDesc:""
            },
            roleEditId:null, 

            //控制分配权限对话框显示/隐藏
            rightsDialogVisible:false,
            rightsList:[],
            treeProps:{
                 children: 'children',
                 label: 'authName'
            },
            //默认勾选权限的数组
            checkedKeys:[

            ],
            //当前被分配权限的角色id
            roleId:null
        }
    },
    created(){
        this.getRoleList();
    },
    methods:{
        async getRoleList(){
            this.pictLoading = true;
            let {data:res} = await this.$http.get("roles");
            if(res.meta.status!=200){
                this.pictLoading = false;
                return this.$message.error("获取角色列表失败");
            }else{
                this.pictLoading = false;
                this.roleList = res.data;
            }
        },
        addRoleBtn(){
           this.addDialogVisible = true;
        },
        async removeRightById(role,rightId){
           let confirm = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
             }).catch(error=>error)
             if(confirm=="cancel"){
                 return this.$message.info("已取消删除")
             }else if(confirm=="confirm"){
                let{data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if(res.meta.status!==200){
                    return this.$message.error("删除权限失败")
                }else{
                    role.children = res.data;
                    this.$message.success(res.meta.msg);
                }
             }
        },
        async showRightsDialog(role){
           let {data:res} = await this.$http.get("rights/tree")
           if(res.meta.status!=200){
               return this.$message.error("获取权限列表失败")
           }else{
               this.rightsList = res.data;
               this.$message.success(res.meta.msg);
               //把role里的三级权限存放到this.checkedKeys中
               this.getThreeKeys(role,this.checkedKeys)    
               this.roleId = role.id;
               this.rightsDialogVisible=true;
           }
           
        },
        //利用一个递归函数存储当前角色的全部三级权限
        getThreeKeys(node,arr){
            
            if(!node.children){
                return arr.push(node.id)
            }else{
                node.children.forEach(item=>{
                    this.getThreeKeys(item,arr)
                })
            }
        },
        setRightsDialog(){
            this.checkedKeys = [];
        },
        async setRights(){
            let checkKeys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            let rids = checkKeys.join(",");
           let {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids})
           if(res.meta.status!=200){
               return this.$message.error(res.meta.msg);
           }else{
               this.getRoleList();
               this.$message.success(res.meta.msg)
               this.rightsDialogVisible=false;
           }
        },
        //监听关闭添加角色对话框事件
        closeAddDialog(){
            this.addFormData.roleName=this.addFormData.roleDesc=""
        },
        //监听添加角色对话框的确定按钮事件
        async saveNewRole(){
          let{data:res} = await this.$http.post("roles",this.addFormData)
          if(res.meta.status!=201){
              return this.$message.error("添加角色失败")
          }else{
              this.addDialogVisible = false;
              this.getRoleList();
              this.$message.success(res.meta.msg);
          }
        },
        //监听编辑对话框的关闭事件
        closeEditDialog(){
           this.editDialogVisible = false;
        },
        //监听编辑按钮点击事件
        editRole(role){
           //获取当前角色信息
           this.roleEditId = role.id;
           this.editFormData.roleName = role.roleName;
           this.editFormData.roleDesc = role.roleDesc;
           this.editDialogVisible = true;
        },
        //监听编辑对话框确定按钮点击事件
        async editNewRole(){
           let {data:res} = await this.$http.put("roles/"+this.roleEditId,this.editFormData)
           if(res.meta.status!=200){
               return this.$message.error("编辑角色失败")
           }else{
               this.editDialogVisible = false;
               this.getRoleList();
               this.$message.success("编辑角色成功")
           }
       },
       //监听删除按钮点击事件
       async removeRoleById(role){
         let confirm = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
         }).catch(error=>error)
         if(confirm=="cancel"){
             this.$message.info("删除已取消")
         }else if(confirm=="confirm"){
              let {data:res} = await this.$http.delete("roles/"+role.id)
              if(res.meta.status!=200){
                  return this.$message.error("删除失败")
              }else{
                 this.getRoleList();
                 this.$message.success(res.meta.msg);
              }   
         }
       }
    }
}
</script>
<style lang="less" scoped>
   .el-tag{
       margin:8px;
   }
   .border_bottom{
       border:1px solid #eee;
   }
   .border-top{
       border:1px solid #eee;
   }
   .vertical_center{
    display:flex;
    align-items:center;
   }

</style>

