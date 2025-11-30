<template>
  <div class="p-6 space-y-6 bg-white shadow-md rounded-lg">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-lg font-semibold text-blue-700">List Wishlist</h1>
      <button
        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        @click="openAddModal"
      >
        <PlusCircle class="w-5 h-5" />
        Add Wishlist
      </button>
    </div>

    <!-- Search -->
    <div class="flex justify-end mb-3">
      <input
        v-model="search"
        type="text"
        placeholder="Search..."
        class="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>

    <!-- Loading -->
    <div class="overflow-x-auto min-h-[200px] flex justify-center items-center" v-if="loading">
      <div class="flex flex-col items-center text-gray-600">
        <svg
          class="animate-spin h-8 w-8 text-blue-600 mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span class="text-sm font-medium">Loading data...</span>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-base text-left border-collapse">
        <thead>
          <tr class="text-gray-700 font-semibold border-b border-gray-300 bg-gray-50">
            <th class="px-3 py-2 text-center">No</th>
            <th class="px-3 py-2">Item Name</th>
            <th class="px-3 py-2 text-right">Target Amount</th>
            <th class="px-3 py-2 text-right">Saved Amount</th>
            <th class="px-3 py-2 text-center">Target Date</th>
            <th class="px-3 py-2 text-center">Status</th>
            <th class="px-3 py-2">Note</th>
            <th class="px-3 py-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(c, index) in paginatedData"
            :key="c.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition"
          >
            <td class="px-3 py-2 text-center">{{ (currentPage - 1) * rowsPerPage + index + 1 }}</td>
            <td class="px-3 py-2 text-gray-700">{{ c.item_name }}</td>
            <td class="px-3 py-2 text-right text-gray-700">
              {{
                new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                  c.target_amount,
                )
              }}
            </td>
            <td class="px-3 py-2 text-right text-gray-700">
              {{
                new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                  c.saved_amount,
                )
              }}
            </td>
            <td class="px-3 py-2 text-center text-gray-700">
              {{
                new Date(c.target_date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              }}
            </td>
            <td class="px-3 py-2 text-center">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full font-medium text-sm',
                  c.status === 'achieved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700',
                ]"
              >
                {{ c.status }}
              </span>
            </td>
            <td class="px-3 py-2 text-gray-700">{{ c.note || '-' }}</td>
            <td class="px-3 py-2 text-center">
              <div class="flex justify-center gap-2">
                <button
                  class="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs"
                  @click="openEditModal(c)"
                >
                  <Edit3 class="w-4 h-4" /> Edit
                </button>
                <button
                  class="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-md text-xs"
                  @click="handleDelete(c.id)"
                >
                  <Trash2 class="w-4 h-4" /> Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0">
            <td colspan="8" class="text-center py-6 text-gray-500">No records found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4 text-sm text-gray-600">
      <div>
        Rows per page:
        <select v-model="rowsPerPage" class="border border-gray-300 rounded-md p-1 ml-1">
          <option>5</option>
          <option>10</option>
          <option>20</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="px-2 py-1 border rounded-md"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ‹
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="px-2 py-1 border rounded-md"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          ›
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <button
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          @click="closeModal"
        >
          <X class="w-5 h-5" />
        </button>

        <h2 class="text-lg font-semibold mb-4">
          {{ isEditMode ? 'Edit Wishlist' : 'Add Wishlist' }}
        </h2>

        <div class="space-y-4">
          <!-- Item Name -->
          <div>
            <label class="block text-sm font-medium mb-1">Item Name</label>
            <input
              v-model="form.item_name"
              type="text"
              placeholder="Enter item name"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <!-- Target Amount -->
          <div>
            <label class="block text-sm font-medium mb-1">Target Amount</label>
            <input
              v-model.number="form.target_amount"
              type="number"
              placeholder="Enter target amount"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <!-- Saved Amount -->
          <div>
            <label class="block text-sm font-medium mb-1">Saved Amount</label>
            <input
              v-model.number="form.saved_amount"
              type="number"
              placeholder="Enter saved amount"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium mb-1">Target Date</label>
            <input
              v-model="form.target_date"
              type="date"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium mb-1">Status</label>
            <select
              v-model="form.status"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="ongoing">Ongoing</option>
              <option value="achieved">Achieved</option>
            </select>
          </div>

          <!-- Note -->
          <div>
            <label class="block text-sm font-medium mb-1">Note</label>
            <textarea
              v-model="form.note"
              placeholder="Enter note (optional)"
              rows="2"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md" @click="closeModal">
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            @click="handleSubmit"
          >
            {{ isEditMode ? 'Update' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { PlusCircle, Edit3, Trash2, X } from 'lucide-vue-next'
import WishlistService from '@/Service/wishlist'

// State utama
const categories = ref([])
const loading = ref(false)

// Pagination & search
const search = ref('')
const rowsPerPage = ref(5)
const currentPage = ref(1)

const filteredCategories = computed(() => {
  if (!search.value) return categories.value
  return categories.value.filter((c) => c.name.toLowerCase().includes(search.value.toLowerCase()))
})
const totalPages = computed(() => Math.ceil(filteredCategories.value.length / rowsPerPage.value))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredCategories.value.slice(start, start + rowsPerPage.value)
})

// Modal logic
const showModal = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const form = ref({
  id: null,
  item_name: '',
  target_amount: '',
  saved_amount: 0,
  target_date: '',
  status: 'ongoing',
})

const openAddModal = () => {
  isEditMode.value = false
  form.value = {
    id: null,
    item_name: '',
    target_amount: '',
    saved_amount: 0,
    target_date: '',
    status: 'ongoing',
  }
  showModal.value = true
}

const openEditModal = (debt) => {
  isEditMode.value = true
  form.value = { ...debt }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// 🔹 Load data dari backend
const fetchWishlist = async () => {
  loading.value = true
  try {
    const res = await WishlistService.getAll()
    categories.value = res.data.data || res.data
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Failed to load Wishlist', 'error')
  } finally {
    loading.value = false
  }
}

// 🔹 Submit form
const handleSubmit = async () => {
  if (isSubmitting.value) return
  if (!form.value.item_name.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Oops!',
      text: 'Please fill in Wishlist name.',
      timer: 1500,
      showConfirmButton: false,
    })
    return
  }

  try {
    isSubmitting.value = true
    if (isEditMode.value) {
      await WishlistService.update(form.value.id, form.value)
      Swal.fire({
        icon: 'success',
        title: 'Wishlist updated successfully!',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      })
    } else {
      await WishlistService.create(form.value)
      Swal.fire({
        icon: 'success',
        title: 'Wishlist added successfully!',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      })
    }

    await fetchWishlist()
    closeModal()
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Something went wrong!',
      timer: 1800,
      showConfirmButton: false,
    })
  } finally {
    isSubmitting.value = false
  }
}

// 🔹 Delete data
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This wishlist will be deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      await WishlistService.delete(id)
      await fetchWishlist()
      Swal.fire('Deleted!', 'Wishlist has been deleted.', 'success')
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'Failed to delete wishlist.', 'error')
    }
  }
}

// 🔹 Load data pertama kali
onMounted(fetchWishlist)
</script>
