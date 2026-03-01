import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Categories from '@/views/Categories.vue'
import Transaction from '@/views/Transaction.vue'
import Debts from '@/views/Debts.vue'
import Wishlist from '@/views/Wishlist.vue'
import Invesment from '@/views/Invesment.vue'
import Login from '@/views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    component: Categories,
    meta: { requiresAuth: true }
  },
  {
    path: '/transaction',
    component: Transaction,
    meta: { requiresAuth: true }
  },
  {
    path: '/debts',
    component: Debts,
    meta: { requiresAuth: true }
  },
  {
    path: '/wishlists',
    component: Wishlist,
    meta: { requiresAuth: true }
  },
  {
    path: '/invesments',
    component: Invesment,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 🔐 Route Guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.name === 'Login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router