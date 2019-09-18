<template>
  <el-select v-model="functionName" filterable placeholder="请选择" @change="getChange">
    <el-option
      v-for="item in functionOptions"
      :key="item.Id"
      :label="item.name"
      :value="item.Id">
    </el-option>
  </el-select>
</template>
<script>
import bus from "../common/bus";
export default {
  data() {
    return {
      functionOptions:[],// 职能数组
      functionName:'',// 职能名称
    };
  },
  computed: {

  },
  activated() {

  },
  created() {
    this.getFunctionName();
  },
  mounted() {

  },
  methods: {
    getChange(val) {
      console.log(val);
      this.$emit('functionName',val);
    },
    getFunctionName() {
      let param = {
        pid:8
      };
      this.$axios.get(this.baseUrl + "RoadEquipment.asmx/GetDataDictionaryByPid", { params: param }).then(res => {
        if (res.data != 0) {
          const data = res.data.ds; // 获取收到的数据data
          this.functionOptions = data;//赋值给dwOptions
        } else {// 如果axios请求不成功
          this.$message.error("获取数据失败！");
        }
      });
    },
  }
};
</script>
