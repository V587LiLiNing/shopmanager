import Vue from 'vue'
import Router from 'vue-router'
import { Message } from 'element-ui'

// import Login from '../components/login.vue'
import Login from '@/components/login.vue'
import Home from '@/components/home.vue'
import Users from '@/components/users.vue'
import Rights from '@/components/rights.vue'
import Roles from '@/components/roles.vue'
import Goodslist from '@/components/goodslist.vue'
import Goodsadd from '@/components/goodsadd.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [
        {
          name: 'users',
          path: '/users',
          component: Users
        },
        {
          name: 'rights',
          path: '/rights',
          component: Rights
        },
        {
          name: 'roles',
          path: '/roles',
          component: Roles
        },
        {
          name: 'goods',
          path: '/goods',
          component: Goodslist
        },
        {
          name: 'goodsadd',
          path: '/goodsadd',
          component: Goodsadd
        }
      ]
    },
    {
      name: 'login',
      path: '/login',
      component: Login
    }
  ]
})
// 路由的导航守卫
// to->要去的路由配置对象
// from-> 当前 路由配置对象
// next-> 方法next()-> 让路由配置继续生效
router.beforeEach((to, from, next) => {
  // console.log('路由守卫执行')

  // 如果去登录, -> next()
  if (to.name === 'login') {
    next()
  } else {
    // 如果去的不是登录
    // 1. !token去登录
    const token = localStorage.getItem('token')
    if (!token) {
      // 提示
      Message.warning('请先登录!')

      router.push({
        name: 'login'
      })
      return
    }

    next()
    // 2. token -> next()
  }
})

export default router

// 效果: 当标签变化时, ->login -> router / index.js 匹配成功 - > heme.vue-> beforeMount()

// 在某个路由配置生效前, 判断token

// 判断是否有token
// if (!localStorage.getItem('token')) {
//   this.$router.push({
//     name: 'login'
//   })
//   this.$message.warning('请先登录')
// }
