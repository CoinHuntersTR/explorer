
<template>
  <div class="relative flex pb-4">
    <div class="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
    <div class="relative flex items-center">
      <div class="h-8 w-8 rounded-full border-2 flex items-center justify-center" :class="active ? 'border-primary bg-primary/10' : 'border-gray-300'">
        <div class="w-3 h-3 bg-primary rounded-full"></div>
      </div>
      <div class="ml-4 flex min-w-0 flex-1 justify-between space-x-4">
        <div>
          <p class="text-sm font-medium">{{ label }}</p>
          <p class="text-sm text-gray-500">{{ time ? formatDate(time) : '' }}</p>
        </div>
        <slot name="extra"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

defineProps<{
  label: string
  time?: string
  active?: boolean
}>()

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), 'PPpp')
  } catch {
    return dateStr
  }
}
</script>
