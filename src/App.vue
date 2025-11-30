<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <Sidebar :isOpen="isSidebarOpen" :windowWidth="windowWidth" />

    <!-- Main Content -->
    <div
      :class="[
        'flex-1 transition-all duration-300',
        windowWidth >= 1024 ? (isSidebarOpen ? 'ml-64' : 'ml-20') : 'ml-0',
      ]"
    >
      <Navbar
        :isSidebarOpen="isSidebarOpen"
        :windowWidth="windowWidth"
        @toggleSidebar="toggleSidebar"
      />

      <main class="p-6 mt-14 overflow-x-auto">
          <NConfigProvider>

        <router-view />
          </NConfigProvider>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/views/layout/Sidebar.vue'
import Navbar from '@/views/layout/Navbar.vue'
import { NConfigProvider } from 'naive-ui'

const isSidebarOpen = ref(true)
const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
  if (windowWidth.value < 1024) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
