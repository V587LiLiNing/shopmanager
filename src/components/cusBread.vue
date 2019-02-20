<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>{{level1}}</el-breadcrumb-item>
    <el-breadcrumb-item>{{level2}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
// 封装技巧
// 1. 重复代码直接当成函数体
// 2. 函数中变化的量当成形参
export default {
  //   前提： data的数据的值只能来源于本身
  // 1. 数据声明的值如果来源于外部， 此时数据声明就不能写在data中
  // 2. 应该把数据的声明写在选项props
  // 3. props的值可以是字符串数组
  // 4. 这个数据的用法和data数据的用法一样
  props: ["level1", "level2"]
};
</script>

<style>
</style>
