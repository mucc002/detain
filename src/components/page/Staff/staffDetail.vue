<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-date"></i> 路政人员详情
        </el-breadcrumb-item>
        <template v-if="state">
          <el-breadcrumb-item>路政人员编辑</el-breadcrumb-item>
        </template>
        <template v-else>
          <el-breadcrumb-item>路政人员新增</el-breadcrumb-item>
        </template>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-form ref="form" :model="form" label-width="110px" :rules="rules">
      <div class="left">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.Name"></el-input>
        </el-form-item>

        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.Sex" placeholder="请选择">
            <el-option key="1" label="男" value="1"></el-option>
            <el-option key="2" label="女" value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
      </div>

      <div class="right">
        <!--路政单位选择-->
        <el-form-item label="路政单位" prop="DwName">
          <v-dw @closeMain="closeMain"></v-dw>
        </el-form-item>


        <!--管理职能选择-->
        <el-form-item label="管理职能" prop="DwFunction">
          <v-function @functionName="functionName"></v-function>
        </el-form-item>

        <!--管辖区域选择-->
        <el-form-item label="管辖区域" prop="Region">
          <v-region @region="region"></v-region>
        </el-form-item>
      </div>
      </el-form>
      <div class="footer">
        <el-button type="primary" @click="onSubmit('form')">提交保存</el-button>
        <el-button @click="goBack">取消</el-button>
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

    <!-- 地图弹出框 -->
    <el-dialog title="选择位置" :visible.sync="is_show" width="50%" height="40%">
      <label>关键词搜索：<input v-model="keyword"></label>
      <template>
        <baidu-map class="map" :center="{lng: lng, lat: lat}" :zoom="20" :scroll-wheel-zoom="true" @click="clickMap">
          <bm-marker
            :position="{lng: lng, lat: lat}"
          >
            <bm-label :content="form.name" :labelStyle="{color: 'black', fontSize : '14px',border:'1px solid black'}" :offset="{width: -15, height: 30}"/>
          </bm-marker>
          <bm-local-search :keyword="keyword" :auto-viewport="true"></bm-local-search>
        </baidu-map>
      </template>

      <div class="choice">
<!--         <el-button @click="is_show = false">取 消</el-button> -->
        <el-button type="primary" @click="choose_position">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { constants } from "fs";
import { debug, debuglog } from "util";
import { parse } from "path";
import VDistpicker from "v-distpicker";
import vDw from '../../common/dw.vue';
import vFunction from '../../common/functionName.vue';
import vRegion from '../../common/region.vue';

export default {
  name: "inviteDetail",
  data() {
    return {
      select: {},
      id: null,//店铺id
      state: true,
      imageUrl: "http://qunxin.lilinyun.com/webapi/Storeimage",
      sessionId: null,
      form: {},
      function:0,// 管理职能
      isClick:false,// 判断上传图片是否被点击了
      images:[],// 保存图片
      delVisible: false, // 店铺图片删除弹出框是否出现
      deleteId:'',// 删除图片id
      activeId:0,// 新增时候自定义的删除图片id
      activedId:0,// 新增页面删除时候用于记录的id
      keyword:'',// 百度地图检索功能
      // 填写规则
      rules: {
        address: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ],
        name: [
          { required: true, message: "请输入店铺名称", trigger: "blur" }
        ],
        DwName: [
          { required: true, message: "请输入门面类别", trigger: "blur" }
        ],
        DwFunction: [
          { required: true, message: "请输入一周干垃圾量", trigger: "blur" }
        ],
        Region: [
          { required: true, message: "请输入一周湿垃圾量", trigger: "blur" }
        ],
      },
      is_show: false,//地图显示
      show: false,
      lng: 121.468595, //经度
      lat: 30.917537, //纬度
      activeName:'first',//默认显示基本信息
      years:[],
      yearId:'',//保存标签页选中年份
      form1Show:false,
      yearValue:true,//是否有点击年份的数据
    };
  },
  components: { VDistpicker,vDw,vFunction,vRegion },
  created() {
    this.activeName = 'first';
    this.form1Show= false;
  },
  activated() {
    this.activeName = 'first';
    this.form1Show= false;
    this.id = this.$route.query.id;
    this.sessionId = localStorage.getItem("ms_session_id");
    if (this.id == 0) {
      this.state = false;
    } else {
      this.state = true;
    }
    // 获取人员详情
    this.getData();
  },
  mounted() {},
  methods: {
    // 子组件传值（单位名称）
    closeMain(val) {
      this.form.DwName = val;
    },

    //子组件传值（管理职能）
    functionName(val) {
      this.form.DwFunction = val;
    },

    //子组件传值（管辖区域)
    region(val) {
      this.form.Region = val;
    },

    //加载数据时调用
    getData() {
      var that = this;
      // 编辑
      if (this.id != 0) {
        var param = {
          id: this.$route.query.id,
        };
        this.$axios.get(this.baseUrl + "RoadEquipment.asmx/PersonnelById?random=" + Math.random(), { params: param }).then(res => {
          if (res.data != 0) {
            const data = res.data.ds[0];
            this.form = data;
            console.log(this.form);
          }
        });
      } else {
        this.form = {};// 清空表单
        this.images = [];// 清空图片
      }
    },
    //确定提交
    onSubmit(formName) {
      // 编辑
      if (this.id != 0) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.form.Id = this.id;// 修改的人员ID
            this.form.name = this.form.name;// 姓名
            this.form.sex = this.form.sex;// 性别
            this.form.phone = this.form.phone;// 联系电话
            this.form.DwName = this.form.DwName;// 所属单位
            this.form.DwFunction = this.form.DwFunction;// 管理职能
            this.form.Region = this.form.Region;// 管辖区域
            // 获取请求参数
            const params = this.form;
            console.log(params);

            this.$axios.post(this.baseUrl + "RoadEquipment.asmx/UpdatePersonnelById", params).then(res => {
              var result = res.data;
              console.log(result);
              if (result.code != 0) {
                this.$message.error(result.data);
              } else {
                  this.$message.success(`修改成功`);
                  this.images = [];//清空图片
                  this.$router.push("/staff-list");
              }
            });

          } else {
            console.log("error submit!!");
            return false;
          }
        });
      } else {
        // 新增
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.form.name = this.form.name;// 姓名
            this.form.sex = this.form.sex;// 性别
            this.form.phone = this.form.phone;// 联系电话
            this.form.DwName = this.form.DwName;// 所属单位
            this.form.DwFunction = this.form.DwFunction;// 管理职能
            this.form.Region = this.form.Region;// 管辖区域
            const AddUserId = JSON.parse(localStorage.getItem("userInfo")).PersonnelId;
            this.form.AddUserId = AddUserId;

            var that = this;
            $.ajax({
              //请求方式
              type : "POST",
              //请求地址
              url : this.baseUrl+"RoadEquipment.asmx/AddPersonnel",
              //数据，json字符串
              data : this.form,
              //请求成功
              success : function(res) {
                if(res == 1){
                  that.$message({
                    message: '添加成功',
                    type: 'success'
                  });
                  // 回到人员列表页
                  that.$router.push("/staff-list");
                }else{
                  that.$message.error('网络繁忙，请稍后再试！');
                }
              },
              //请求失败，包含具体的错误信息
              error : function(e){

              }
            });

          } else {
            console.log("error submit!!");
            return false;
          }
        });
      }
    },
    //点击取消按钮
    goBack() {
      this.images = [];//清空图片
      this.$router.push("/staff-list");
    },
    //删除图片提示
    handleDelete(id) {
      // 如果是编辑页面
      if(this.id != 0){
        this.deleteId = id;//获取当前删除图片id
        this.delVisible = true;//删除弹出框出现
      }else{//如果是新增页面
        this.activedId = id;
        this.images.map((item,index)=>{
          if(item.id == this.activedId){
            console.log(index);
            this.images.splice(index,1);
          }
        })
      }
    },
    //确定删除图片
    deleteRow() {
      // 如果是编辑页面删除图片，那么传线上的id
      if(this.id != 0){
        const params = {
          id:this.deleteId,//图片id
          sessionId:this.sessionId,
          deleted:1,
        }
        this.$axios.post(this.imageUrl + "/deleted", params).then(res => {
          var result = res.data;
          console.log(result);
          if (result.code != 0) {
            this.$message.error(result.data);
          } else {
            this.$message.success(`删除成功`);
            this.delVisible = false;
            console.log(this.images);
            this.images.map((item,index)=>{
              if(item.id == this.deleteId){
                console.log(index);
                this.images.splice(index,1);
              }
            })
          }
        });
      }
    },
    //打开地图
    openMap() {
      console.log("open");
      console.log(this.lng,this.lat);
      var that = this;
      // 地图显示
      this.is_show = true;

      // setTimeout(function() {
      //   if (that.form.lng && that.form.lat) {
      //     that.lng = that.form.lng;
      //     that.lat = that.form.lat;
      //   } else {
      //     that.form.lat = that.lat;
      //     that.form.lng = that.lng;
      //   }
      // }, 100);
    },
    infoWindowClose() {
      this.show = false;
    },
    infoWindowOpen() {
      this.show = true;
    },
    clickMap(type, target, point, pixel, overlay) {
      this.form.lat = type.point.lat;
      this.form.lng = type.point.lng;
      this.lat = type.point.lat;
      this.lng = type.point.lng;
      console.log(this.form.lng,this.form.lat);
    },
    // 重新选择位置（点击地图弹出框的确认按钮）
    choose_position() {
      this.is_show = false;//弹出框隐藏
      this.keyword = '';
    }
  },
  watch: {},
  computed: {}
};
</script>

<style lang="less" scoped>
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
.title_id {
  display: inline;
  margin-left: 20px;
}
.el-input {
  width: 60%;
}
.product_pic {
  width: 200px;
  height: 200px;
}
/deep/.el-form {
  display: flex;
}
/deep/.el-input.is-disabled .el-input__inner {
  color: #333 !important;
}
.left {
  width: 42%;
  margin-left: 5%;
}
.right {
  width: 42%;
}
.footer {
  margin: 2% 40%;
}
.city {
  width: 100%;
}
.city_chose {
  width: 27%;
  display: inline-block;
}
.city_detail {
  width: 53%;
  display: inline-block;
}
.maps {
  color: #999;
  cursor: pointer;
}
#map {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#allmap {
  height: 100%;
  overflow: hidden;
  width: 100%;
}
/* 去掉地图左下角的百度LOGO */
.anchorBL {
  display: none;
}
.map {
  width: 100%;
  height: 300px;
}
.choice {
  width: 100%;
  text-align: center;
  margin-top: 5%;
}

.inputImg {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
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
    cursor:pointer;
  }
}

.imgBox{
  width:180px;
  height:120px;
  float:left;
  margin-right:15px;
  position:relative;
  span{
    width:20px;
    height:20px;
    position:absolute;
    right:-10px;
    top:-10px;
    border-radius:50%;
    border:1px solid #555;
    background-color:#fff;
    color:#555;
    text-align:center;
    line-height:18px;
    cursor:pointer;
  }
}

.updateImg {
  width: 100%;
  height:100%;
}
</style>
