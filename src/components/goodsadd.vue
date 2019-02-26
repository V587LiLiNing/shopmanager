<template>
  <el-card class="box">
    <!-- 面包屑 -->
    <cus-bread level1="商品管理" level2="商品列表"></cus-bread>
    <el-alert class="alert" title="添加商品信息" type="info" center show-icon></el-alert>

    <!-- 步骤条el-steps -->
    <el-steps :active="active*1" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
    </el-steps>

    <!-- 标签页 -->
    <el-form class="form" label-position="top" label-width="80px" :model="form">
      <el-tabs @tab-click="changeTab()" v-model="active" tab-position="left">
        <el-tab-pane name="1" label="基本信息">
          <el-form-item label="商品名称">
            <el-input v-model="form.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="form.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="form.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="form.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <!-- 表单元素 级联选择器-->
            <el-cascader
              clearable
              expand-trigger="hover"
              :options="options"
              :props="defaultProp"
              v-model="selectedOptions"
              @change="handleChange"
            ></el-cascader>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane name="2" label="商品参数">
          <el-form-item :label="item1.attr_name" v-for="(item1, i) in arrDy" :key="item1.attr_id">
            <el-checkbox-group v-model="item1.attr_vals">
              <el-checkbox border :label="item2" v-for="(item2, i) in item1.attr_vals" :key="i"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name="3" label="商品属性">
          <el-form-item :label="item.attr_name" v-for="(item, i) in arrStatic" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name="4" label="商品图片">
          <el-form-item>
            <el-upload
              action="http://localhost:8888/api/private/v1/upload"
              :headers="headers"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name="5" label="商品内容">
          <el-form-item>
            <el-button @click="addGoods()">添加商品</el-button>
            <quill-editor class="quill" v-model="form.goods_introduce"></quill-editor>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";
export default {
  components: {
    quillEditor
  },
  data() {
    return {
      active: "1",
      // 添加商品的表单数据
      form: {
        goods_name: "",
        goods_cat: "",
        goods_price: "",
        goods_number: "",
        goods_weight: "",
        goods_introduce: "",
        pics: [],
        attrs: []
      },
      // 级联选择器使用的数据
      options: [],
      selectedOptions: [],
      defaultProp: {
        label: "cat_name",
        value: "cat_id"
      },
      // 动态参数数组
      arrDy: [],
      arrStatic: [],
      headers: {
        Authorization: localStorage.getItem("token")
      }
    };
  },
  created() {
    this.getGoodsCate();
  },
  methods: {
    // 添加商品
    async addGoods() {
      // 处理了goods_cat
      this.form.goods_cat = this.selectedOptions.join(",");
      // const res = await this.$http.post(`goods`, this.form);
      // console.log(res);
      const arr1 = this.arrDy.map(item => {
        return { attr_id: item.attr_id, attr_value: item.attr_vals };
      });
      // console.log(arr1);

      // 静态
      const arr2 = this.arrStatic.map(item => {
        return { attr_id: item.attr_id, attr_value: item.attr_vals };
      });
      // console.log(arr2);
      this.form.attrs = [...arr1, ...arr2];
      // console.log(this.form.attrs);

      const res = await this.$http.post(`goods`, this.form);
      // console.log(res);
      const {
        meta: { msg, status },
        data
      } = res.data;
      if (status === 201) {
        // 提示
        this.$message.success(msg);
        // 回到列表
        this.$router.push({
          name: "goods"
        });
      } else {
        this.$message.warning(msg);
        console.log(msg);
      }
    },
    // 图片上传相关方法
    handleRemove(file, fileList) {
      // console.log("remove----");

      // console.log(file, fileList);
      // 临时路径
      // file.response.data.tmp_path;

      const Index = this.form.pics.findIndex(item => {
        // console.log(item);
        return item.pic === file.response.data.tmp_path;
      });
      this.form.pics.splice(Index, 1);
      console.log(this.form.pics);
    },
    handleSuccess(response, file, fileList) {
      // console.log("success---------");

      // console.log(response);
      this.form.pics.push({
        pic: response.data.tmp_path
      });
      console.log(this.form.pics);
    },
    // 获取动态数据
    async changeTab() {
      // 如果点了第二个tab
      if (this.active === "2" || this.active === "3") {
        // 如果不是三级分类
        if (this.selectedOptions.length !== 3) {
          // 提示
          this.$message.error("请先选择三级分类!");

          if (this.active === "2") {
            this.arrDy = [];
          } else {
            this.arrStatic = [];
          }
          return;
        }
        // 静态数据
        if (this.active === "3") {
          // 获取静态参数数据
          const res = await this.$http.get(
            `categories/${this.selectedOptions[2]}/attributes?sel=only`
          );
          // console.log(res);
          const {
            meta: { msg, status },
            data
          } = res.data;
          if (status === 200) {
            this.arrStatic = data;
          }
        }
        // 动态数据
        if (this.active === "2") {
          // 获取动态参数数据
          const res = await this.$http.get(
            `categories/${this.selectedOptions[2]}/attributes?sel=many`
          );
          // console.log(res);
          const {
            meta: { msg, status },
            data
          } = res.data;
          if (status === 200) {
            this.arrDy = data;
            // this的arrDy 中的attr_vals是字符串
            this.arrDy.forEach(item => {
              // 加个判断 如果返回的动态数据是空字符串
              if (item.attr_vals.trim().length === 0) {
                item.attr_vals = [];
              } else {
                item.attr_vals = item.attr_vals.split(",");
              }
            });
            console.log(this.arrDy);
          }
        }
      }
    },
    // 获取三级商品分类
    async getGoodsCate() {
      const res = await this.$http.get(`categories?type=3`);
      // console.log(res);
      const {
        meta: { msg, status },
        data
      } = res.data;
      if (status === 200) {
        this.options = data;
      }
    },
    handleChange() {}
  }
};
</script>

<style>
.box {
  height: 100%;
}
.alert {
  margin-top: 20px;
  margin-bottom: 20px;
}
.form {
  height: 350px;
  overflow: auto;
}
.ql-editor,
.ql-blank {
  min-height: 200px;
}
</style>
