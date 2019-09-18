<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-tickets"></i> 路政人员管理
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <v-dw ref="dwname" @closeMain="closeMain"/></v-dw>
        <el-button type="primary" icon="search" @click="search">搜索</el-button>
        <el-button size="small" @click="handleAdd(-1, 0)" class="addBtn">新增</el-button>
        <el-button size="small" @click="leadIn" class="addBtn">导入</el-button>
        <a class="addBtn export" @click="exportTable()">导出</a>
        <a href="http://qunxin.lilinyun.com/uploads/file/店铺导入数据表.xls" class="downloadBtn">下载模板</a>
        <input type="file" name="file" ref="leadInput" @change="referenceUpload">
      </div>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="Id" label="序号" align="center"></el-table-column>

        <el-table-column prop="Name" label="姓名" align="center"></el-table-column>

<!--         <el-table-column label="店铺图片" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.image" style="width: 90px;">
          </template>
        </el-table-column> -->

        <el-table-column prop="SexName" label="性别" align="center" width="120"></el-table-column>

        <el-table-column prop="phone" label="联系电话" align="center" ></el-table-column>

        <el-table-column prop="DanWeiName" label="所在路政单位" align="center" ></el-table-column>

        <el-table-column prop="DwFunction" label="管理职能" align="center" ></el-table-column>

        <el-table-column prop="area" label="管辖区域" align="center" ></el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="small" @click="handleAdd(scope.$index, scope.row)">编辑</el-button>
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
import $ from 'jquery'
import vDw from '../../common/dw.vue'
export default {
  name: 'newsList',
  data () {
    return {
      idx: -1,
      newsId: null,
      dwname: 0, // 单位名称
      sex: 0, // 性别
      dwOptions: [], // 单位名称数组
      address: '',
      newsImg: '',
      introduction: '',
      total: null, // 共多少条数据
      content: null,
      cur_page: 1,
      pageSize: 10, // 默认每页显示几条数据
      tableData: [],
      imageList: [],
      delVisible: false, // 删除弹出框是否出现
      isClick: false, // 是否点击了修改图片按钮
      imageUrl: null
    }
  },
  components: {
    vDw
  },
  created () {
    // 保存用户的唯一标识
    // this.sessionId = localStorage.getItem("ms_session_id");
  },
  activated () {
    // 初始化请求人员列表
    this.getData()
  },
  mounted () {

  },
  computed: {},
  methods: {
    // 子组件传值（单位名称）
    closeMain (val) {
      this.dwname = val
    },

    // 请求路政人员列表
    getData () {
      let param = {
        limit: this.pageSize, // 默认每页显示条数
        dwname: this.dwname, // 搜索单位名称
        sex: this.sex, // 性别
        page: this.cur_page// 当前页数
      }
      this.$axios.get(this.baseUrl + 'RoadEquipment.asmx/GetPersonnelList', { params: param }).then(res => {
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

    // 导入
    leadIn () {
      this.$refs.leadInput.click()// 模拟点击input
    },

    // 导出
    exportTable () {
      window.open('http://qunxin.lilinyun.com/webapi/Store/export?sessionId=' + this.sessionId)
    },

    // 导入文件事件
    referenceUpload (e) {
      var file = e.target.files[0]// 获取上传文档
      var params = new FormData()
      params.append('file', file)
      params.append('sessionId', this.sessionId)
      console.log(params)

      this.$axios.post(this.url + '/import', params).then(res => {
        var result = res.data

        // 如果有失败的数量
        if (res.data.data.failure_data.length > 0) {
          var failHtml = res.data.data.failure_data.join(',')
          this.$notify({
            title: '提示',
            message: '成功了' + res.data.data.successful_number + '条,' + '失败了' + res.data.data.failure_number + '条,失败信息为：' + failHtml,
            duration: 0
          })
        } else {
          this.$notify({
            title: '提示',
            message: '成功了' + res.data.data.successful_number + '条',
            duration: 0
          })
        }

        if (result.code != 0) {
          this.$message.error(result.data)
        } else {
          this.$message.success('导入成功')
        }
      })
    },

    // 删除提示
    handleDelete (index, row) {
      this.idx = index// 获取当前删除idx
      this.delVisible = true// 删除弹出框出现
    },

    // 确定删除
    deleteRow () {
      var that = this;
      const item = this.tableData[this.idx]// 获取当前删除数据item
      const params = {
        id: item && item.Id ? item.Id : 0
      }
      $.ajax({
        // 请求方式
        type: 'POST',
        // 请求地址
        url: this.baseUrl + 'RoadEquipment.asmx/deletePersonnel',
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
    handleCurrentChange (val) {
      this.cur_page = val
      this.getData()
    },
    handleSelectionChange (val) {},

    // 新增/编辑页面
    handleAdd (index, row) {
      this.idx = index
      const item = this.tableData[this.idx]
      console.log(item);
      var ids = item ? item.Id : 0// 传值用于页面跳转后判断是新增还是编辑

      // 跳转新增页面
      this.$router.push({
        path: '/staffDetail',
        query: {
          id: ids
        }
      })
    },

    // 筛选功能
    search () {
      this.getData()
    }
  },
  watch: {}
}
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
