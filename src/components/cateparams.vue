<template>
  <el-card class="box">
    <!-- 面包屑 -->
    <cus-bread level1="商品管理" level2="分类参数"></cus-bread>
    <!-- 注意条 -->
    <el-alert class="alert" title="注意: 只允许为第三级分类设置参数" type="warning" show-icon></el-alert>
    <!-- 级联选择器 -->
    <el-form class="form" label-position="left" label-width="120px" :model="form">
      <el-form-item label="请选择商品分类">
        <el-cascader
          clearable
          :show-all-levels="false"
          expand-trigger="hover"
          :options="options"
          :props="defaultProp"
          v-model="selectedOptions"
          @change="handleChange"
        ></el-cascader>
      </el-form-item>
    </el-form>

    <!-- tabs标签页 -->
    <el-tabs @tab-click="changeTab()" v-model="active">
      <el-tab-pane name="1" label="动态参数">
        <el-button disabled>设置动态参数</el-button>

        <!-- 表格 -->
        <el-table height="450px" border stripe :data="arrDy" style="width: 100%">
          <!-- 序号 -->
          <el-table-column type="expand" width="120">
            <template slot-scope="scope">
              <!-- 动态tag编辑 -->
              <!-- scope.row.attr_vals -->
              <el-tag
                :key="i"
                v-for="(item,i) in scope.row.attr_vals"
                closable
                :disable-transitions="false"
                @close="handleClose(scope.row, item)"
              >{{item}}</el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              ></el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
            </template>
          </el-table-column>

          <el-table-column type="index" label="#" width="120"></el-table-column>

          <el-table-column prop="attr_name" label="属性名称"></el-table-column>

          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button plain size="mini" type="primary" icon="el-icon-edit" circle></el-button>
              <el-button plain size="mini" type="danger" icon="el-icon-delete" circle></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane name="2" label="静态参数">
        <el-button disabled>设置静态参数</el-button>
        <el-table height="350px" border stripe :data="arrStatic" style="width: 100%">
          <!-- 序号 -->
          <el-table-column type="index" label="#" width="120"></el-table-column>

          <el-table-column prop="attr_name" label="属性名称"></el-table-column>
          <el-table-column prop="attr_vals" label="属性值"></el-table-column>

          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button plain size="mini" type="primary" icon="el-icon-edit" circle></el-button>
              <el-button plain size="mini" type="danger" icon="el-icon-delete" circle></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      active: "1",
      form: {},
      options: [],
      selectedOptions: [],
      defaultProp: {
        label: "cat_name",
        value: "cat_id"
      },
      // 动态参数数据
      arrDy: [],
      arrStatic: [],
      inputVisible: false,
      inputValue: ""
    };
  },
  created() {
    this.getGoodsCate();
  },
  methods: {
    // 动态tag相关方法
    async handleClose(obj, item) {
      // this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
      obj.attr_vals.splice(obj.attr_vals.indexOf(item), 1);
      const res = await this.$http.put(
        `categories/${this.selectedOptions[2]}/attributes/${obj.attr_id}`,
        {
          attr_name: obj.attr_name,
          attr_sel: obj.attr_sel,
          attr_vals: obj.attr_vals.join(",")
        }
      );
      console.log(res);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    async handleInputConfirm(obj) {
      let inputValue = this.inputValue;
      if (inputValue) {
        obj.attr_vals.push(inputValue);
        const res = await this.$http.put(
          `categories/${this.selectedOptions[2]}/attributes/${obj.attr_id}`,
          {
            attr_name: obj.attr_name,
            attr_sel: obj.attr_sel,
            attr_vals: obj.attr_vals.join(",")
          }
        );
        console.log(res);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    // 改变Tabs
    changeTab() {
      this.getDyOrStatic();
    },
    // 显示的label 一旦变化
    async handleChange() {
      this.getDyOrStatic();
    },
    // 获取动态或静态数据
    async getDyOrStatic() {
      if (this.selectedOptions.length !== 3) {
        this.$message.warning("请先选三级分类!");
        if (this.active === "1") {
          this.arrDy = [];
        }
        if (this.active === "2") {
          this.arrStatic = [];
        }
        return;
      }
      if (this.active === "1") {
        // 获取动态数据
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

      if (this.active === "2") {
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
    },
    // 获取三级分类
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
    }
  }
};
</script>

<style>
.box {
  height: 100%;
}
.alert {
  margin-top: 10px;
  margin-bottom: 10px;
}
.form {
  height: 50px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.el-form-item {
  margin-bottom: 10px;
}
</style>
