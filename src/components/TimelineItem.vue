
<template>
  <div class="relative flex pb-8">
    <div class="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
    <div class="relative flex items-center">
      <div class="h-8 w-8 rounded-full border-2 flex items-center justify-center" :class="active ? 'border-primary bg-primary/10' : 'border-gray-300'">
        <i :class="icon" class="text-sm"></i>
      </div>
      <div class="ml-4 flex min-w-0 flex-1 justify-between space-x-4">
        <div>
          <p class="text-sm font-medium">{{ title }}</p>
          <p class="text-sm text-gray-500">{{ date }} {{ timeAgo ? `(${timeAgo})` : '' }}</p>
        </div>
        <slot name="extra"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  date?: string
  timeAgo?: string
  active?: boolean
}>()
</script>
