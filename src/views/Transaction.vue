<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import Swal from 'sweetalert2'
import { PlusCircle, Edit3, Trash2, X } from 'lucide-vue-next'
import TransaktionService from '@/Service/transaction.js'
import CategoryService from '@/Service/category.js'

const trancaction = ref([])
const categories = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(5)
const selected = ref([])
const amountDisplay = ref('')

const errors = ref({
  category_id: false,
  amount: false,
  date: false,
})

const resetErrors = () => {
  errors.value = {
    category_id: false,
    amount: false,
    date: false,
  }
}

const showModal = ref(false)
const isEditMode = ref(false)
const form = ref({ id: null, category_id: '', amount: null, date: null })

onMounted(async () => {
  await fetchTransactions()
  await fetchCategories()
})

const filteredTransactions = computed(() => {
  if (!search.value) return trancaction.value
  return trancaction.value.filter((c) => c.name.toLowerCase().includes(search.value.toLowerCase()))
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize.value)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredTransactions.value.slice(start, start + pageSize.value).map((item, index) => ({
    ...item,
    no: start + index + 1,
  }))
})

const onAmountInput = (value) => {
  const raw = value.replace(/\D/g, '')
  form.value.amount = raw ? Number(raw) : null
  amountDisplay.value = raw
    ? new Intl.NumberFormat('id-ID').format(raw)
    : null
}

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}` // LOCAL DATE (AMAN)
}


const openAddModal = () => {
  isEditMode.value = false
  resetErrors()
  form.value = { id: null, category_id: '', amount: null, date: null }
  showModal.value = true
}

const openEditModal = (trancaction) => {
  isEditMode.value = true
  resetErrors()
  form.value = { ...trancaction }
  amountDisplay.value = trancaction.amount
    ? new Intl.NumberFormat('id-ID').format(trancaction.amount)
    : ''
  showModal.value = true
}

const closeModal = () => {
  resetErrors()
  showModal.value = false
}

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
  errors.value.category_id = false
  errors.value.amount = false
  errors.value.date = false
  if (!isEditMode.value) {
    if (!form.value.category_id) {
      errors.value.category_id = true
      return
    }
    if (!form.value.amount || form.value.amount <= 0) {
      errors.value.amount = true
      return
    }
    if (!form.value.date) {
      errors.value.date = true
      return
    }
  }

  const payload = {
    ...form.value,
    date: formatDate(form.value.date),
  }

  try {
    if (isEditMode.value) {
      await TransaktionService.update(form.value.id, payload)
    } else {
      await TransaktionService.create(payload)
    }

    await fetchTransactions()
    showModal.value = false
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 250))
    Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'Transaction updated!' : 'Transaction added!',
      timer: 1800,
      showConfirmButton: false,
      timer: 1500,
    })
  } catch (error) {
    Swal.fire('Error', 'Failed to save transaction.', 'error')
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
      Swal.fire({
        icon: 'success',
        title: 'Transaction has been deleted.',
        showConfirmButton: false, // tombol OK tidak ditampilkan
        timer: 1500, // otomatis hilang setelah 1.5 detik
      })
    } catch {
      Swal.fire('Error', 'Failed to delete transaction.', 'error')
    }
  }
}

const headers = [
  { text: 'No', value: 'no', align: 'center' },
  { text: 'Category Name', value: 'category_name' },
  { text: 'Amount', value: 'amount' },
  { text: 'Date', value: 'date', align: 'center' },
  { text: 'Note', value: 'note' },
  { text: 'Action', value: 'actions' },
]

onMounted(fetchTransactions)
</script>

<template>
  <div class="p-4 sm:p-6 bg-white shadow-md rounded-lg space-y-5">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-blue-700">Transaction</h1>
      <NButton :style="{ backgroundColor: '#105472', color: 'white' }" @click="openAddModal">
        <template #icon>
          <NIcon>
            <PlusCircle />
          </NIcon>
        </template>
        Add Transaction
      </NButton>
    </div>

    <!-- Search bar -->
    <div class="flex justify-end">
      <NInput v-model:value="search" placeholder="Search..." clearable style="width: 220px" />
    </div>

    <div class="bg-white rounded shadow-sm overflow-x-auto p-4 border-radius-md">
      <EasyDataTable :headers="headers" :items="paged" table-class-name="table-custom" hide-footer checkbox
        v-model:items-selected="selected" :loading="loading">
        <template #item-category_name="{ category_id }">
          {{categories.find((cat) => cat.id === category_id)?.name}}
        </template>
        <template #item-amount="{ amount }">
          {{ formatRupiah(amount) }}
        </template>
        <template #item-date="{ date }">
          {{
            new Date(date).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          }}
        </template>
        <template #item-note="{ note }">
          {{ note || '-' }}
        </template>

        <template #item-actions="{ id, ...row }">
          <div class="flex gap-2 items-center">
            <button class="px-2 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
              @click="openEditModal({ ...row, id })">
              <Edit3 class="w-4 h-4" /> Edit
            </button>
            <button class="px-2 py-1 bg-red-600 text-white rounded flex items-center gap-1" @click="handleDelete(id)">
              <Trash2 class="w-4 h-4" /> Delete
            </button>
          </div>
        </template>
      </EasyDataTable>
    </div>

    <NModal v-model:show="showModal" preset="card" :mask-closable="false" :title="isEditMode ? 'Edit Debt' : 'Add Debt'"
      style="width: 400px">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-1">Category Name
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <select v-model="form.category_id" :class="[
            'w-full rounded-md px-3 py-2 focus:outline-none',
            errors.category_id
              ? 'border border-red-500 ring-1 ring-red-400'
              : 'border border-gray-300 focus:ring-2 focus:ring-blue-400'
          ]">
            <option value="" disabled selected>Select category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Amount
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <NInput v-model:value="amountDisplay" placeholder="Enter amount" @input="onAmountInput"
            :status="errors.amount ? 'error' : undefined" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Due Date
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <NDatePicker v-model:value="form.date" type="date" class="w-full"
            :class="errors.date ? 'border border-red-500 rounded ring-1 ring-red-400' : ''" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Note</label>
          <NInput v-model:value="form.note" type="textarea" placeholder="Enter note" rows="3" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <NButton @click="closeModal">Cancel</NButton>
          <NButton type="primary" @click="handleSubmit">
            {{ isEditMode ? 'Update' : 'Add' }}
          </NButton>
        </div>
      </div>
    </NModal>
  </div>
  <div class="flex justify-center mt-4">
    <NPagination v-model:page="page" :page-count="pageCount" />
  </div>
</template>

<style>
/* untuk kolom checkbox pada EasyDataTable */
.table-custom th:first-child,
.table-custom td:first-child {
  width: 45px !important;
  /* bebas ubah misal 30, 40 */
  max-width: 45px !important;
  text-align: center;
}

.table-custom {
  --easy-table-header-background-color: #e5e7eb;
  --easy-table-header-font-size: 15px;

  --easy-table-body-row-font-size: 13px;

  --easy-table-body-row-height: 48px;
  font-family:
    v-sans,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol' !important;
}
</style>