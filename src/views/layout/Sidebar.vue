<script setup>
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Settings,
  Folder,
  CreditCard,
  Heart,
  PiggyBank,
  User,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const props = defineProps({
  isOpen: Boolean,
  windowWidth: Number,
})
const emit = defineEmits(['update:isOpen'])
const handleLinkClick = () => {
  if (props.windowWidth < 1024) {
    emit('update:isOpen', false) // kirim event ke parent
  }
}

</script>

<template>
  <aside :class="[
    'fixed top-0 left-0 bottom-0 h-full bg-white border-r border-gray-200 shadow-md transition-all duration-300 ease-in-out z-40 flex flex-col overflow-y-auto',
    props.windowWidth < 1024
      ? props.isOpen
        ? 'translate-x-0 w-64'
        : '-translate-x-full w-64'
      : props.isOpen
        ? 'w-64'
        : 'w-20'//fungsionalitas collapse sidebar sda,
  ]">
    <!-- Logo -->
    <div class="p-4 text-xl font-bold border-b flex items-center justify-center">
      <span v-if="props.isOpen || props.windowWidth < 1024">Fintrack</span>
      <span v-else class="text-gray-700 text-sm font-semibold">FT</span>
    </div>

    <!-- Navigation -->
    <nav class="mt-4 space-y-1 flex-1">
      <RouterLink to="/" v-slot="{ isActive }">
        <div @click="handleLinkClick" :class="[
          'flex items-center transition cursor-pointer',
          isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100',
          props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3',
        ]">
          <LayoutDashboard class="w-5 h-5" />
          <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">Dashboard</span>
        </div>
      </RouterLink>

      <RouterLink to="/transaction" v-slot="{ isActive }">
        <div :class="[
          'flex items-center transition cursor-pointer rounded-md',
          isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100',
          props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3',
        ]">
          <Wallet class="w-5 h-5" />
          <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">Transactions</span>
        </div>
      </RouterLink>

      <RouterLink to="/categories" v-slot="{ isActive }">
        <div :class="[
          'flex items-center transition cursor-pointer rounded-md',
          isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100',
          props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3',
        ]">
          <Folder class="w-5 h-5" />
          <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">Categories</span>
        </div>
      </RouterLink>

      <RouterLink to="/debts" v-slot="{ isActive }">
        <div :class="[
          'flex items-center transition cursor-pointer rounded-md',
          isActive ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100',
          props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3',
        ]">
          <CreditCard class="w-5 h-5" />
          <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">Debts</span>
        </div>
      </RouterLink>

      <RouterLink to="/wishlists" class="flex items-center text-gray-700 hover:bg-gray-100 transition"
        :class="props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3'">
        <Heart class="w-5 h-5" />
        <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">Wishlists</span>
      </RouterLink>

      <RouterLink to="/investments" class="flex items-center text-gray-700 hover:bg-gray-100 transition"
        :class="props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3'">
        <PiggyBank class="w-5 h-5" />
        <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">Investments</span>
      </RouterLink>

      <!-- <RouterLink
        to="/analytics"
        class="flex items-center text-gray-700 hover:bg-gray-100 transition"
        :class="props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3'"
      >
        <BarChart3 class="w-5 h-5" />
        <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">Analytics</span>
      </RouterLink>

      <RouterLink
        to="/settings"
        class="flex items-center text-gray-700 hover:bg-gray-100 transition"
        :class="props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3'"
      >
        <Settings class="w-5 h-5" />
        <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">Settings</span>
      </RouterLink> -->

      <RouterLink to="/user" class="flex items-center text-gray-700 hover:bg-gray-100 transition"
        :class="props.isOpen || props.windowWidth < 1024 ? 'px-4 py-2' : 'justify-center py-3'">
        <User class="w-5 h-5" />
        <span v-if="props.isOpen || props.windowWidth < 1024" class="ml-3">User</span>
      </RouterLink>
    </nav>
  </aside>
</template>
