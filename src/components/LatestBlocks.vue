<template>
  <div class="bg-base-100 dark:bg-base-200 rounded-xl shadow-lg backdrop-blur-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-medium">{{ $t('block.recent') }}</h3>
      <RouterLink :to="`/${props.chain}/block`" class="btn btn-sm">{{ $t('common.view_all') }}</RouterLink>
    </div>

    <div v-if="loading && !blocks.length" class="flex justify-center items-center py-8">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>
    <div v-else class="space-y-4">
      <RouterLink v-for="block in blocks" :key="block.block?.header?.height"
        class="block p-4 rounded-lg hover:bg-base-200 transition-colors"
        :to="`/${props.chain}/block/${block.block?.header?.height}`">
        <div class="flex justify-between items-center">
          <span class="text-xl font-semibold">#{{ block.block?.header?.height }}</span>
          <span class="text-sm text-gray-500">{{ format.toDay(block.block?.header?.time, 'from') }}</span>
        </div>
        <div class="flex justify-between items-center mt-2">
          <span class="text-sm text-gray-600 truncate max-w-[200px]">
            {{ format.validator(block.block?.header?.proposer_address) }}
          </span>
          <span class="text-sm">{{ block.block?.data?.txs?.length || 0 }} txs</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useFormatter, useBlockchain } from '@/stores';
import { useBlockModule } from '@/modules/[chain]/block/block';
import type { Block } from '@/types';

const props = defineProps(['chain']);
const blockModule = useBlockModule();
const format = useFormatter();
const blocks = ref<Block[]>([]);
const loading = ref(true);
const error = ref('');

const fetchBlocks = async () => {
  try {
    loading.value = true;
    error.value = '';
    await blockModule.initial();
    blocks.value = blockModule.recents;
    loading.value = false;
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch blocks';
    loading.value = false;
  }
};

onMounted(() => {
  fetchBlocks();
});
</script>