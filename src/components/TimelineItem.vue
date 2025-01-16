
<template>
  <div class="relative flex items-start mb-8">
    <div class="absolute -left-3 mt-1.5">
      <span :class="`flex h-6 w-6 items-center justify-center rounded-full ${active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`">
        <i :class="icon"></i>
      </span>
    </div>
    <div class="ml-6">
      <h3 :class="`text-lg font-semibold ${active ? 'text-primary' : 'text-gray-600'}`">{{ title }}</h3>
      <div class="flex items-center text-sm text-gray-500">
        <span>{{ formatDate(date) }}</span>
        <span class="mx-2">•</span>
        <span>{{ timeAgo }}</span>
      </div>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  date: string
  timeAgo: string
  active: boolean
}>()

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}
</script>
