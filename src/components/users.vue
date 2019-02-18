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
        <el-input class="sreachInput" placeholder="请输入内容" v-model="query">
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>

        <!-- 添加按钮 -->
        <el-button type="success">添加按钮</el-button>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table :data="list" style="width: 100%">
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
        <template slot-scope="scope">
          {{scope.row.create_time | fmtdate}}
        </template>
      </el-table-column>

      <el-table-column label="用户状态" width="140">
        <template slot-scope="scope">
        <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949">
      </el-switch>
      </template>
      </el-table-column>
      <el-table-column prop="date" label="操作" width="200">
        <template slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" circle size="mini" plain></el-button>
        <el-button type="danger" icon="el-icon-delete" circle size="mini" plain></el-button>
        <el-button type="success" icon="el-icon-check" circle size="mini" plain></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
  </el-card>
</template>

<script>
export default {
  data () {
    return {
      query: '',
      pagenum: 1,
      pagesize: 10,
      //   表格数据
      list: []
    }
  },
  created () {
    this.getTableDate()
  },
  methods: {
    // 获取表格数据
    async getTableDate () {
      // 除了登录请求,其他所有请求需要授权
      // 接口文档中说 发送请求时需要使用axios设置请求头

      const AUTH_TOKEN = localStorage.getItem('token')
      this.$http.defaults.headers.common['Authorization'] = AUTH_TOKEN

      const res = await this.$http.get(
        `users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${
          this.pagesize
        }`
      )
      // 解构赋值来使用数据
      // console.log(res)
      const {data, meta: {msg, status}} = res.data
      if (status === 200) {
        this.list = data.users
        console.log(this.list)
      }
    }
  }
}
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
</style>
