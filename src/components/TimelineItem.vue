
<template>
  <div class="relative">
    <div class="absolute -left-10 mt-1">
      <div :class="`w-6 h-6 rounded-full flex items-center justify-center ${
        active ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
      }`">
        <i :class="icon" class="text-xs"></i>
      </div>
    </div>
    <div class="ml-4">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <p class="text-sm text-gray-500">{{ format.toDay(date) }}</p>
      <p class="text-xs text-gray-400">{{ timeAgo }}</p>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormatter } from '@/stores'

const format = useFormatter()

defineProps({
  icon: String,
  active: Boolean,
  title: String,
  date: String,
  timeAgo: String
})
</script>
