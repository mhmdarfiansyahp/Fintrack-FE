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
          <select
            v-model="selectedMonth"
            class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
          >
            <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-gray-600 font-medium text-sm">Week:</label>
          <select
            v-model="selectedWeek"
            class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
          >
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
              <td class="px-4 py-2">{{ item.name }}</td>
              <td class="px-4 py-2">${{ item.amount }}</td>
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
              <td class="px-4 py-2">{{ item.name }}</td>
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
const debts = ref([
  { id: 1, name: 'Credit Card A', amount: 500 },
  { id: 2, name: 'Friend Loan', amount: 200 }
]);

const wishlist = ref([
  { id: 1, name: 'New Laptop', progress: 50 },
  { id: 2, name: 'Bicycle', progress: 30 }
]);

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
let lineApex = null;
let donutApex = null;

// Dummy chart data
const weeklyData = {
  income: [20, 25, 18, 22, 21, 23, 20],
  expenses: [15, 18, 16, 20, 19, 17, 18],
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
};

const expenseCategories = [
  { name: 'Food', value: 40 },
  { name: 'Transport', value: 25 },
  { name: 'Entertainment', value: 15 },
  { name: 'Others', value: 20 }
];

// Function to update charts
const updateCharts = () => {
  // Line chart
  const lineOptions = {
    chart: { type: 'line', height: 300, toolbar: { show: false } },
    series: [
      { name: 'Income', data: weeklyData.income },
      { name: 'Expense', data: weeklyData.expenses }
    ],
    colors: ['#10B981', '#EF4444'],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: weeklyData.categories },
    yaxis: { labels: { formatter: val => `$${val}` } },
    grid: { borderColor: '#E5E7EB' },
    legend: { position: 'top' },
    tooltip: { theme: 'light' }
  };
  if (lineApex) {
    lineApex.updateOptions({ series: lineOptions.series });
  } else {
    lineApex = new ApexCharts(lineChart.value, lineOptions);
    lineApex.render();
  }

  // Donut chart
  const donutOptions = {
    chart: { type: 'donut', height: 300 },
    series: expenseCategories.map(c => c.value),
    labels: expenseCategories.map(c => c.name),
    colors: ['#F59E0B', '#3B82F6', '#EF4444', '#10B981'],
    legend: { position: 'bottom' },
    tooltip: { theme: 'light' }
  };
  if (donutApex) {
    donutApex.updateOptions({ series: donutOptions.series, labels: donutOptions.labels });
  } else {
    donutApex = new ApexCharts(donutChart.value, donutOptions);
    donutApex.render();
  }
};

onMounted(() => {
  updateCharts();
});

watch([selectedMonth, selectedWeek], () => {
  // TODO: Update weeklyData and expenseCategories dynamically
  updateCharts();
});
</script>
