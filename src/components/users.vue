<template>
  <el-card class="box">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索 -->
    <el-row class="sreachbox">
      <el-col>
        <!-- 搜索框 -->
        <el-input
          @clear="getAllUsers()"
          clearable
          class="sreachInput"
          placeholder="请输入内容"
          v-model="query"
        >
          <el-button slot="append" icon="el-icon-search" @click="searchUser()"></el-button>
        </el-input>

        <!-- 添加按钮 -->
        <el-button type="success" @click="showDiaAddUser()">添加按钮</el-button>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table height="350px" :data="list" style="width: 100%">
      <el-table-column prop="id" label="#" width="80"></el-table-column>
      <el-table-column prop="username" label="姓名" width="120"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="140"></el-table-column>
      <el-table-column prop="mobile" label="电话" width="140"></el-table-column>

      <!-- 日期格式处理->过滤器-> 2类+3步 -->
      <!-- fmtdate的使用 -->
      <!-- 1. v-bind:  -->
      <!-- 2. {{msg | fmtdate}} -->
      <!-- 思路1 尝试prop="create_time | fmtdate"  不行prop不支持 内部写过滤器 -->
      <!-- 思路2 可以渲染日期格式 但是会报错 , 不行  -->
      <!-- 思路3 msg不能是prop内容 否则就会报错 以下思路 -->
      <!-- 1. 给单元格外层加template -->
      <!-- 2. 给template 设置slot-scope
        3. slot-scope的值会自动绑定外层数据结构 这里是el-table的data的值list
      4. 在内容位置写scope.row 自动取出list中每个对象 其中的row 固定写法-->
      <el-table-column label="创建日期" width="140">
        <template slot-scope="scope">{{scope.row.create_time | fmtdate}}</template>
      </el-table-column>

      <el-table-column label="用户状态" width="140">
        <template slot-scope="scope">
          <el-switch
            @change="changeStatus(scope.row)"
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            @click="showDiaEditUser(scope.row)"
            type="primary"
            icon="el-icon-edit"
            circle
            size="mini"
            plain
          ></el-button>
          <el-button
            @click="showMsgBoxDele(scope.row)"
            type="danger"
            icon="el-icon-delete"
            circle
            size="mini"
            plain
          ></el-button>
          <el-button
            @click="showDiaSetRole(scope.row)"
            type="success"
            icon="el-icon-check"
            circle
            size="mini"
            plain
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!--
    @size-change 每页条数改变时
    @current-change 页码改变时(当前1页  点击2页)
    current-page  当显示第几页 页码
    page-sizes    每页条数的不同情况的数组
    layout  附加功能
    -->
    <el-pagination
      class="page"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="2"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 对话框 添加用户 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisibleAdd">
      <!-- 表单 -->
      <el-form label-position="left" label-width="80px" :model="formdate">
        <el-form-item label="用户名">
          <el-input v-model="formdate.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formdate.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formdate.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formdate.mobile"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑用户-对话框 -->
    <el-dialog title="编辑用户" :visible.sync="dialogFormVisibleEdit">
      <!-- 表单 -->
      <el-form label-position="left" label-width="80px" :model="formdate">
        <el-form-item label="用户名">
          <el-input disabled v-model="formdate.username"></el-input>
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="formdate.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formdate.mobile"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 对话框 -->
    <el-dialog title="分配角色" :visible.sync="dialogFormVisibleRole">
      <el-form label-position="left" label-width="80px" :model="formdate">
        <el-form-item label="用户名">{{formdate.username}}</el-form-item>
        <el-form-item label="角色">
          <!-- v-model 绑定表单元素 -->
          <!--  1. type="text" input
                2. 其他表单元素  (textrea等)  就是select+option
                回顾下拉框特性
                1. 默认显示请选中-> 当v-model的数据值 和option中请选择的value值相同时,此时显示请选择
          2. 当选个某个option时, v-model的值等于选中的option中的value值-->
          <el-select v-model="selectVal" placeholder="请选择角色名">
            <el-option disabled label="请选择" :value="-1"></el-option>
            <!-- 分成两类 1, 请选择 2. 后台返回的角色数据 将来要获取角色数据 v-for遍历 -->
            <el-option
              v-for="(item, i) in roles"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="setRole()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      query: "",
      pagenum: 1,
      pagesize: 2,
      total: -1,
      //   表格数据
      list: [],
      // 对话框
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
      dialogFormVisibleRole: false,
      // 表单数据 -> 将来要发送post请求-> 请求体
      formdate: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 下拉框用的数据
      selectVal: -1,
      currUserId: -1,
      // 角色数组
      roles: []
    };
  },
  created() {
    this.getTableDate();
  },
  methods: {
    // 分配角色- 发送请求
    async setRole() {
      const res = await this.$http.put(`users/${this.currUserId}/role`, {
        rid: this.selectVal
      });
      console.log(res);
      const {
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        // 关闭对话框
        this.dialogFormVisibleRole = false;
        this.$message.success(msg);
      }
    },
    // 分配角色 - 打开对话框
    async showDiaSetRole(user) {
      // this.currUsername = user.username;
      this.formdate = user;
      this.currUserId = user.id;
      this.dialogFormVisibleRole = true;

      // 获取角色名称
      const res = await this.$http.get(`roles`);
      // console.log(res);
      this.roles = res.data.data;

      // 给下拉v-model绑定的selectVal赋值
      // 1. 接口文档中的  根据用户id 获取角色id 的接口
      const res2 = await this.$http.get(`users/${user.id}`);
      // console.log(res2);

      this.selectVal = res2.data.data.rid;
    },
    // 修改用户状态
    async changeStatus(user) {
      const res = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      );
      console.log(res);
    },
    // 编辑-发送请求
    async editUser() {
      // 编辑-确定发送请求
      // id-> user.id->user-> 1.data 没有 2. 方法实参也没有(因为不在template里面 所以不能传实参)
      // this.formdate 上一步已经有用户数据

      const res = await this.$http.put(
        `users/${this.formdate.id}`,
        this.formdate
      );
      console.log(res);
      const {
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        console.log(1);
        // 弹框提示
        this.$message.success("编辑成功");
        // 关闭对话框
        this.dialogFormVisibleEdit = false;
        // 更新表格
        this.getTableDate();
      }
    },
    // 编辑 - 显示对话框
    showDiaEditUser(user) {
      // 显示对话框
      this.dialogFormVisibleEdit = true;
      // 获取当前用户数据
      // this.formdate = user;
      this.formdate.username = user.username;
      this.formdate.email = user.email;
      this.formdate.mobile = user.mobile;
    },
    // 删除- 显示确认框
    showMsgBoxDele(user) {
      this.$confirm("是否把我删掉?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          // id -> 用户id数据 -> user.id
          const res = await this.$http.delete(`users/${user.id}`);
          // console.log(res);
          const {
            meta: { msg, status }
          } = res.data;
          if (status === 200) {
            // 删除提示框
            this.$message.success("删除成功");
            this.pagenum = 1;
            // 更新表格
            this.getTableDate();
          }
        })
        .catch(() => {
          this.$message.info("取消删除");
        });
    },
    // 添加用户功能
    async addUser() {
      // 发送请求
      const res = await this.$http.post(`users`, this.formdate);
      console.log(res);

      const {
        meta: { msg, status }
      } = res.data;
      if (status === 201) {
        // 关闭对话框
        this.dialogFormVisibleAdd = false;
        // 更新表格
        this.getTableDate();
        // 弹框
        this.$message.success("添加成功");
      }
    },
    // 添加用户按钮-打开弹框
    showDiaAddUser() {
      this.dialogFormVisibleAdd = true;
      // 清空原有内容
      this.formdate = {};
    },
    // 清空搜索框时获取所有用户
    getAllUsers() {
      this.getTableDate();
    },
    // 搜索用户
    searchUser() {
      // 按照query关键字搜索
      // query="admin"
      this.pagenum = 1;
      this.getTableDate();
    },
    // 分页相关的方法
    handleSizeChange(val) {
      console.log(`每页 ${val}条`);
      // 按照新的pagesize发送请求
      this.pagenum = 1;
      this.pagesize = val;
      this.getTableDate();
    },
    // 当前2页-> 点击3 - > 触发下面的方法-> val=3
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      // 按照新页码发送请求
      this.pagenum = val;
      this.getTableDate();
    },

    // 获取表格数据
    async getTableDate() {
      // 除了登录请求,其他所有请求需要授权
      // 接口文档中说 发送请求时需要使用axios设置请求头

      const res = await this.$http.get(
        `users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${
          this.pagesize
        }`
      );
      // 解构赋值来使用数据
      // console.log(res)
      const {
        data,
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        this.total = data.total;
        this.list = data.users;
        // console.log(this.list)
      }
    }
  }
};
</script>

<style>
.box {
  height: 100%;
}
.sreachbox {
  margin-top: 20px;
}
.sreachInput {
  width: 350px;
}
.page {
  margin-top: 30px;
}
</style>
