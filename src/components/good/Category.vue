<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card class="box-card">
          <el-row>
              <el-col :span = "6">
                   <el-button type="primary" icon="el-icon-circle-plus" @click="showAddCategoryDialog">添加分类</el-button>
              </el-col>
          </el-row>
          <tree-table class="tree" :data="cateList" 
                      :columns="columns" 
                      show-index
                      :selection-type="false"
                      :expand-type="false"
                      border
                      v-loading = "pictLoading"
                      element-loading-text = "数据正在加载中"
                      element-loading-spinner = "el-icon-loading"
          >
             <!--是否有效-->
             <template slot ="isOk" slot-scope="scope">
                     <i v-if="scope.row.cat_deleted===false" style="color:Blue" class="el-icon-success"></i>
                     <i v-else class="el-icon-error" style="color:Red"></i>
             </template>
              <!-- 等级 -->
             <template slot ="level" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level==0" size="mini">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level==1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
             </template>
             <!--操作-->
             <template slot ="opt" slot-scope="scope">
                   <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditCategoryDialog(scope.row)">编辑</el-button>
                   <el-button size="mini" type="danger" icon="el-icon-delete" @click="showRemoveMessageBox(scope.row)">删除</el-button>
             </template>
          </tree-table>
      </el-card>
      <el-pagination 
         @size-change="handleSizeChange" 
         @current-change="handleCurrentChange" 
         :current-page="queryParams.pagenum" 
         :page-sizes="[2, 3, 5, 8]"
         :page-size="queryParams.pagesize" 
         layout="total, sizes, prev, pager, next, jumper" 
         :total="total">
      </el-pagination>
      <!--添加分类对话框-->
      <el-dialog
        title="添加分类"
        :visible.sync="addCategoryDialogVisible"
        width="50%"
        @close="addCategoryDialogClose"
      >
           <el-form :model="addCategoryForm" :rules="addCategoryFormRule" ref="addCategoryFormRef" label-width="100px" class="demo-ruleForm">
              <el-form-item label="分类名称：" prop="cat_name">
                 <el-input v-model="addCategoryForm.cat_name"></el-input>
              </el-form-item>
              <el-form-item label="父级分类：">
                  <el-cascader
                   v-model="selectKeys"
                   :options="parentCateList"
                   :props="cascaderProps"
                   @change="parentCateChanged"
                   clearable
                   >
                 </el-cascader>
              </el-form-item>
           </el-form>
           <span slot="footer" class="dialog-footer">
              <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="addCategory">确 定</el-button>
           </span>
       </el-dialog>


       <!--修改分类对话框-->
       <el-dialog
          title="修改分类"
          :visible.sync="editCategoryDialogVisible"
          width="50%"
          @close="editCategoryDialogClose"
       >
          <el-form :model="editCategoryForm" :rules="editCategoryFormRule" ref="editCategoryFormRef" label-width="100px" class="demo-ruleForm">
              <el-form-item label="修改分类" prop="cat_name">
                  <el-input v-model="editCategoryForm.cat_name"></el-input>
              </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
              <el-button @click="editCategoryDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editCategory">确 定</el-button>
         </span>
       </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return{
            //loading显示
            pictLoading:false,
            //请求商品分类列表参数
            queryParams:{
               type:3,
               pagenum:1,
               pagesize:5
            },
            //所有分类列表
            cateList:[],
            //分类总条数
            total:0,
            //tree-table列的配置数组
            columns:[
                {
                    label:"分类名称",
                    prop:"cat_name",

                },
                {
                    label:"是否有效",
                    type:"template",
                    template:"isOk"
                },
                 {
                    label:"等级",
                    type:"template",
                    template:"level"
                },
                 {
                    label:"操作",
                    type:"template",
                    template:"opt"
                }
            ],
            //控制添加分类对话框的显示/隐藏
            addCategoryDialogVisible:false,
            //添加分类表单数据对象
            addCategoryForm:{
                cat_name:"",
                cat_pid:0,
                cat_level:0
            },
            addCategoryFormRule:{
                cat_name:[
                      { required: true, message: '请输入分类名称', trigger: 'blur' },
                ]
            },
            //父级分类列表
            parentCateList:[],
            //指定级联选择器的配置对象
            cascaderProps:{
                expandTrigger:"hover",
                value:"cat_id",
                label:"cat_name",
                children:"children",
                checkStrictly:true
            },
            //级联选择器选择的值
            selectKeys:[],
            //控制修改对话框的显示/隐藏
            editCategoryDialogVisible:false,
            //修改分类表单数据绑定
            editCategoryForm:{
                cat_name:"",
                cat_id:0
            },
            //修改分类表单验证规则
            editCategoryFormRule:{
                cat_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ]
            },

            oldEditCategory:{
                cat_name:""
            }
           
        }
    },
    created(){
        this.getCategories();
    },
    methods:{
       async getCategories(){
           this.pictLoading=true;
           let {data:res} = await this.$http.get("categories",{params:this.queryParams})
           if(res.meta.status!=200){
               return this.$message.error("获取商品分类列表失败")
           }else{
               this.pictLoading = false;
               this.cateList = res.data.result;
               this.total = res.data.total;
           }
       },
       //pagesize改变是触发
       handleSizeChange(newValue){
           this.queryParams.pagesize = newValue;
           this.getCategories();
       },
       handleCurrentChange(newValue){
           this.queryParams.pagenum = newValue;
           this.getCategories();
       },
       async showAddCategoryDialog(){
           let {data:res} = await this.$http.get("categories",{params:{type:2}})
           if(res.meta.status!=200){
               this.$message.error("获取父级分类列表失败")
           }else{
               this.parentCateList = res.data;
               console.log(this.parentCateList);
           }
           this.addCategoryDialogVisible = true;
       },
       //级联选择器改变是触发
       parentCateChanged(){
         if(this.selectKeys.length>0){
             this.addCategoryForm.cat_pid=this.selectKeys[this.selectKeys.length-1];
             this.addCategoryForm.cat_level = this.selectKeys.length;
         }else{
             this.addCategoryForm.cat_pid = 0;
             this.addCategoryForm.cat_level = 0;
         }
       },
       addCategory(){
          this.$refs.addCategoryFormRef.validate(async valid=>{
              if(!valid){
                  return;
              }else{
                 let {data:res} = await this.$http.post("categories",this.addCategoryForm)
                 if(res.meta.status!=201){
                     this.$message.error("创建失败")
                 }else{
                     this.$message.success("创建成功")
                     this.addCategoryDialogVisible = false;
                     this.getCategories();
                 }
              }
          })
       },
       //监听添加分类对话框的关闭事件
       addCategoryDialogClose(){
           this.$refs.addCategoryFormRef.resetFields();
           this.selectKeys = [];
           this.addCategoryForm.cat_level=0;
           this.addCategoryForm.cat_pid=0;
       },
       //点击编辑按钮触发该事件处理程序
       showEditCategoryDialog(categoryInfo){
           this.editCategoryForm.cat_name = categoryInfo.cat_name;
           this.editCategoryForm.cat_id = categoryInfo.cat_id;
           this.oldEditCategory.cat_name = categoryInfo.cat_name;
           this.editCategoryDialogVisible = true;
       },
       //修改分类对话框确定按钮点击事件处理程序
       async editCategory(){
        if(this.editCategoryForm.cat_name==this.oldEditCategory.cat_name){
            return this.$message.error("请修改分类名称");
        }
        let {data:res} = await this.$http.put("categories/"+this.editCategoryForm.cat_id,{cat_name:this.editCategoryForm.cat_name});
        if(res.meta.status!=200){
            this.$message.error("更新失败")
        }else{
            this.$message.success(res.meta.msg);
            this.editCategoryDialogVisible = false;
            this.editCategoryForm.cat_id = 0;
            this.editCategoryForm.cat_name = "";
            this.getCategories();
        }
       },
        //修改分类对话框关闭事件处理程序
       editCategoryDialogClose(){
            this.editCategoryForm.cat_id=0;
            this.editCategoryForm.cat_name="";
       }, 
        //显示消息提示框
       async showRemoveMessageBox(categoryInfo){
           let confirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
              }).catch(err=>err)
           if(confirm=="cancel"){
               this.$message.info("取消删除成功")               
           }else if(confirm == "confirm"){
              let {data:res} = await this.$http.delete("categories/"+categoryInfo.cat_id)
              if(res.meta.status!=200){
                  return this.$message.error("删除失败")
              }else{
                   this.getCategories();
                   this.$message.success(res.meta.msg);
              }
             
           }
       }
    }
}
</script>
<style lang="less" scoped>
   .tree{
       margin-top:15px;
   }
</style>
