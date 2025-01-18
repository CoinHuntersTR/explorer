<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  colors: {
    type: Array,
    default: () => ['#4CAF50', '#f44336', '#ff9800', '#9e9e9e'],
  },
  height: {
    type: [String, Number],
    default: 200,
  },
})

const chartData = computed(() => props.data.map(item => item.value))
const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
  },
  colors: props.colors,
  labels: props.data.map(item => item.name),
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
      },
    },
  },
}))
</script>

<template>
  <VueApexCharts
    type="donut"
    :options="chartOptions"
    :series="chartData"
    :height="height"
  />
</template>