<script setup>
import { Bell, User, Menu, X } from 'lucide-vue-next'

const props = defineProps({
  isSidebarOpen: Boolean,
  windowWidth: Number,
})

const emit = defineEmits(['toggleSidebar'])
</script>

<template>
  <nav
    :class="[
      'fixed top-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3 transition-all duration-300',
      windowWidth >= 1024 ? (isSidebarOpen ? 'left-64' : 'left-20') : 'left-0',
    ]"
  >
    <!-- Left Section -->
    <div class="flex items-center gap-3">
      <!-- Tombol Menu -->
      <button
        class="p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition"
        @click="emit('toggleSidebar')"
      >
        <component
          :is="windowWidth < 1024 && isSidebarOpen ? X : Menu"
          class="w-6 h-6"
        />
      </button>

      <!-- Logo hanya tampil di mobile/tablet -->
      <span
        v-if="windowWidth < 1024"
        class="text-lg font-bold text-gray-800 select-none"
      >
        Fintrack
      </span>
    </div>

    <!-- Right Section -->
    <div class="flex items-center gap-4 pr-2">
      <button
        class="relative p-2 text-gray-600 rounded-full hover:bg-gray-100 transition"
      >
        <Bell class="w-5 h-5" />
        <span
          class="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
        >
          3
        </span>
      </button>

      <button
        class="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
      >
        <User class="w-6 h-6 text-gray-700" />
        <span class="hidden md:inline text-sm font-medium text-gray-800">
          Admin
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
nav {
  backdrop-filter: blur(8px);
}
</style>
