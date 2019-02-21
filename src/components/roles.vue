<template>
  <el-card class="box">
    <!-- 面包屑 -->
    <cus-bread level1="权限管理" level2="角色列表"></cus-bread>
    <el-button class="btn" type="primary">添加角色</el-button>

    <!-- 表格 -->
    <el-table height="350px" :data="roles" style="width: 100%">
      <el-table-column type="expand" width="80">
        <template slot-scope="scope">
          <!-- 行列布局 -->
          <el-row class="level1" v-for="(item1, i) in scope.row.children" :key="item1.id">
            <el-col :span="4">
              <el-tag @close="deleRights(scope.row, item1)" closable>{{item1.authName}}</el-tag>
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <el-col :span="20">
              <el-row class="level2" v-for="(item2, i) in item1.children" :key="item2.id">
                <el-col :span="4">
                  <el-tag
                    @close="deleRights(scope.row, item2)"
                    type="success"
                    closable
                  >{{item2.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <el-tag
                    @close="deleRights(scope.row, item3)"
                    closable
                    v-for="(item3, i) in item2.children"
                    :key="item3.id"
                    type="warning"
                  >{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>

          <el-row v-if="scope.row.children.length===0">
            <el-col>
              <span>未分配角色</span>
            </el-col>
          </el-row>
        </template>
      </el-table-column>

      <el-table-column type="index" label="#" width="180"></el-table-column>
      <el-table-column prop="roleName" label="角色名称" width="200"></el-table-column>
      <el-table-column prop="roleDesc" label="角色描述" width="300"></el-table-column>

      <el-table-column prop="date" label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="mini" plain></el-button>
          <el-button type="danger" icon="el-icon-delete" circle size="mini" plain></el-button>
          <el-button
            @click="showDiaSetRights(scope.row)"
            type="success"
            icon="el-icon-check"
            circle
            size="mini"
            plain
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 对话框 -->
    <el-dialog title="分配权限" :visible.sync="dialogFormVisible">
      <el-tree
        ref="treeDom"
        :data="treelist"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="arrCheck"
        :props="defaultProps"
      ></el-tree>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      roles: [],
      dialogFormVisible: false,
      // 树形结构相关数据
      treelist: [],
      arrCheck: [],
      // arrExpand: [],
      defaultProps: {
        label: "authName",
        children: "children"
      },
      currRoleId: -1
    };
  },
  created() {
    this.getRoles();
  },
  methods: {
    // 分配权限, 发送请求
    async setRights() {
      // el-tree 组件中是否提供方法来获取两类节点

      // el-tree 标签-> DOM元素 . js方法
      // -> 在vue的js代码中操作dom元素 -> ref操作Dom
      // 1. 给要操作的元素设置一个属性ref值 , 值随便
      // 2. 在js代码中通过  this.$refs.ref值.js方法()
      // 获取全选节点的id   getCheckedKeys
      const arr1 = this.$refs.treeDom.getCheckedKeys();
      // console.log(arr1);
      // 获取半选节点的id   getHalfCheckedKeys
      const arr2 = this.$refs.treeDom.getHalfCheckedKeys();
      // console.log(arr2);

      const arr = [...arr1, ...arr2];
      // roleID 角色id
      const res = await this.$http.post(`roles/${this.currRoleId}/rights`, {
        rids: arr.join(",")
      });
      console.log(res);
      const {
        meta: { msg, status },
        data
      } = res.data;
      if (status === 200) {
        this.dialogFormVisible = false;
        this.getRoles();
      }
    },

    // 分配权限中的 打开对话框
    async showDiaSetRights(role) {
      this.currRoleId = role.id;
      // 获取数据
      const res = await this.$http.get(`rights/tree`);
      // console.log(res);
      const {
        meta: { msg, status },
        data
      } = res.data;
      if (status === 200) {
        this.treelist = data;
        // for嵌套

        // 获取当前角色的权限id<- 角色
        const temp2 = [];
        role.children.forEach(item1 => {
          // temp2.push(item1.id);
          item1.children.forEach(item2 => {
            // temp2.push(item2.id);
            item2.children.forEach(item3 => {
              temp2.push(item3.id);
            });
          });
        });

        console.log(temp2);
        this.arrCheck = temp2;
      }
      this.dialogFormVisible = true;
    },
    // 取消权限
    async deleRights(role, rights) {
      // roleId-> 角色id
      // rightId -> 权限id
      const res = await this.$http.delete(
        `roles/${role.id}/rights/${rights.id}`
      );
      // console.log(res);
      const {
        meta: { msg, status },
        data
      } = res.data;
      if (status === 200) {
        // 提示
        this.$message.success(msg);
        // 更新表格
        // this.getRoles();
        // 更新这个表格对性能不好,以下优化,只更新取消权限的那一行表格
        role.children = data;
      }
    },

    async getRoles() {
      const res = await this.$http.get(`roles`);
      console.log(res);
      const {
        meta: { msg, status },
        data
      } = res.data;
      if (status === 200) {
        this.roles = data;
      }
    }
  }
};
</script>

<style>
.box {
  height: 100%;
}
.btn {
  margin-top: 20px;
}
.level1,
.level2 {
  margin-bottom: 10px;
}
</style>


