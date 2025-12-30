<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { PlusCircle, Edit3, Trash2, } from 'lucide-vue-next'
import DebtsService from '@/Service/debts'
import { NButton, NModal } from 'naive-ui'

// State utama
const debts = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(5)
const selected = ref([])
const amountDisplay = ref('')

const errors = ref({
  person_name: false,
  type: false,
})

const resetErrors = () => {
  errors.value = {
    person_name: false,
    type: false,
  }
}

const showModal = ref(false)
const isEditMode = ref(false)

const form = ref({
  id: null,
  person_name: '',
  type: 'debt',
  amount: null,
  due_date: null,
  status: 'pending',
})

const filtered = computed(() => {
  if (!search.value) return debts.value
  return debts.value.filter((d) => d.person_name.toLowerCase().includes(search.value.toLowerCase()))
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value).map((item, index) => ({
    ...item,
    no: start + index + 1, // nomor urut otomatis
  }))
})

const onAmountInput = (value) => {
  const raw = value.replace(/\D/g, '')

  form.value.amount = raw ? Number(raw) : null

  amountDisplay.value = raw
    ? new Intl.NumberFormat('id-ID').format(raw)
    : ''
}

const fetchDebts = async () => {
  loading.value = true
  try {
    const res = await DebtsService.getAll()
    debts.value = res.data.data || res.data
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Failed to load debts', 'error')
  } finally {
    loading.value = false
  }
}

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)

const formatDateLocal = (date) => {
  if (!date) return null
  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const openAddModal = () => {
  isEditMode.value = false
  resetErrors()
  form.value = {
    id: null,
    person_name: '',
    type: 'debt',
    amount: null,
    due_date: null,
    status: 'pending',
  }
  showModal.value = true
}

const openEditModal = (debt) => {
  isEditMode.value = true
  resetErrors()
  form.value = { ...debt }
  amountDisplay.value = debt.amount
    ? new Intl.NumberFormat('id-ID').format(debt.amount)
    : ''
  showModal.value = true
}

const closeModal = () => {
  resetErrors()
  showModal.value = false
}

const handleSubmit = async () => {
  errors.value.person_name = false
  errors.value.type = false

  if (!isEditMode.value) {
    if (!form.value.person_name?.trim()) {
      errors.value.person_name = true
      return
    }

    if (!form.value.type) {
      errors.value.type = true
      return
    }
  }

  const payload = {
    ...form.value,
    due_date: formatDateLocal(form.value.due_date),

  }

  try {
    if (isEditMode.value) {
      await DebtsService.update(form.value.id, payload)
    } else {
      await DebtsService.create(payload)
    }

    await fetchDebts()

    showModal.value = false
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 250))
    Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'Debt updated successfully.' : 'Debt added successfully.',
      showConfirmButton: false, // tombol OK tidak ditampilkan
      timer: 1500, // otomatis hilang setelah 1.5 detik
    })
  } catch (error) {
    Swal.fire('Error', 'Failed to save debt.', 'error')
  }
}

// 🔹 Delete data
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This debt will be deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      await DebtsService.delete(id)
      await fetchDebts()
      Swal.fire({
        icon: 'success',
        title: 'Debt has been deleted.',
        showConfirmButton: false, // tombol OK tidak ditampilkan
        timer: 1500, // otomatis hilang setelah 1.5 detik
      })
    } catch {
      Swal.fire('Error', 'Failed to delete debt.', 'error')
    }
  }
}

const headers = [
  { text: 'No', value: 'no', width: 60 },
  { text: 'Name', value: 'name' },
  { text: 'Type', value: 'type' },
  { text: 'Amount', value: 'amount' },
  { text: 'Date', value: 'date' },
  { text: 'Status', value: 'status' },
  { text: 'Note', value: 'note' },
  { text: 'Actions', value: 'actions' },
]

onMounted(fetchDebts)
</script>

<template>
  <div class="p-4 sm:p-6 bg-white shadow-md rounded-lg space-y-5">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-blue-700">Debts</h1>
      <NButton :style="{ backgroundColor: '#105472', color: 'white' }" @click="openAddModal">
        <template #icon>
          <NIcon>
            <PlusCircle />
          </NIcon>
        </template>
        Add Debt
      </NButton>
    </div>

    <!-- Search bar -->
    <div class="flex justify-end">
      <NInput v-model:value="search" placeholder="Search..." clearable style="width: 220px" />
    </div>

    <!-- Table / Loading -->
    <div class="bg-white rounded shadow-sm overflow-x-auto p-4 border-radius-md">
      <EasyDataTable :headers="headers" :items="paged" table-class-name="table-custom" hide-footer checkbox
        v-model:items-selected="selected" :loading="loading">
        <template #item-name="{ person_name }">
          {{ person_name }}
        </template>
        <template #item-type="{ type }">
          <span :class="type === 'debt' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'
            ">
            {{ type }}
          </span>
        </template>

        <template #item-amount="{ amount }">
          {{ formatRupiah(amount) }}
        </template>

        <template #item-date="{ due_date }">
          {{
            new Date(due_date).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          }}
        </template>

        <template #item-status="{ status }">
          <span :class="[
            'px-2 py-0.5 rounded-full font-medium text-sm',
            status === 'paid'
              ? 'bg-green-100 text-green-700'
              : status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700',
          ]">
            {{ status }}
          </span>
        </template>

        <template #item-note="{ note }">
          {{ note || '-' }}
        </template>

        <template #item-actions="{ id, ...row }">
          <div class="flex gap-2 items-center">
            <!-- agar horizontal -->
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
          <label class="block text-sm font-medium mb-1">Person Name
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <NInput v-model:value="form.person_name" placeholder="Enter person name"
            :status="errors.person_name ? 'error' : undefined" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Type
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <NSelect v-model:value="form.type" :options="[
            { label: 'Debt', value: 'debt' },
            { label: 'Receivable', value: 'receivable' },
          ]" placeholder="Select type" :status="errors.type ? 'error' : undefined" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Amount</label>
          <NInput v-model:value="amountDisplay" placeholder="Enter amount" @input="onAmountInput" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Due Date</label>
          <NDatePicker v-model:value="form.due_date" type="date" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <NSelect v-model:value="form.status" :options="[
            { label: 'Pending', value: 'pending' },
            { label: 'Paid', value: 'paid' },
          ]" placeholder="Select status" />
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