import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export const constantRouterMap =
  [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/',
      component: resolve => require(['../components/common/Home.vue'], resolve),
      meta: { title: '自述文件' },
      children: [
        {
          path: '/dashboard',
          component: resolve => require(['../components/page/Dashboard.vue'], resolve),
          meta: {
            title: '系统首页' ,
            requiresAuth: true
          }
        },
        {// 路政人员管理
          path: '/staff-list',
          component: resolve => require(['../components/page/Staff/staffList.vue'], resolve),
          meta: {
            title: '路政人员管理',
            requiresAuth: true
          }
        },
        {// 服装管理
          path: '/cloth-list',
          component: resolve => require(['../components/page/Staff/clothList.vue'], resolve),
          meta: {
            title: '服装管理',
            requiresAuth: true
          }
        },
      ]
    },
    {
      path: '/login',
      component: resolve => require(['../components/page/Login.vue'], resolve)
    }

  ]


let router = new Router({
  scrollBehavior: () => ({
      y: 0
  }),
  routes: constantRouterMap
})

//路由全局守卫
router.beforeEach(async(to, from, next) => {

  let hasRequiresAuth = to.matched.some(record => record.meta.requiresAuth) //需要 登录权限 的控制
  let userInfo = localStorage.getItem("userInfo");
  if (hasRequiresAuth) {
      if (!userInfo) { // 无登录 直接返回登录页
          Vue.prototype.$message({
              type: "error",
              message: "请先登录"
          })
          next({
              path: '/login',
              query: {
                  redirect: to.fullPath
              }
          })
          return
      }
  }
  next()
})

export default router
