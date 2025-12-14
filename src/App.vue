<template>
  <div class="flex min-h-screen overflow-hidden"> <!-- cegah body ikut geser -->
    <!-- Sidebar -->
    <Sidebar :isOpen="isSidebarOpen" :windowWidth="windowWidth" v-model:isOpen="isSidebarOpen"/>

    <!-- Main Content -->
    <div
      :class="[
        'flex flex-col flex-1 transition-all duration-300 min-w-0', // min-w-0 penting!
        windowWidth >= 1024
          ? (isSidebarOpen ? 'ml-64' : 'ml-20')
          : 'ml-0',
      ]"
    >
      <Navbar
        :isSidebarOpen="isSidebarOpen"
        :windowWidth="windowWidth"
        @toggleSidebar="toggleSidebar"
      />

      <!-- konten tidak boleh overflow-x, biarkan anaknya yang scroll -->
      <main class="p-4 mt-14 w-full overflow-hidden">
        <NConfigProvider>
          <div class="w-full overflow-x-auto"> <!-- container scroll -->
            <router-view />
          </div>
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
  isSidebarOpen.value = windowWidth.value >= 1024 // auto collapse saat kecil
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

<style>
/* mencegah geser halaman */
html, body {
  overflow-x: hidden;
}
</style>
