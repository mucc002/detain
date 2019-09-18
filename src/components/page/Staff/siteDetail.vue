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
        <el-form-item label="服装类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
        </el-form-item>

        <el-form-item label="尺寸" prop="size">
          <el-select v-model="form.size" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
        </el-form-item>

        <el-form-item label="库存" prop="Stock">
          <el-input v-model="form.Stock"></el-input>
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

export default {
  name: 'inviteDetail',
  data() {
    return {
      select: {},
      id: null, // 店铺id
      state: true,
      url: 'http://qunxin.lilinyun.com/webapi/Store',
      imageUrl: 'http://qunxin.lilinyun.com/webapi/Storeimage',
      sessionId: null,
      form: {},
      form1: {
        annual_fee: '',
        charge_barrel: '',
        barrel: '',
      },
      inputVisible: false,
      inputValue: "",
      options:'',//存储店铺类型
      isClick:false,//判断上传图片是否被点击了
      images:[],//保存图片
      delVisible: false, //店铺图片删除弹出框是否出现
      deleteId:'',//删除图片id
      activeId:0,//新增时候自定义的删除图片id
      activedId:0,//新增页面删除时候用于记录的id
      keyword:'',//百度地图检索功能
      // 填写规则
      rules: {
        type: [
          { required: true, message: "请选择服装类型", trigger: "blur" }
        ],
        size: [
          { required: true, message: "请填写服装尺寸", trigger: "blur" }
        ],
        Stock: [
          { required: true, message: "请填写库存", trigger: "blur" }
        ]
      },
      is_show: false,//地图显示
      show: false,
      activeName:'first',//默认显示基本信息
      years:[],
      yearId:'',//保存标签页选中年份
      form1Show:false,
      yearValue:true,//是否有点击年份的数据
    };
  },
  components: { VDistpicker },
  created() {
    this.activeName = 'first';
    this.form1Show= false;
    this.getYears();//获取年份数据
    this.getOptions();//获取店铺类型下拉框数据
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
    this.getData();
  },

  mounted() {},

  methods: {
    // 获取店铺类型
    getYears() {
      this.$axios.get("http://qunxin.lilinyun.com/webapi/Year/list", { params: {limit:20} }).then(res => {
        if (res.data.code == 0) {
          this.years = res.data.data;//获取店铺分类
        }
      });
    },

    // 获取店铺类型
    getOptions() {
      this.$axios.get("http://qunxin.lilinyun.com/webapi/Storetype/list", { params: {isAll:true} }).then(res => {
        if (res.data.code == 0) {
          this.options = res.data.data;//获取店铺分类
        }
      });
    },

    //加载数据时调用
    getData() {
      var that = this;
      // 编辑
      if (this.id != 0) {
        var param = {
          id: this.$route.query.id,
          sessionId: this.sessionId
        };
        this.$axios.get(this.url + "/info?random=" + Math.random(), { params: param }).then(res => {
          if (res.data.code == 0) {
            console.log(res.data.data);
            // 赋值给form
            that.form = res.data.data;
            // 赋值给经纬度
            that.lng = res.data.data.lng;
            that.lat = res.data.data.lat;
            console.log(that.lng,that.lat);

            if(res.data.data.images.length > 0){
              res.data.data.images.map((item,index)=>{
                item.image = 'http://qunxin.lilinyun.com' + item.image;
              })
              that.images = res.data.data.images;
            }else{
              that.images = [];
            }
          }
        });
      } else {
        this.form = {};//清空表单
        this.images = [];//清空图片
      }
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    //确定提交
    onSubmit(formName) {
      // 编辑
      if (this.id != 0) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            // 获取sessionId
            this.form.sessionId = this.sessionId;
            this.form.dryGarbage = this.form.dry_garbage;//干垃圾
            this.form.wetGarbage = this.form.wet_garbage;//湿垃圾
            this.form.storeTypeId = this.form.store_type_id;//店铺类型
            this.form.contactName = this.form.contact_name;//联系人
            // 获取请求参数
            const params = this.form;

            this.$axios.post(this.url + "/update", params).then(res => {
              var result = res.data;
              console.log(result);
              if (result.code != 0) {
                this.$message.error(result.data);
              } else {
                  this.$message.success(`修改成功`);
                  this.images = [];//清空图片
                  this.$router.push("/cloth-list");
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
            this.form.name = this.form.name;//店名
            this.form.address = this.form.address;//详细地址
            this.form.contactName = this.form.contact_name;//联系人
            this.form.phone = this.form.phone;//电话
            this.form.storeTypeId = this.form.store_type_id;//店铺类型
            this.form.license = this.form.license;//营业执照
            this.form.sessionId = this.sessionId;
            this.form.area = this.form.area;//店铺面积
            this.form.dryGarbage = this.form.dry_garbage;//干垃圾
            this.form.wetGarbage = this.form.wet_garbage;//湿垃圾
            this.form.remark = this.form.remark;//备注
            this.form.lat = this.form.lat;//纬度
            this.form.lng = this.form.lng;//经度
            this.form.images = this.images;//图片

            const params = this.form;
            console.log(params);

            this.$axios.post(this.url + "/insert", params).then(res => {
              console.log(res);
              var result = res.data;
              if (result.code != 0) {
                this.$message.error(result.data);
              } else {
                  this.$message.success(`添加成功`);
                  this.$router.push("/cloth-list");
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
      this.$router.push("/cloth-list");
    },

    infoWindowClose() {
      this.show = false;
    },
    infoWindowOpen() {
      this.show = true;
    },
  },
  watch: {

  },
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
