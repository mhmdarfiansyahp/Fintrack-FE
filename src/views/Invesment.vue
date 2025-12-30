<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import Swal from 'sweetalert2'
import { PlusCircle, Edit3, Trash2, } from 'lucide-vue-next'
import invesmentService from '@/Service/invesment'
import { NButton, NModal } from 'naive-ui'

const invesments = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = ref(5)
const selected = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const amountInvested = ref('')
const CurrentValue = ref('')

const errors = ref({
    type: false,
    name: false,
    amount_invested: false,
    current_value: false,
    units: false,
    purchase_date: false,
})

const resetErrors = () => {
    errors.value = {
        type: false,
        name: false,
        amount_invested: false,
        current_value: false,
        units: false,
        purchase_date: false,
    }
}

const form = ref({
    id: null,
    type: '',
    name: '',
    amount_invested: null,
    current_value: null,
    units: null,
    purchase_date: null,
})

const filtered = computed(() => {
    if (!search.value) return invesments.value
    return invesments.value.filter((d) => d.name.toLowerCase().includes(search.value.toLowerCase()))
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

const onAmountInvested = (value) => {
    formatAmount(value, 'amount_invested', amountInvested)
}

const onCurrentValue = (value) => {
    formatAmount(value, 'current_value', CurrentValue)
}


const fetchInvesments = async () => {
    loading.value = true
    try {
        const response = await invesmentService.getAll()
        invesments.value = response.data.data || response.data
    } catch (error) {
        console.error('Error fetching invesments:', error)
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
    resetErrors()
    isEditMode.value = false
    form.value = {
        id: null,
        type: '',
        name: '',
        amount_invested: null,
        current_value: null,
        units: null,
        purchase_date: null,
    }
    showModal.value = true
}

const openEditModal = (invesment) => {
    resetErrors()
    isEditMode.value = true
    form.value = { ...invesment }
    amountInvested.value = invesment.amount_invested
        ? new Intl.NumberFormat('id-ID').format(invesment.amount_invested)
        : ''

    CurrentValue.value = invesment.current_value
        ? new Intl.NumberFormat('id-ID').format(invesment.current_value)
        : ''
    showModal.value = true
}

const closeModal = () => {
    resetErrors()
    showModal.value = false
}

const handleSubmit = async (id) => {
    errors.value.type = false
    errors.value.name = false
    errors.value.amount_invested = false
    errors.value.current_value = false
    errors.value.units = false
    errors.value.purchase_date = false

    if (!isEditMode.value) {
        if (!form.value.type) {
            errors.value.type = true
            return
        }
        if (!form.value.name?.trim()) {
            errors.value.name = true
            return
        }
        if (!form.value.amount_invested) {
            errors.value.amount_invested = true
            return
        }
        if (!form.value.current_value) {
            errors.value.current_value = true
            return
        }
        if (!form.value.units) {
            errors.value.units = true
            return
        }
        if (!form.value.purchase_date) {
            errors.value.purchase_date = true
            return
        }
    }
    const payload = {
        ...form.value,
        purchase_date: formatDateLocal(form.value.purchase_date),
    }

    try {
        if (isEditMode.value) {
            await invesmentService.update(form.value.id, payload)
        } else {
            await invesmentService.create(payload)
        }

        await fetchInvesments()

        showModal.value = false
        await nextTick()
        await new Promise((resolve) => setTimeout(resolve, 250))
        Swal.fire({
            icon: 'success',
            title: isEditMode.value ? 'Invesment updated successfully' : 'Invesment added successfully',
            timer: 1500,
            showConfirmButton: false,
        })
    } catch (error) {
        console.error('Error submitting form:', error)
    }
}

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
            await invesmentService.delete(id)
            await fetchInvesments()
            Swal.fire({
                icon: 'success',
                title: 'Invesment deleted successfully',
                timer: 1500,
                showConfirmButton: false,
            })
        } catch (error) {
            console.error('Error deleting invesment:', error)
        }
    }
}

const headers = [
    { text: 'No', value: 'no', width: 60 },
    { text: 'Type', value: 'type' },
    { text: 'Name', value: 'name' },
    { text: 'Amount Invested', value: 'amount_invested' },
    { text: 'Current Value', value: 'current_value' },
    { text: 'Units', value: 'units' },
    { text: 'Purchase Date', value: 'purchase_date' },
    { text: 'Note', value: 'note' },
    { text: 'Actions', value: 'action' },
]

onMounted(fetchInvesments)
</script>

<template>
    <div class="p-4 sm:p-6 bg-white shadow-md rounded-lg space-y-5">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-blue-700">Invesments</h1>
            <NButton :style="{ backgroundColor: '#105472', color: 'white' }" @click="openAddModal">
                <template #icon>
                    <NIcon>
                        <PlusCircle />
                    </NIcon>
                </template>
                Add Invesment
            </NButton>
        </div>


        <div class="flex justify-end">
            <NInput v-model:value="search" placeholder="Search..." clearable style="width: 220px" />
        </div>

        <div class="bg-white rounded shadow-sm overflow-x-auto p-4 border-radius-md">
            <EasyDataTable :headers="headers" :items="paged" table-class-name="table-custom" hide-footer checkbox
                v-model:items-selected="selected" :loading="loading">
                <template #item-type="{ type }">
                    <span :class="{
                        'text-blue-600 font-semibold': type === 'stock',
                        'text-green-600 font-semibold': type === 'mutual fund',
                        'text-purple-600 font-semibold': type === 'bond',
                    }">
                        {{ type }}
                    </span>
                </template>

                <template #item-name="{ name }">
                    <span class="font-medium">{{ name }}</span>
                </template>

                <template #item-amount_invested="{ amount_invested }">
                    {{ formatRupiah(amount_invested) }}
                </template>

                <template #item-current_value="{ current_value }">
                    {{ formatRupiah(current_value) }}
                </template>

                <template #item-purchase_date="{ purchase_date }">
                    {{
                        new Date(purchase_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })
                    }}
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
                        <button class="px-2 py-1 bg-red-600 text-white rounded flex items-center gap-1"
                            @click="handleDelete(id)">
                            <Trash2 class="w-4 h-4" /> Delete
                        </button>
                    </div>
                </template>
            </EasyDataTable>
        </div>

        <NModal v-model:show="showModal" preset="card" :mask-closable="false"
            :title="isEditMode ? 'Edit Investment' : 'Add Investment'" style="width: 400px;">
            <div class="space-y-4">
                <div>
                    <label class="block mb-1 font-medium">Type
                        <span v-if="!isEditMode" class="text-red-500">*</span>
                    </label>
                    <NSelect v-model:value="form.type" :options="[
                        { label: 'Stocks', value: 'stock' },
                        { label: 'Bonds', value: 'bond' },
                        { label: 'Mutual Funds', value: 'mutual fund' },
                    ]" placeholder="Select Type" :status="errors.type ? 'error' : undefined" />
                </div>

                <div>
                    <label class="block mb-1 font-medium">Name
                        <span v-if="!isEditMode" class="text-red-500">*</span>
                    </label>
                    <NInput v-model:value="form.name" placeholder="Investment Name"
                        :status="errors.name ? 'error' : undefined" />
                </div>

                <div>
                    <label class="block mb-1 font-medium">Amount Invested
                        <span v-if="!isEditMode" class="text-red-500">*</span>
                    </label>
                    <NInput v-model:value="amountInvested" placeholder="Amount Invested"
                        :status="errors.amount_invested ? 'error' : undefined" @input="onAmountInvested" />
                </div>

                <div>
                    <label class="block mb-1 font-medium">Current Value
                        <span v-if="!isEditMode" class="text-red-500">*</span>
                    </label>
                    <NInput v-model:value="CurrentValue" placeholder="Current Value"
                        :status="errors.current_value ? 'error' : undefined" @input="onCurrentValue" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Units
                        <span v-if="!isEditMode" class="text-red-500">*</span>
                    </label>
                    <NInput v-model:value="form.units" placeholder="Units"
                        :status="errors.units ? 'error' : undefined" />
                </div>

                <div>
                    <label class="block mb-1 font-medium">Purchase Date
                        <span v-if="!isEditMode" class="text-red-500">*</span>
                    </label>
                    <NDatePicker v-model:value="form.purchase_date" type="date" placeholder="Select Date"
                        :status="errors.purchase_date ? 'error' : undefined" style="width: 100%;" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Note</label>
                    <NInput v-model:value="form.note" type="textarea" placeholder="Additional Note" />
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