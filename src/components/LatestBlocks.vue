
<template>
  <div class="bg-base-100 rounded-xl shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-medium">Latest Blocks</h3>
      <RouterLink :to="`/${props.chain}/block`" class="text-primary hover:text-primary-focus">View all</RouterLink>
    </div>

    <div v-if="loading && !blocks.length" class="flex justify-center items-center py-8">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>
    <div v-else class="overflow-x-auto">
      <table class="table w-full table-zebra">
        <thead class="bg-base-200">
          <tr>
            <th class="rounded-tl-lg">Height</th>
            <th>Proposer</th>
            <th>No. of Txs</th>
            <th class="rounded-tr-lg">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="block in blocks.slice(0, 10)" :key="block.block?.header?.height" 
              class="hover:bg-base-200 transition-colors cursor-pointer"
              @click="navigateToBlock(block.block?.header?.height)">
            <td>
              <RouterLink 
                :to="`/${props.chain}/block/${block.block?.header?.height}`"
                class="text-primary hover:text-primary-focus font-medium">
                #{{ block.block?.header?.height }}
              </RouterLink>
            </td>
            <td class="flex items-center gap-2">
              <div class="avatar">
                <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                  <Icon icon="mdi:account" class="text-xl" />
                </div>
              </div>
              <span class="truncate max-w-[200px]">
                {{ format.validator(block.block?.header?.proposer_address) }}
              </span>
            </td>
            <td>{{ block.block?.data?.txs?.length || 0 }} txs</td>
            <td>{{ format.toDay(block.block?.header?.time, 'from') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useFormatter } from '@/stores';
import { useBlockModule } from '@/modules/[chain]/block/block';
import { useRouter } from 'vue-router';
import type { Block } from '@/types';

const props = defineProps(['chain']);
const router = useRouter();
const blockModule = useBlockModule();
const format = useFormatter();
const blocks = ref<Block[]>([]);
const loading = ref(true);
const error = ref('');
let refreshInterval: NodeJS.Timeout;

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

const navigateToBlock = (height: string) => {
  router.push(`/${props.chain}/block/${height}`);
};

onMounted(() => {
  fetchBlocks();
  refreshInterval = setInterval(fetchBlocks, 6000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.table {
  font-family: 'Inter', sans-serif;
}

.table th {
  @apply text-base-content/70 font-medium;
}

.table td {
  @apply py-4;
}
</style>
