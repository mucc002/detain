<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="collapseChage">
      <i class="el-icon-menu"></i>
    </div>

    <div class="logo">奉贤区路政执法平台</div>
    <div class="header-right">
      <div class="header-user-con">
        <!-- 全屏显示 -->
        <div class="btn-fullscreen" @click="handleFullScreen">
          <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
            <i class="el-icon-rank"></i>
          </el-tooltip>
        </div>

        <!-- 用户头像 -->
        <div class="user-avator">
          <img src="static/img/img.jpg">
        </div>
        <!-- 用户名下拉菜单 -->
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{username}}
            <i class="el-icon-caret-bottom"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="userInfo">更改密码</el-dropdown-item>
            <el-dropdown-item command="loginout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 更改密码弹出框 -->
    <el-dialog title="更改密码" :visible.sync="editVisible" width="30%">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="原密码">
          <el-input v-model="form.oldPsw" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPsw" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="form.againPsw" type="password"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import bus from "../common/bus";
export default {
  data() {
    return {
      collapse: false,// 菜单栏是否折叠
      fullscreen: false,
      name: "",
      message: 2,
      userInfo: {},
      sessionId: null,
      form: {
        oldPsw: "",
        newPsw: "",
        againPsw: ""
      },
      editVisible: false,//修改密码的弹出框是否显示
      url: "/api/manage/admin/update_password",
    };
  },
  computed: {
    username() {
      // 获取用户名
      let username = localStorage.getItem("ms_userName");
      return username ? username : this.name;
    }
  },
  activated() {
    
  },
  created() {
    // 获取个人信息
    this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // 获取sessionId
    this.sessionId = localStorage.getItem("ms_session_id");
  },
  methods: {
    // 用户名下拉菜单选择事件
    handleCommand(command) {
      //退出登录
      if (command == "loginout") {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("ms_session_id");
        this.$router.push("/login");
      }
      //用户密码更改
      if (command == "userInfo") {
        // console.log('password');
        // 保存修改密码的对象
        this.form = {
          oldPsw: "",
          newPsw: "",
          againPsw: ""
        };
        // 修改密码弹框显示
        this.editVisible = true;
      }
    },

    // 侧边栏折叠
    collapseChage() {
      this.collapse = !this.collapse;
      // 组件之间通讯，将collapse设置为当前值
      bus.$emit("collapse", this.collapse);
    },
    // 全屏事件
    handleFullScreen() {
      let element = document.documentElement;
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          // IE11
          element.msRequestFullscreen();
        }
      }
      this.fullscreen = !this.fullscreen;
    },
    //点击确定更改密码
    saveEdit() {
      if (
        (this.form.newPsw == "" &&
          this.form.oldPsw == "" &&
          this.form.againPsw == "") ||
        this.form.oldPsw == ""
      ) {
        this.$message({
          message: "请输入原密码",
          type: "warning"
        });
      } else if (this.form.newPsw == "") {
        this.$message({
          message: "请输入新密码",
          type: "warning"
        });
      } else if (this.form.againPsw == "") {
        this.$message({
          message: "请输入确认密码",
          type: "warning"
        });
      } else if (this.form.newPsw == this.form.oldPsw) {
        this.$message({
          message: "新密码与原密码相同",
          type: "warning"
        });
      } else {
        // 如果新密码和重新输入密码相同
        if (this.form.newPsw == this.form.againPsw) {
          // 创建参数
          let param = {
            oldPassword:this.form.oldPsw,
            password:this.form.newPsw,
            rePassword:this.form.againPsw,
            sessionId: this.sessionId,
            isAdmin: this.userInfo.isAdmin,
            authGruopId: this.userInfo.authGruopId,
            status: this.userInfo.status,
            id:this.userInfo.id
          };
          // 提交修改密码请求
          this.$axios
            .post("http://qunxin.lilinyun.com/webapi/Admin/update", param)
            .then(res => {
              console.log(res.data);
              if (res.data.code != 0) {
                this.$message({
                  message: res.data.data,
                  type: "error"
                });
              } else {
                // 修改密码弹出框消失
                this.editVisible = false;
                this.$message({
                  message: '密码修改成功，请重新登录',
                  type: "success"
                });
                // 返回登陆界面
                this.$router.push("/login");
              }
            });
        } else {
          this.$message({
            message: "确认密码与新密码输入不一致",
            type: "warning"
          });
        }
      }
    }
  }
};
</script>
<style scoped>
.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  font-size: 22px;
  color: #fff;
}
.collapse-btn {
  float: left;
  padding: 0 21px;
  cursor: pointer;
  line-height: 70px;
}
.header .logo {
  float: left;
  width: 250px;
  line-height: 70px;
}
.header-right {
  float: right;
  padding-right: 50px;
}
.header-user-con {
  display: flex;
  height: 70px;
  align-items: center;
}
.btn-fullscreen {
  transform: rotate(45deg);
  margin-right: 5px;
  font-size: 24px;
}
.btn-bell,
.btn-fullscreen {
  position: relative;
  width: 30px;
  height: 30px;
  text-align: center;
  border-radius: 15px;
  cursor: pointer;
}
.btn-bell-badge {
  position: absolute;
  right: 0;
  top: -2px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #f56c6c;
  color: #fff;
}
.btn-bell .el-icon-bell {
  color: #fff;
}
.user-name {
  margin-left: 10px;
}
.user-avator {
  margin-left: 20px;
}
.user-avator img {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.el-dropdown-link {
  color: #fff;
  cursor: pointer;
}
.el-dropdown-menu__item {
  text-align: center;
}
</style>
