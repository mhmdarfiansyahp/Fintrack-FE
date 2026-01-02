<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <!-- <p class="text-gray-500 text-sm">Overview of your financial activity</p> -->
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-gray-600 font-medium text-sm">Month:</label>
          <select v-model="selectedMonth"
            class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none">
            <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-gray-600 font-medium text-sm">Week:</label>
          <select v-model="selectedWeek"
            class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none">
            <option v-for="week in weeks" :key="week" :value="week">{{ week }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Daily Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <div class="bg-white p-5 rounded-2xl shadow hover:shadow-md transition">
        <p class="text-gray-500 text-sm">Today's Income</p>
        <h2 class="text-2xl font-semibold mt-2">${{ dailyIncome }}</h2>
      </div>
      <div class="bg-white p-5 rounded-2xl shadow hover:shadow-md transition">
        <p class="text-gray-500 text-sm">Today's Expense</p>
        <h2 class="text-2xl font-semibold mt-2">${{ dailyExpense }}</h2>
      </div>
      <div class="bg-white p-5 rounded-2xl shadow hover:shadow-md transition">
        <p class="text-gray-500 text-sm">Balance</p>
        <h2 class="text-2xl font-semibold mt-2">${{ balance }}</h2>
      </div>
      <div class="bg-white p-5 rounded-2xl shadow hover:shadow-md transition">
        <p class="text-gray-500 text-sm">Savings Rate</p>
        <h2 class="text-2xl font-semibold mt-2">{{ savingsRate }}%</h2>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Weekly Income vs Expense -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Weekly Overview</h3>
        <div ref="lineChart"></div>
      </div>

      <!-- Expense Category Donut -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Expense Categories</h3>
        <div ref="donutChart"></div>
      </div>
    </div>

    <!-- DataTables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Debts -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Debts</h3>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in debts" :key="item.id">
              <td class="px-4 py-2">{{ item.person_name }}</td>
              <td class="px-4 py-2">
                Rp {{ Number(item.amount).toLocaleString('id-ID') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Wishlist -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Wishlist</h3>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Progress</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in wishlist" :key="item.id">
              <td class="px-4 py-2">{{ item.item_name }}</td>
              <td class="px-4 py-2">{{ item.progress }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Stocks -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Stocks</h3>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Symbol</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Value</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in stocks" :key="item.symbol">
              <td class="px-4 py-2">{{ item.symbol }}</td>
              <td class="px-4 py-2">{{ item.name }}</td>
              <td class="px-4 py-2">${{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mutual Funds -->
      <div class="bg-white p-6 rounded-2xl shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Mutual Funds</h3>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Value</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in mutualFunds" :key="item.name">
              <td class="px-4 py-2">{{ item.name }}</td>
              <td class="px-4 py-2">${{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import ApexCharts from 'apexcharts';
import transactionService from '@/Service/transaction'
import debtServices from '@/Service/debts';
import wishlistService from '@/Service/wishlist';

// Filters
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const selectedMonth = ref('Jan');
const selectedWeek = ref('Week 1');

// Daily stats
const dailyIncome = ref(120);
const dailyExpense = ref(80);
const balance = ref(dailyIncome.value - dailyExpense.value);
const savingsRate = ref(Math.round((balance.value / dailyIncome.value) * 100));

// Quick lists
const debts = ref([])

const fetchDebts = async () => {
  try {
    const res = await debtServices.getTopDebts() 
    debts.value = res.data.data
  } catch (err) {
    console.error('Failed to fetch debts', err)
  }
}

const wishlist = ref([]);

const fetchWishlist = async () => {
  try {
    const res = await wishlistService.getTopWishlist();
    wishlist.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch wishlist', err);
  }
};


const stocks = ref([
  { symbol: 'AAPL', name: 'Apple', value: 150 },
  { symbol: 'TSLA', name: 'Tesla', value: 120 }
]);

const mutualFunds = ref([
  { name: 'Mutual Fund ABC', value: 1000 },
  { name: 'Mutual Fund XYZ', value: 500 }
]);

// Chart refs
const lineChart = ref(null);
const donutChart = ref(null);
const expenseCategories = ref([])
let lineApex = null;
let donutApex = null;

const weeklyData = ref({
  income: [],
  expenses: [],
  categories: []
})

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


const updateCharts = () => {
  if (!lineApex) {
    lineApex = new ApexCharts(lineChart.value, {
      chart: { type: 'line', height: 300, toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#10B981', '#EF4444'],
      grid: { borderColor: '#E5E7EB' },
      legend: { position: 'top' },
      xaxis: { categories: weeklyData.value.categories },
      series: [
        { name: 'Income', data: weeklyData.value.income },
        { name: 'Expense', data: weeklyData.value.expenses }
      ]
    })

    lineApex.render()
  } else {
    lineApex.updateOptions({
      xaxis: { categories: weeklyData.value.categories }
    })

    lineApex.updateSeries([
      { name: 'Income', data: weeklyData.value.income },
      { name: 'Expense', data: weeklyData.value.expenses }
    ])
  }
}

const updateDonut = () => {
  if (!donutChart.value || !expenseCategories.value.length) return

  const rawValues = expenseCategories.value.map(i => Number(i.value))
  const labels = expenseCategories.value.map(i => i.name)

  const total = rawValues.reduce((a, b) => a + b, 0)
  const series = rawValues.map(v => ((v / total) * 100).toFixed(2))

  if (!donutApex) {
    donutApex = new ApexCharts(donutChart.value, {
      chart: { type: 'donut', height: 300 },
      series: series.map(Number),
      labels,

      dataLabels: {
        enabled: true,
        formatter: val => `${val.toFixed(1)}%`
      },

      tooltip: {
        y: {
          formatter: (_, opts) => {
            const index = opts.seriesIndex
            return new Intl.NumberFormat('id-ID').format(rawValues[index])
          }
        }
      },

      legend: { position: 'bottom' }
    })
    donutApex.render()
  } else {
    donutApex.updateSeries(series.map(Number))
    donutApex.updateOptions({ labels })
  }
}

const fetchWeekly = async () => {
  try {
    const res = await transactionService.getWeekly()

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.original

    if (!Array.isArray(data)) {
      console.error('Weekly API is not returning array:', res.data)
      return
    }

    weeklyData.value.income = Array(7).fill(0)
    weeklyData.value.expenses = Array(7).fill(0)
    weeklyData.value.categories = [...days]

    data.forEach(item => {
      const index = new Date(item.date).getDay()
      weeklyData.value.income[index] += Number(item.income)
      weeklyData.value.expenses[index] += Number(item.expense)
    })

    updateCharts()
  } catch (err) {
    console.error('Failed load weekly data', err)
  }
}

const fetchExpenseCategories = async () => {
  const res = await transactionService.getExpenseCategories()
  expenseCategories.value = res.data
  updateDonut()
}

onMounted(() => {
  fetchWeekly()
  fetchExpenseCategories()
  fetchDebts()
  fetchWishlist()
});

// watch([selectedMonth, selectedWeek], () => {
//   // TODO: Update weeklyData and expenseCategories dynamically
//   fetchWeekly()
// });
</script>
