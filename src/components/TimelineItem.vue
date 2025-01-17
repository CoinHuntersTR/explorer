<template>
  <div class="flex items-center mb-4">
    <div class="flex-shrink-0 mr-4">
      <div class="w-3 h-3 bg-primary rounded-full"></div>
    </div>
    <div class="flex-grow">
      <div class="font-semibold">{{ label }}</div>
      <div class="text-sm text-gray-500">{{ formatDate(time) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

const props = defineProps<{
  label: string
  time: string
}>();

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return format(new Date(dateStr), 'PPpp');
}
</script>