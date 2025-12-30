<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { PlusCircle, Edit3, Trash2 } from 'lucide-vue-next'
import WishlistService from '@/Service/wishlist'
import { NButton, NInput, NModal } from 'naive-ui'

const wishlist = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(5)
const selected = ref([])
const targetAmountDisplay = ref('')
const savedAmountDisplay = ref('')

const errors = ref({
  item_name: false,
  target_amount: false,
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
  item_name: '',
  target_amount: null,
  saved_amount: null,
  target_date: null,
  status: 'ongoing',
})

const filtered = computed(() => {
  if (!search.value) return wishlist.value
  return wishlist.value.filter((d) => d.item_name.toLowerCase().includes(search.value.toLowerCase()))
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value).map((item, index) => ({
    ...item,
    no: start + index + 1,
  }))
})

const formatAmount = (value, field, displayRef) => {
  const raw = value.replace(/\D/g, '')
  form.value[field] = raw ? Number(raw) : null
  displayRef.value = raw
    ? new Intl.NumberFormat('id-ID').format(raw)
    : ''
}

const onTargetAmountInput = (value) => {
  formatAmount(value, 'target_amount', targetAmountDisplay)
}

const onSavedAmountInput = (value) => {
  formatAmount(value, 'saved_amount', savedAmountDisplay)
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
    item_name: '',
    target_amount: null,
    saved_amount: null,
    target_date: null,
    status: 'ongoing',
  }
  showModal.value = true
}

const openEditModal = (row) => {
  isEditMode.value = true
  resetErrors()
  form.value = { ...row }
  targetAmountDisplay.value = row.target_amount
    ? new Intl.NumberFormat('id-ID').format(row.target_amount)
    : ''

  savedAmountDisplay.value = row.saved_amount
    ? new Intl.NumberFormat('id-ID').format(row.saved_amount)
    : ''
  showModal.value = true
}

const closeModal = () => {
  resetErrors()
  showModal.value = false
}

const fetchWishlist = async () => {
  loading.value = true
  try {
    const res = await WishlistService.getAll()
    wishlist.value = res.data.data || res.data
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Failed to load Wishlist', 'error')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  errors.value.item_name = false
  errors.value.target_amount = false

  if (!isEditMode.value) {
    if (!form.value.item_name?.trim()) {
      errors.value.item_name = true
      return
    }

    if (!form.value.target_amount || form.value.target_amount <= 0) {
      errors.value.target_amount = true
      return
    }
  }

  const payload = {
    ...form.value,
    target_date: formatDateLocal(form.value.target_date),

  }

  try {
    if (isEditMode.value) {
      await WishlistService.update(form.value.id, payload)
    } else {
      await WishlistService.create(payload)
    }

    await fetchWishlist()
    showModal.value = false
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 250))
    Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'Wishlist updated successfully.' : 'Wishlist added successfully.',
      showConfirmButton: false,
      timer: 1500,
    })
  } catch (error) {
    Swal.fire('Error', 'Failed to save wishlist.', 'error')
  }
}

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
      Swal.fire({
        icon: 'success',
        title: 'Wishlist has been deleted.',
        showConfirmButton: false,
        timer: 1500, // otomatis hilang setelah 1.5 detik
      })
    } catch {
      Swal.fire('Error', 'Failed to delete wishlist.', 'error')
    }
  }
}

const headers = [
  { text: 'No', value: 'no', width: 60 },
  { text: 'Item Name', value: 'item_name' },
  { text: 'Target Amount', value: 'target_amount', align: 'right' },
  { text: 'Saved Amount', value: 'saved_amount', align: 'right' },
  { text: 'Target Date', value: 'target_date', align: 'center' },
  { text: 'Status', value: 'status', align: 'center' },
  { text: 'Note', value: 'note' },
  { text: 'Action', value: 'action', align: 'center' },
]

onMounted(fetchWishlist)
</script>

<template>
  <div class="p-6 space-y-6 bg-white shadow-md rounded-lg">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-blue-700">Whishlist</h1>
      <NButton :style="{ backgroundColor: '#105472', color: 'white' }" @click="openAddModal">
        <template #icon>
          <NIcon>
            <PlusCircle />
          </NIcon>
        </template>
        Add Wishlist
      </NButton>
    </div>

    <!-- Search -->
    <div class="flex justify-end">
      <NInput v-model:value="search" placeholder="Search..." clearable style="width: 220px" />
    </div>

    <div class="bg-white rounded shadow-sm overflow-x-auto p-4 border-radius-md">
      <EasyDataTable :headers="headers" :items="paged" table-class-name="table-custom" hide-footer checkbox
        v-model:items-selected="selected" :loading="loading">
        <template #item-item_name="{ item_name }">
          {{ item_name }}
        </template>
        <template #item-target_amount="{ target_amount }">
          {{ formatRupiah(target_amount) }}
        </template>
        <template #item-saved_amount="{ saved_amount }">
          {{ formatRupiah(saved_amount) }}
        </template>
        <template #item-target_date="{ target_date }">
          {{
            new Date(target_date).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          }}
        </template>
        <template #item-status="{ status }">
          <span :class="[
            'px-2 py-0.5 rounded-full font-medium text-sm',
            status === 'achieved'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700',
          ]">
            {{ status }}
          </span>
        </template>
        <template #item-note="{ note }">
          {{ note || '-' }}
        </template>
        <template #item-action="{ id, ...row }">
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

    <NModal v-model:show="showModal" preset="card" :mask-closable="false"
      :title="isEditMode ? 'Edit Wishlist' : 'Add Wishlist'" style="width: 400px;">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Item Name
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <NInput v-model:value="form.item_name" placeholder="Enter item name"
            :status="errors.item_name ? 'error' : undefined" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Target Amount
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <NInput v-model:value="targetAmountDisplay" placeholder="Enter target amount" @input="onTargetAmountInput"
            :status="errors.target_amount ? 'error' : undefined" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Saved Amount</label>
          <NInput v-model:value="savedAmountDisplay" placeholder="Enter saved amount" @input="onSavedAmountInput" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Target Date</label>
          <NDatePicker v-model:value="form.target_date" type="date" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <NSelect v-model:value="form.status" :options="[
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Achieved', value: 'achieved' },
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