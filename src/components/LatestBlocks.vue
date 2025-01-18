
<template>
  <div class="bg-base-100 dark:bg-base-200 rounded-xl shadow-lg backdrop-blur-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Latest Blocks</h2>
      <RouterLink :to="`/${chain}/block`" class="text-primary hover:text-primary-focus text-sm">View all</RouterLink>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="text-sm border-b dark:border-base-300">
            <th class="pb-3 text-left">Height</th>
            <th class="pb-3 text-left">Hash</th>
            <th class="pb-3 text-left">Proposer</th>
            <th class="pb-3 text-left">No. of Txs</th>
            <th class="pb-3 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="animate-pulse">
            <td colspan="5" class="text-center py-4">Loading blocks...</td>
          </tr>
          <tr v-else-if="blocks.length === 0">
            <td colspan="5" class="text-center py-4">No blocks found</td>
          </tr>
          <tr v-for="block in blocks" :key="block.height" class="hover:bg-base-200 dark:hover:bg-base-300 border-b border-base-200 dark:border-base-300">
            <td class="py-3">
              <RouterLink :to="`/${chain}/block/${block.block?.header?.height}`" class="text-primary hover:text-primary-focus">
                {{ block.block?.header?.height }}
              </RouterLink>
            </td>
            <td class="py-3">
              <span class="font-mono">{{ formatHash(block.block_id?.hash) }}</span>
            </td>
            <td class="py-3">
              <RouterLink :to="`/${chain}/staking/${block.block?.header?.proposer_address}`" class="flex items-center hover:text-primary-focus">
                <div class="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center mr-2">
                  <Icon icon="mdi:account" />
                </div>
                {{ formatValidator(block.block?.header?.proposer_address) }}
              </RouterLink>
            </td>
            <td class="py-3">{{ block.block?.data?.txs?.length || 0 }}</td>
            <td class="py-3">{{ format.timeFromNow(block.block?.header?.time) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useFormatter, useBlockchain, useBaseStore } from '@/stores';

const props = defineProps(['chain']);
const blockchain = useBlockchain();
const baseStore = useBaseStore();
const format = useFormatter();
const blocks = ref([]);
const loading = ref(true);
let timer: any = null;

const formatHash = (hash: string) => {
  if (!hash) return '';
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
};

const formatValidator = (address: string) => {
  if (!address) return '';
  return address.substring(0, 12) + '...';
};

const fetchBlocks = async () => {
  try {
    loading.value = true;
    await baseStore.fetchLatest();
    blocks.value = baseStore.recents.slice(0, 10);
  } catch (error) {
    console.error('Error fetching blocks:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchBlocks();
  timer = setInterval(fetchBlocks, 6000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
