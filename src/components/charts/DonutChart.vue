<script lang="ts" setup>
import ApexCharts from 'vue3-apexcharts';
import { computed } from 'vue';
import { useBaseStore } from '@/stores';
import { getDonutChartConfig } from './apexChartConfig';

const props = defineProps(['series', 'labels']);

const baseStore = useBaseStore();

const expenseRationChartConfig = computed(() => {
  const theme = baseStore.theme;
  return getDonutChartConfig(theme, props?.labels);
});
</script>

<template>
  <ApexCharts
    type="donut"
    height="410"
    :options="expenseRationChartConfig"
    :series="series"
  />
</template>

<script lang="ts">
export default {
  name: 'DonetChart',
};
</script>
<template>
  <apexchart
    type="donut"
    :options="chartOptions"
    :series="chartData"
    :height="height"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

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
