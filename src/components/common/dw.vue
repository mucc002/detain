<template>
  <el-select v-model="dwname" filterable placeholder="请选择" @change="getChange">
    <el-option :value="0">全部</el-option>
    <el-option
      v-for="item in dwOptions"
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
      dwOptions:[],// 单位数组
      dwname:'',// 单位名称
    };
  },
  computed: {

  },
  activated() {

  },
  created() {
    this.getDwName();
  },
  mounted() {

  },
  methods: {
    getChange(val) {
      console.log(val);
      this.$emit('closeMain',val);
    },
    getDwName() {
      let param = {
        pid:1
      }
      this.$axios.get(this.baseUrl + "RoadEquipment.asmx/GetDataDictionaryByPid", { params: param }).then(res => {
        if (res.data != 0) {
          const data = res.data.ds; // 获取收到的数据data
          this.dwOptions = data;//赋值给dwOptions
        } else {// 如果axios请求不成功
          this.$message.error("获取数据失败！");
        }
      });
    },
  }
};
</script>
