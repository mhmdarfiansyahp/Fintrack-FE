<template>
  <div class="p-6 space-y-6 bg-white shadow-md rounded-lg">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-lg font-semibold text-blue-700">List Transaction</h1>
      <button
        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        @click="openAddModal"
      >
        <PlusCircle class="w-5 h-5" />
        Add Transaction
      </button>
    </div>

    <!-- Search bar -->
    <div class="flex justify-end mb-3">
      <input
        v-model="search"
        type="text"
        placeholder="Search..."
        class="border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>

    <!-- Table / Loading -->
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
            <th class="px-3 py-2">Category Name</th>
            <th class="px-3 py-2 ">Amount</th>
            <th class="px-3 py-2 text-center">Date</th>
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
            <!-- No -->
            <td class="px-3 py-2 text-center text-gray-700">
              {{ (currentPage - 1) * rowsPerPage + index + 1 }}
            </td>

            <!-- Category Name -->
            <td class="px-3 py-2 text-gray-700">
              {{ categories.find((cat) => cat.id === c.category_id)?.name}}
            </td>

            <!-- Amount -->
            <td class="px-3 py-2 text-gray-700">
              {{
                new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                  c.amount,
                )
              }}
            </td>

            <!-- Date -->
            <td class="px-3 py-2 text-center text-gray-700">
              {{
                new Date(c.date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              }}
            </td>

            <!-- Note -->
            <td class="px-3 py-2 text-gray-700 truncate max-w-xs">
              {{ c.note || '-' }}
            </td>

            <!-- Action -->
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
            <td colspan="6" class="text-center py-6 text-gray-500">No transactions found.</td>
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

    <!-- Modal Tambah / Edit Category -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <!-- Tombol close -->
        <button
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          @click="closeModal"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Judul -->
        <h2 class="text-lg font-semibold mb-4">
          {{ isEditMode ? 'Edit Transaction' : 'Add Transaction' }}
        </h2>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Category Name -->
          <div>
            <label class="block text-sm font-medium mb-1">Category Name</label>
            <select
              v-model="form.category_id"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled selected>Select category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium mb-1">Amount</label>
            <input
              v-model.number="form.amount"
              type="number"
              placeholder="Enter amount"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium mb-1">Date</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
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

        <!-- Buttons -->
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
import TransaktionService from '@/Service/transaction.js'
import CategoryService from '@/Service/category.js'

// State utama
const trancaction = ref([])
const categories = ref([])
const loading = ref(false)

// Pagination & search
const search = ref('')
const rowsPerPage = ref(5)
const currentPage = ref(1)

onMounted(async () => {
  await fetchTransactions()
  await fetchCategories()
})

const filteredTransactions = computed(() => {
  if (!search.value) return trancaction.value
  return trancaction.value.filter((c) => c.name.toLowerCase().includes(search.value.toLowerCase()))
})
const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / rowsPerPage.value))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredTransactions.value.slice(start, start + rowsPerPage.value)
})

// Modal logic
const showModal = ref(false)
const isEditMode = ref(false)
const form = ref({ id: null, category_id: '', amount: '', date: '' })

const openAddModal = () => {
  isEditMode.value = false
  form.value = { id: null, category_id: '', amount: '', date: '' }
  showModal.value = true
}

const openEditModal = (trancaction) => {
  isEditMode.value = true
  form.value = { ...trancaction }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// 🔹 Load data dari backend
const fetchTransactions = async () => {
  loading.value = true
  try {
    const res = await TransaktionService.getAll()
    trancaction.value = res.data.data || res.data // tergantung struktur response Laravel
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Failed to load transactions', 'error')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await CategoryService.getAll()
    categories.value = res.data.data || res.data
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Failed to load categories', 'error')
  }
}

// 🔹 Submit form
const handleSubmit = async () => {
  if (!form.value.category_id || !form.value.amount || !form.value.date) {
    Swal.fire({
      icon: 'warning',
      title: 'Oops!',
      text: 'Please fill in transaction name.',
      timer: 1500,
      showConfirmButton: false,
    })
    return
  }

  try {
    if (isEditMode.value) {
      await TransaktionService.update(form.value.id, form.value)
      Swal.fire({
        icon: 'success',
        title: 'Trasaction updated successfully!',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      })
    } else {
      await TransaktionService.create(form.value)
      Swal.fire({
        icon: 'success',
        title: 'Trasaction added successfully!',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      })
    }

    await fetchTransactions()
    closeModal()
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Something went wrong!',
      timer: 1800,
      showConfirmButton: false,
    })
  }
}

// 🔹 Delete data
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This transaction will be deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      await TransaktionService.delete(id)
      await fetchTransactions()
      Swal.fire('Deleted!', 'Transaction has been deleted.', 'success')
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'Failed to delete transaction.', 'error')
    }
  }
}

// 🔹 Load data pertama kali
onMounted(fetchTransactions)
</script>
