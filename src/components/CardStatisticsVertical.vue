
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { controlledComputed } from '@vueuse/core'

interface Props {
  title: string;
  color?: string;
  icon: string;
  stats: string;
  change?: number;
  subtitle?: string;
  blockTime?: number;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
});

const isPositive = controlledComputed(
  () => props.change,
  () => Math.sign(props.change || 0) === 1
);
</script>

<template>
  <div class="stats-card p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <div
          class="relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
          :class="`bg-${props.color}/10`"
        >
          <Icon :icon="props.icon" class="text-2xl" :class="`text-${props.color}`" />
        </div>
        <div v-if="props.change" class="ml-4">
          <span :class="isPositive ? 'text-success' : 'text-error'" class="flex items-center text-sm font-semibold">
            {{ isPositive ? `+${props.change}` : props.change }}%
            <Icon :icon="isPositive ? 'mdi:trend-up' : 'mdi:trend-down'" class="ml-1" />
          </span>
        </div>
      </div>
      <div v-if="props.blockTime" class="block-time">
        {{ props.blockTime }}s
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-2xl font-semibold">{{ props.stats }}</h3>
      <p class="text-gray-600 dark:text-gray-300">{{ props.title }}</p>
      <p v-if="props.subtitle" class="text-sm text-gray-500 dark:text-gray-400">
        {{ props.subtitle }}
      </p>
    </div>
  </div>
</template>
