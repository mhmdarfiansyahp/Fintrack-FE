import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Categories from '@/views/Categories.vue'
import Transaction from '@/views/Transaction.vue'
import Debts from '@/views/Debts.vue'
import Wishlist from '@/views/Wishlist.vue'
import Invesment from '@/views/Invesment.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
  },
  {
    path: '/transaction',
    name: 'Transaction',
    component: Transaction,
  },
  {
    path: '/debts',
    name: 'Debts',
    component: Debts,
  },
  {
    path: '/wishlists',
    name: 'Wishlist',
    component: Wishlist
  },
  {
    path: '/invesments',
    name: 'Invesment',
    component: Invesment
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
