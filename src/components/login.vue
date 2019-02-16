<template>
  <div class="login-wrap">
    <el-form class="login-form" label-position="top" label-width="80px" :model="formDate">
      <h2>用户登录</h2>
      <el-form-item label="用户名">
        <el-input v-model="formDate.username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="formDate.password"></el-input>
      </el-form-item>
      <el-button @click.prevent="handleLogin()" class="login-btn" type="success">登录</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formDate: {
        username: "",
        password: ""
      }
    };
  },
  methods: {
    // 登录请求
    handleLogin() {
      // console.log(1)
      // 前提: api-server-> node app.js
      // 服务器支持跨域(api-server和项目代码不放在一块也可以)

      // 请求没发送
      // 1.url写错
      // 2. axios导入失败
      // 3.客户端一点问题没有->服务器卡死=重启服务器
      this.$http
        .post(`login`, this.formDate)
        .then(res => {
          console.log(res);
          const {
            data: {
              data,
              meta: { msg, status }
            }
          } = res;
          if (status === 200) {
            // 渲染home组件  =改标识 = js改标识
            this.$router.push({
              name: "home"
            });
          } else {
            // 提示框
            this.$message.error(msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style>
.login-wrap {
  height: 100%;
  background-color: #324152;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-form {
  background-color: #fff;
  border-radius: 5px;
  width: 400px;
  padding: 30px;
}
.login-btn {
  width: 100%;
}
</style>
