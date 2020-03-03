<template>
    <div>
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card class="box-card">
            <el-alert
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                show-icon
                class="alert_margin"
            >
            </el-alert>
            <el-row>
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader
                       v-model="selectCategoryKeys"
                       :options="categoryList"
                       :props="{expandTrigger:'hover',value:'cat_id',label:'cat_name',children:'children'}"
                        @change="handleChange">
                    </el-cascader>
                 </el-col>
            </el-row>
            <el-tabs class="tabs" v-model="activeName" @tab-click="handleTabsClick">
               <!--动态参数面板-->
               <el-tab-pane label="动态参数" name="many">
                   <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                    <el-table
                      :data="manyTableData"
                      style="width: 100%"
                      border
                      stripe
                    >
                        <el-table-column type="expand" >
                            <template slot-scope="scope">
                                <el-tag @close="handleClose(index,scope.row)" class="tag_margin" v-for="(item,index) in scope.row.attr_vals" :key="index" closable>
                                   {{item}}
                                </el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>    
                            
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="序号"></el-table-column>
                         <el-table-column
                              prop="attr_name"
                              label="属性名称"
                          >
                         </el-table-column>
                         <el-table-column label="操作">
                           <template slot-scope="scope">
                              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
                              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                           </template>
                         </el-table-column>
                    </el-table>
               </el-tab-pane>
               <!--静态属性面板-->
               <el-tab-pane label="静态属性" name="only">
                   <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                   <el-table
                      :data="onlyTableData"
                      style="width: 100%"
                      border
                      stripe
                    >
                        <el-table-column type="expand" >
                            <template slot-scope="scope">
                                <el-tag @close="handleClose(index,scope.row)" class="tag_margin" v-for="(item,index) in scope.row.attr_vals" :key="index" closable>
                                   {{item}}
                                </el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>    
                            
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="序号"></el-table-column>
                         <el-table-column
                              prop="attr_name"
                              label="属性名称"
                          >
                         </el-table-column>
                         <el-table-column label="操作">
                           <template slot-scope="scope">
                              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
                              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                           </template>
                         </el-table-column>
                    </el-table>
               </el-tab-pane>
            </el-tabs>
      </el-card>

      <!-- 添加动态参数/静态属性对话框 -->
      
        <el-dialog
          :title="'添加'+titleText"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClose"
        >
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible=false">取 消</el-button>
            <el-button type="primary" @click="addParamsAndAttr">确 定</el-button>
        </span>
        </el-dialog>


        <!--编辑参数/属性对话框-->
         <el-dialog
          :title="'修改'+titleText"
          :visible.sync="editDialogVisible"
          width="50%"
          @close="editDialogClose"
        >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible=false">取 消</el-button>
            <el-button type="primary" @click="editParamsAndAttr">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
     data(){
         return{
             //所有的分类列表
            categoryList:[],
            //级联选择框的双向数据绑定
            selectCategoryKeys:[],
            //激活的tabs
            activeName:"many",
            //动态参数的数据
            manyTableData:[],
            //静态属性数据
            onlyTableData:[],
            //添加动态参数/静态属性对话框的显示/影藏
            addDialogVisible:false,
            //添加表单数据
            addForm:{
                attr_name:""
            },
            //添加表单的验证规则
            addFormRules:{
                attr_name:[
                    { required: true, message: '内容不能为空', trigger: 'blur' },
                    { min: 2, max: 12, message: '长度在 2 到 12 个字符', trigger: 'blur' }
                ]
            },

            //控制修改对话框的显示/隐藏
            editDialogVisible:false,
            //修改对话框表单数据绑定
            editForm:{
               attr_name:""
            },
            //修改表单的验证规则
            editFormRules:{
                attr_name:[
                    { required: true, message: '内容不能为空', trigger: 'blur' },
                    { min: 2, max: 12, message: '长度在 2 到 12 个字符', trigger: 'blur' }
                ]
            },

            oldEdit:{
                attr_name:""
            },
         }
     },
     created(){
        this.getCategoryList();
     },
     methods:{
         //获取所有的商品分类列表
         async getCategoryList(){
           let {data:res} = await this.$http.get("categories")
           if(res.meta.status!=200){
               return this.$message.error("获取商品分类列表失败")
           }else{
               this.categoryList = res.data;
               this.$message.success("获取商品分类列表成功");
           }
         },
         //级联选择器改变是触发该事件
         async handleChange(){
            this.getParamsData();
            
         },
         //tabs切换时触发
         handleTabsClick(){
            this.getParamsData();

         },
         async getParamsData(){
              if(this.selectCategoryKeys.length===3){
                let {data:res} = await this.$http.get(`categories/${this.categoryId}/attributes`,{params:{sel:this.activeName}})
                if(res.meta.status!=200){
                    return this.$message.error(res.meta.msg)
                }else{
                    res.data.forEach(item=>{
                        item.attr_vals =item.attr_vals?item.attr_vals.split(","):[];
                        item.inputVisible = false;
                        item.inputValue =""
                    })
                    if(this.activeName==="many"){
                       this.manyTableData = res.data;
                       console.log(this.manyTableData)
                    }else{
                       this.onlyTableData = res.data;
                    }
                }
             }else{
                 this.$message.error("请选择三级分类")
                 this.selectCategoryKeys = [];
                 this.onlyTableData = [];
                 this.manyTableData = []
             }
         },
         //添加对话框关闭事件处理程序
         addDialogClose(){
            this.$refs.addFormRef.resetFields();
         },
         //添加对话框确定按钮点击监听程序
         addParamsAndAttr(){
             this.$refs.addFormRef.validate(async valid=>{
                 if(!valid){
                     return
                 }else{
                    let {data:res} = await this.$http.post(`categories/${this.categoryId}/attributes`,{
                         attr_name:this.addForm.attr_name,
                         attr_sel:this.activeName
                     })
                     if(res.meta.status!=201){
                         this.$message.error("添加失败")
                     }else{
                         this.addDialogVisible=false;
                         this.addForm.attr_name="";
                         this.$message.success("添加"+this.titleText+"成功")
                         this.getParamsData();
                     }
                     console.log(res)
                 }
             })
         },

         //编辑按钮点击事件处理程序
         async showEditDialog(attrInfo){
             console.log(attrInfo)
            let {data:res} = await this.$http.get(`categories/${this.categoryId}/attributes/${attrInfo.attr_id}`,{params:{attr_sel:this.activeName}})
            if(res.meta.status!=200){
                return this.$message.error("获取"+this.titleText+"失败")
            }else{
                this.editForm = res.data;
                this.oldEdit.attr_name = attrInfo.attr_name;
                this.editDialogVisible = true;
            }
             
         },
         //修改对话框关闭事件处理程序
         editDialogClose(){
            this.$refs.editFormRef.resetFields();
         },
         //修改对话框确定按钮点击监听程序
         editParamsAndAttr(){
            if(this.oldEdit.attr_name == this.editForm.attr_name){
                return this.$message.warning("请修改"+this.titleText)
            }
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid){
                    return
                }else{
                   let {data:res} = await this.$http.put(
                       `categories/${this.categoryId}/attributes/${this.editForm.attr_id}`,{
                           attr_name:this.editForm.attr_name,
                           attr_sel:this.activeName
                       })
                    if(res.meta.status!=200){
                        return this.$message.error("修改"+this.titleText+"失败")
                    }else{

                        this.$message.success("修改"+this.titleText+"成功");
                        this.getParamsData();
                        this.editDialogVisible = false;
                    }
                }
            })
            
         },
         //删除参数事件监听
         async removeParams(attrId){
            let confirmResult = await this.$confirm('此操作将永久删除该'+this.titleText+', 是否继续?', '提示', {
                 confirmButtonText: '确定',
                 cancelButtonText: '取消',
                 type: 'warning'
             }).catch(err=>err)
             if(confirmResult!=="confirm"){
                 return this.$message.info("已取消删除");
             }else{
               let {data:res} = await this.$http.delete(`categories/${this.categoryId}/attributes/${attrId}`)
               if(res.meta.status!=200){
                   return this.$message.error("删除失败")
               }else{
                  this.getParamsData();
                  this.$message.success("删除成功") 
               }

                 
             }
         },
         //tag输入框enter/blur事件监听
         async handleInputConfirm(row){
             if(row.inputValue.trim().length===0){
                 row.inputValue="";
                 row.inputVisible = false;
                 return;
             }else{
                 row.attr_vals.push(row.inputValue.trim());
                 row.inputValue = "";
                 row.inputVisible = false;
                 this.saveAttrVals(row)
             }
            
         },
         //显示input输入框
         showInput(row){
          row.inputVisible = true;
          //当前页面元素重新渲染完成之后才会调用回调函数
          this.$nextTick(_ => {
              this.$refs.saveTagInput.$refs.input.focus();
          });
         },
         //tag删除事件监听程序
         handleClose(index,row){
            row.attr_vals.splice(index,1);
            this.saveAttrVals(row);
         },
         //把操作过的attr_vals保存到数据库中
         async saveAttrVals(row){
             let {data:res} = await this.$http.put(`categories/${this.categoryId}/attributes/${row.attr_id}`,{
                     attr_name:row.attr_name,
                     attr_sel:this.activeName,
                     attr_vals:row.attr_vals.join(",")
                 })
                 if(res.meta.status!=200){
                     return this.$message.error("修改失败")
                 }else{
                     this.$message.success("修改成功")
                 } 
         }
     },
     computed:{
         isBtnDisabled(){
             if(this.selectCategoryKeys.length!=3){
                 return true;
             }else{
                 return false;
             }
         },
         categoryId(){
             if(this.selectCategoryKeys.length===3){
                 return this.selectCategoryKeys[2]
             }else{
                 return null;
             }
         },
         titleText(){
             if(this.activeName==="many"){
                 return "动态参数";
             }else if(this.activeName ==="only"){
                 return "静态属性"
             }
         }
     }
}
</script>
<style lang="less" scoped>
   .alert_margin{
       margin-bottom:15px;
   }
   .tabs{
       margin-top:15px;
   }
   .tag_margin{
       margin-left:15px;
       margin-bottom:15px;
   }
   .input-new-tag{
       width:150px;
       margin-left:15px;
   }
   .button-new-tag{
       margin-left:15px;
   }
</style>

