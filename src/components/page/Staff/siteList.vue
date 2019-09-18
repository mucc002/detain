<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-tickets"></i> 服装管理列表
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-input v-model="UseCompany" placeholder="搜索使用单位" class="handle-input mr10"></el-input>
        <el-button type="primary" icon="search" @click="search">搜索</el-button>
        <el-button size="small" @click="handleAdd(-1, 0)" class="addBtn">新增</el-button>
      </div>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        ref="multipleTable"
      >
        <el-table-column prop="id" label="ID" align="center"></el-table-column>

        <el-table-column prop="store.name" label="站点名称" align="center"></el-table-column>

        <!--         <el-table-column label="店铺图片" align="center">
                  <template slot-scope="scope">
                    <img :src="scope.row.image" style="width: 90px;">
                  </template>
                </el-table-column> -->

        <el-table-column prop="year.year" label="站点类型" align="center" width="120"></el-table-column>

        <el-table-column prop="annual_fee" label="联系人" align="center" ></el-table-column>

        <el-table-column prop="charge_barrel" label="联系电话" align="center" ></el-table-column>

        <el-table-column prop="barrel" label="站点详细地址" align="center" ></el-table-column>

        <el-table-column prop="create_time" label="创建时间" align="center" ></el-table-column>

        <el-table-column prop="update_time" label="修改时间" align="center" ></el-table-column>

        <el-table-column label="操作" width="260" align="center">
          <template slot-scope="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          @current-change="handleCurrentChange"
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
        ></el-pagination>
      </div>
    </div>

    <!-- 删除提示框 -->
    <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
      <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteRow">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import $ from "jquery";
export default {
  name: 'newsList',
  data() {
    return {
      idx: -1,
      newsId: null,
      SiteType: 0, // 站点类型
      SiteContacts: 0,// 站点联系人
      url: 'http://qunxin.lilinyun.com/webapi/Store', // 接口
      sessionId: localStorage.getItem('ms_session_id'),
      newsImg: '',
      introduction: '',
      total: null, // 共多少条数据
      content: null,
      cur_page: 1,
      pageSize: 7, // 默认每页显示几条数据
      tableData: [],
      imageList: [],
      delVisible: false, // 删除弹出框是否出现
      sevenFee: '',
      eightFee: '',
      nineFee: '',

      // formTable: {
      //   //新增店铺对象
      //   title: "",
      //   imageUrl: "",
      //   content: "",
      //   introduction: "",
      //   type: null
      // },
      isClick: false, //是否点击了修改图片按钮
      imageUrl: null
    };
  },
  created() {
    this.sessionId = localStorage.getItem("ms_session_id");
  },
  activated() {
    // 渲染服装列表
    this.getData();
  },
  computed: {},
  methods: {

    //请求服装列表
    getData() {
      let param = {
        limit: this.pageSize,//默认每页显示条数
        SiteType: this.SiteType,//搜索站点类型
        SiteContacts: this.SiteContacts,//搜索站点联系人
        page: this.cur_page,//当前页数
      };
      this.$axios.get(this.baseUrl + 'RoadEquipment.asmx/GetSiteList', { params: param }).then(res => {
        if (res.data != 0) {
          const data = res.data.ds // 获取收到的数据data
          this.total = 30// 总条数
          this.tableData = data// 赋值表格数据
        } else { // 如果axios请求不成功
          this.tableData = []
          this.$message.error('暂无数据！')
        }
      })
    },


    // 导出
    exportTable() {
      window.open('http://qunxin.lilinyun.com/webapi/Store/export?sessionId=' + this.sessionId);
    },

    //删除提示
    handleDelete(index, row) {
      this.idx = index;//获取当前删除idx
      this.delVisible = true;//删除弹出框出现
    },

    //确定删除
    deleteRow() {
      var that = this;
      const item = this.tableData[this.idx];//获取当前删除数据item
      const params = {
        id: item && item.Id ? item.Id : 0,
      };
      $.ajax({
        // 请求方式
        type: 'POST',
        // 请求地址
        url: this.baseUrl + 'RoadEquipment.asmx/DaleteEquipment',
        // 数据，json字符串
        data: params,
        // 请求成功
        success: function (res) {
          console.log(res);
          if (res == 1) {
            that.tableData.splice(this.idx, 1);//删除当前数据
            that.$message({
              message: '删除成功',
              type: 'success'
            })
            that.delVisible = false;
          } else {
            that.$message.error('网络繁忙，请稍后再试！')
          }
        },
        // 请求失败，包含具体的错误信息
        error: function (e) {

        }
      })
    },

    // 分页导航
    handleCurrentChange(val) {
      this.cur_page = val;
      this.getData();
    },
    handleSelectionChange (val) {},

    //新增/编辑页面
    handleAdd(index, row) {
      this.idx = index;
      const item = this.tableData[this.idx];
      var ids = item ? item.id : 0;//传值用于页面跳转后判断是新增还是编辑

      // 跳转新增页面
      this.$router.push({
        path: "/clothDetail",
        query: {
          id: ids
        }
      });
    },

    //筛选功能
    search() {
      this.getData();
    }
  },
  watch: {}
};
</script>

<style scoped lang="less">
.handle-box {
  margin-bottom: 20px;
}
.handle-select {
  width: 120px;
}
.handle-input {
  width: 300px;
  display: inline-block;
}
.del-dialog-cnt {
  font-size: 16px;
  text-align: center;
}

.newsImage {
  width: 85% !important;
}
.addBtn {
  float: right;
  background: #f0791d;
  color: #fff;
}
.updateImg {
  width: 120px;
}
.input-wrap {
  position: relative;
  cursor: pointer;
  margin-bottom: 5px;
  span {
    border: 1px solid #dcdfe6;
    padding: 5px 10px;
    color: #606266;
    border-radius: 3px;
  }
}
.inputImg {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}
.tips {
  position: absolute;
  top: 0;
  left: -50px;
  color: red;
}
/deep/.el-form-item__content {
  position: relative;
}
/deep/.el-table .cell{
  width: 100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

input[name=file]{
  display:none;
}

.downloadBtn{
  display:inline-block;
  width:100px;
  background-color:#409EFF;
  text-align:center;
  color:#fff;
  line-height:32px;
  border:1px solid #DCDFE6;
  border-radius:5px;
  font-size:14px;
  margin-left:20px;
}

.downloadBtn:hover{
  background-color:#69B2FD;
}

.export{
  display:inline-block;
  width:56px;
  height:32px;
  line-height:32px;
  text-align:center;
  border-radius:2px;
  font-size:0.8em;
  color:#fff;
}
</style>

