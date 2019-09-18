<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="collapse"
      background-color="#324157"
      text-color="#bfcbd9"
      active-text-color="#20a0ff"
      unique-opened
      router
    >
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-submenu :index="item.index" :key="item.index">
            <template slot="title">
              <i :class="item.icon"></i>
              <span slot="title">{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="(subItem,i) in item.subs"
              :key="i"
              :index="subItem.index"
            >{{ subItem.title }}
            <a href="http://admingarbage.lilinyun.com/index.html" style="display: block;color:#fff;" target="view_window">{{ subItem.tip }}</a>
            </el-menu-item>
          </el-submenu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon"></i>
            <span slot="title">{{ item.title }}</span>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import bus from "../common/bus";
export default {
  data() {
    return {
      collapse: false,//菜单栏是否隐藏
      items: []//需要显示的模块数组
    };
  },
  computed: {
    // 当前激活菜单index
    onRoutes() {
      return this.$route.path.replace("/", "");
    }
  },
  created() {
    // 通过 Event Bus 进行组件间通信，来折叠侧边栏
    bus.$on("collapse", msg => {
      this.collapse = msg;
    });

    // 获取权限id
    // var ruleIds = JSON.parse(
    //   localStorage.getItem("userInfo")
    // ).auth_group.rule_ids.split(",");

    // 获取角色类型
    var RoleId = JSON.parse(localStorage.getItem("userInfo")).RoleId;

    var dashboard = {
      icon: "el-icon-setting",
      index: "dashboard",
      title: "系统首页"
    };


    var itemsArr = [
      //路政装备管理
      {
        icon: "el-icon-tickets",
        index: "news",
        title: "路政装备管理",
        id: 8,
        subs: [
          {
            index: "staff-list",
            title: "路政人员管理"
          },
          {
            index: "cloth-list",
            title: "服装管理"
          },
        ]
      },
    ];

    var items = [];

    // 如果角色类型是超级管理员，加入人员管理manage
    // if (authGruopId == 1) {
      items.push(dashboard);
      //items.push(manage);
    // 如果不是超级管理员,只加入其他模块
    // }else{
    //   items.push(dashboard);
    // }

    // 遍历模块数组,如果当前权限数组包含此类id


    itemsArr.map((item, index) => {
      // if (ruleIds.indexOf(item.id.toString()) != -1) {
        items.push(item);
      // }
    });
    console.log("items", items);

    setTimeout(() => {
      this.items = items;
    }, 50);
  }
};
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
  width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 250px;
}
.sidebar > ul {
  height: 100%;
}
</style>
