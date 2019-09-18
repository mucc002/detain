<template>
  <div class="login-wrap">
    <div class="ms-title">奉贤区路政执法平台</div>
    <div class="ms-login">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="0px"
        class="demo-ruleForm"
      >
        <el-form-item prop="username">
          <el-input v-model="ruleForm.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="密码"
            v-model="ruleForm.password"
            @keyup.enter.native="submitForm('ruleForm')"
          ></el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
        </div>
        <!--<p style="font-size:12px;line-height:30px;color:#999;">Tips : 用户名和密码随便填。</p>-->
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      ruleForm: {
        username: "",
        password: ""
      },
      rules: {
        // 用户名必填
        username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        // 密码必填
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
      }
    };
  },
  created() {//创建的时候执行
    localStorage.removeItem("ms_username");//去除用户名
    localStorage.removeItem("ms_access_token");//去除token
    localStorage.removeItem("ms_userInfo");//去除个人信息
  },
  methods: {
    // 登陆
    submitForm(formName) {
      var that = this;
      // 表单验证
      this.$refs[formName].validate(valid => {
        if (valid) {
          $.ajax({
            //请求方式
            type : "POST",
            //请求地址
            url : this.baseUrl+"RoadEquipment.asmx/Login",
            //数据，json字符串
            data : {
              username:this.ruleForm.username,
              password:this.ruleForm.password
            },
            //请求成功
            success : function(res) {
              if (res != 0){
                const data = $.parseJSON(res).ds[0];
                console.log(data);
                // 存储个人信息
                let userInfo = {
                  UserName: data.UserName,//姓名
                  RoleId: data.RoleId,//权限id
                  MenuId: data.MenuId,//菜单id
                  PersonnelId: data.PersonnelId,//个人id
                  Phone: data.Phone,//电话
                  Sex: data.Sex,//性别
                  Id: data.Id,//id
                  Department:data.Department,//部门
                  auth_group:data.auth_group//权限数组
                };
                // 将对象转成json数据格式
                userInfo = JSON.stringify(userInfo);
                // 存储个人信息
                localStorage.setItem("userInfo", userInfo);
                // 存储sessionId
                //localStorage.setItem("ms_session_id", result.data.session_id);
                // 跳转到默认页面
                that.$router.push("/");
              }else{
                that.$message.error("账号或密码错误！");
              }
            },
            //请求失败，包含具体的错误信息
            error : function(e){
              console.log(e.status);
              console.log(e.responseText);
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  }
};
</script>

<style scoped>
.login-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
.ms-title {
  position: absolute;
  top: 50%;
  width: 100%;
  margin-top: -230px;
  text-align: center;
  font-size: 30px;
  color: #fff;
}
.ms-login {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 300px;
  height: 160px;
  margin: -150px 0 0 -190px;
  padding: 40px;
  border-radius: 5px;
  background: #fff;
}
.login-btn {
  text-align: center;
}
.login-btn button {
  width: 100%;
  height: 36px;
}
</style>
