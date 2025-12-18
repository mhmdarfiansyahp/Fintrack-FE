<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton, NModal, NInput, NSelect, NSpace, NPagination, NIcon } from 'naive-ui'
import { PlusCircle, Edit3, Trash2, X } from 'lucide-vue-next'

import Swal from 'sweetalert2'
import CategoryService from '@/Service/category'

const categories = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(5)
const selected = ref([])

const errors = ref({
  name: false,
  type: false,
})
const showModal = ref(false)
const isEditMode = ref(false)
const form = ref({ id: null, name: '', type: 'income' })

// ---- Data table logic ----
const filtered = computed(() => {
  if (!search.value) return categories.value
  return categories.value.filter((c) => c.name.toLowerCase().includes(search.value.toLowerCase()))
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value).map((item, index) => ({
    ...item,
    no: start + index + 1, // nomor urut otomatis
  }))
})

// ---- CRUD ----
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await CategoryService.getAll()
    categories.value = res.data.data || res.data
  } catch (err) {
    Swal.fire('Error', 'Failed to load categories', 'error')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditMode.value = false
  form.value = { id: null, name: '', type: 'income' }
  showModal.value = true
}

const openEditModal = (row) => {
  isEditMode.value = true
  form.value = { ...row }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  errors.value.name = false
  errors.value.type = false

  if (!isEditMode.value) {
    if (!form.value.name?.trim()) {
      errors.value.name = true
      return
    }

    if (!form.value.type) {
      errors.value.type = true
      return
    }
  }

  try {
    if (isEditMode.value) {
      await CategoryService.update(form.value.id, form.value)
    } else {
      await CategoryService.create(form.value)
    }

    await fetchCategories()

    showModal.value = false
    await nextTick() // tunggu DOM update
    await new Promise((resolve) => setTimeout(resolve, 250)) // tunggu animasi 250ms
    Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'Category updated successfully.' : 'Category added successfully.',
      showConfirmButton: false, // tombol OK tidak ditampilkan
      timer: 1500, // otomatis hilang setelah 1.5 detik
    })
  } catch (error) {
    Swal.fire('Error', 'Failed to save category.', 'error')
  }
}

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This category will be deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    try {
      await CategoryService.delete(id)
      await fetchCategories()
      Swal.fire({
        icon: 'success',
        title: 'Category has been deleted.',
        showConfirmButton: false, // tombol OK tidak ditampilkan
        timer: 1500, // otomatis hilang setelah 1.5 detik
      })
    } catch {
      Swal.fire('Error', 'Failed to delete category.', 'error')
    }
  }
}

const headers = [
  { text: 'No', value: 'no', width: 60 },
  { text: 'Name', value: 'name' },
  { text: 'Type', value: 'type' },
  { text: 'Actions', value: 'actions' },
]

onMounted(fetchCategories)
</script>

<template>
  <div class="p-4 sm:p-6 bg-white shadow-md rounded-lg space-y-5">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <p class="text-2xl font-semibold text-blue-700">Categories</p>
      <NButton :style="{ backgroundColor: '#105472', color: 'white' }" @click="openAddModal">
        <template #icon>
          <NIcon>
            <PlusCircle />
          </NIcon>
        </template>
        Add Category
      </NButton>
    </div>

    <!-- Search -->
    <div class="flex justify-end">
      <NInput v-model:value="search" placeholder="Search..." clearable style="width: 220px" />
    </div>
    <div class="bg-white rounded shadow-sm overflow-x-auto p-4 border-radius-md">
      <EasyDataTable
        :headers="headers"
        :items="paged"
        table-class-name="table-custom"
        hide-footer
        checkbox
        v-model:items-selected="selected"
        :loading="loading"
      >
        <template #item-type="{ type }">
          <span
            :class="
              type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'
            "
          >
            {{ type }}
          </span>
        </template>

        <template #item-actions="{ id, ...row }">
          <div class="flex gap-2 items-center">
            <!-- agar horizontal -->
            <button
              class="px-2 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
              @click="openEditModal({ ...row, id })"
            >
              <Edit3 size="16" /> Edit
            </button>

            <button
              class="px-2 py-1 bg-red-600 text-white rounded flex items-center gap-1"
              @click="handleDelete(id)"
            >
              <Trash2 size="16" /> Delete
            </button>
          </div>
        </template>
      </EasyDataTable>
    </div>

    <!-- Modal -->
    <NModal
      v-model:show="showModal"
      preset="card"
      :mask-closable="false"
      :title="isEditMode ? 'Edit Category' : 'Add Category'"
      style="width: 400px"
    >
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-1"
            >Category Name
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <NInput
            v-model:value="form.name"
            placeholder="Enter category name"
            :status="errors.name ? 'error' : undefined"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Type</label>
          <NSelect
            v-model:value="form.type"
            :options="[
              { label: 'Income', value: 'income' },
              { label: 'Expense', value: 'expense' },
            ]"
            :status="errors.type ? 'error' : undefined"
          />
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
  <!-- Pagination -->
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
