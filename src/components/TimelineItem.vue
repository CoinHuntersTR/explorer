
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
<template>
  <div class="relative flex items-start mb-8">
    <div class="absolute -left-4 mt-1">
      <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`">
        <i :class="icon"></i>
      </div>
    </div>
    <div class="ml-8">
      <h3 class="font-semibold">{{ title }}</h3>
      <p class="text-sm text-gray-500">{{ date }}</p>
      <p class="text-sm text-gray-500">{{ timeAgo }}</p>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  date?: string
  timeAgo?: string
  active?: boolean
}>()
</script>
