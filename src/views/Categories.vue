<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { NButton, NDataTable, NModal, NInput, NSelect, NSpace, NPagination, NIcon } from 'naive-ui'
import { PlusCircle, Edit3, Trash2, X } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import CategoryService from '@/Service/category'

const categories = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(5)

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
  return filtered.value.slice(start, start + pageSize.value)
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
  if (!form.value.name.trim()) {
    Swal.fire('Oops!', 'Please fill in category name.', 'warning')
    return
  }

  try {
    if (isEditMode.value) {
      await CategoryService.update(form.value.id, form.value)
      Swal.fire('Success', 'Category updated successfully.', 'success')
    } else {
      await CategoryService.create(form.value)
      Swal.fire('Success', 'Category added successfully.', 'success')
    }
    await fetchCategories()
    closeModal()
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
      Swal.fire('Deleted!', 'Category has been deleted.', 'success')
    } catch {
      Swal.fire('Error', 'Failed to delete category.', 'error')
    }
  }
}

const allSelected = ref(false)

// Modifikasi columns
const columns = [
  {
    title: h('input', {
      type: 'checkbox',
      checked: allSelected.value,
      onChange: (e) => {
        allSelected.value = e.target.checked
        paged.value.forEach((row) => (row.selected = e.target.checked))
      },
      class: 'cursor-pointer',
    }),
    key: 'select',
    width: 40,
    render: (row) =>
      h('input', {
        type: 'checkbox',
        checked: row.selected || false,
        onChange: (e) => {
          row.selected = e.target.checked
          // Update allSelected otomatis
          allSelected.value = paged.value.every((r) => r.selected)
        },
        class: 'cursor-pointer',
      }),
  },
  {
    title: 'No',
    key: 'no',
    render: (_, index) => (page.value - 1) * pageSize.value + index + 1,
    width: 60,
  },
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Type',
    key: 'type',
    render: (row) =>
      h(
        'span',
        {
          class: row.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium',
        },
        row.type,
      ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          NButton,
          {
            size: 'small',
            class: 'bg-blue-600 text-white rounded-md',
            onClick: () => openEditModal(row),
          },
          { icon: () => h(Edit3, { size: 16 }), default: () => 'Edit' },
        ),
        h(
          NButton,
          {
            size: 'small',
            style: {
              backgroundColor: '#E74C3C',
              color: 'white',
              borderRadius: '0.375rem',
            },
            onClick: () => handleDelete(row.id),
          },
          { icon: () => h(Trash2, { size: 16 }), default: () => 'Delete' },
        ),
      ]),
  },
]

onMounted(fetchCategories)
</script>

<template>
  <div class="p-4 sm:p-6 bg-white shadow-md rounded-lg space-y-5">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <p class="text-2xl font-bold">Categories</p>
      <NButton :style="{ backgroundColor: '#105472', color: 'white' }" @click="openAddModal">
        <template #icon>
          <NIcon><PlusCircle /></NIcon>
        </template>
        Add Category
      </NButton>
    </div>

    <!-- Search -->
    <div class="flex justify-end">
      <NInput v-model:value="search" placeholder="Search..." clearable style="width: 220px" />
    </div>

    <div class="bg-white rounded shadow-sm overflow-hidden p-4 border-radius-md">
      <NDataTable :columns="columns" :data="paged" size="medium" />
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
          <label class="block text-sm font-medium mb-1">Category Name</label>
          <NInput v-model:value="form.name" placeholder="Enter category name" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Type</label>
          <NSelect
            v-model:value="form.type"
            :options="[
              { label: 'Income', value: 'income' },
              { label: 'Expense', value: 'expense' },
            ]"
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
