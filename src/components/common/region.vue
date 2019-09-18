<template>
  <el-select v-model="region" filterable placeholder="请选择" @change="getChange">
    <el-option
      v-for="item in regionOptions"
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
      regionOptions:[],// 管辖区域数组
      region:'',// 管辖区域
    };
  },
  computed: {

  },
  activated() {

  },
  created() {
    this.getRegionName();
  },
  mounted() {

  },
  methods: {
    getChange(val) {
      console.log(val);
      this.$emit('region',val);
    },
    getRegionName() {
      let param = {
        pid:11
      };
      this.$axios.get(this.baseUrl + "RoadEquipment.asmx/GetDataDictionaryByPid", { params: param }).then(res => {
        if (res.data != 0) {
          const data = res.data.ds; // 获取收到的数据data
          this.regionOptions = data;//赋值给dwOptions
        } else {// 如果axios请求不成功
          this.$message.error("获取数据失败！");
        }
      });
    },
  }
};
</script>
