
<template>
  <div class="bg-base-100 rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Latest Blocks</h2>
      <RouterLink :to="`/${chain}/block`" class="text-primary hover:text-primary-focus text-sm">View all</RouterLink>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="text-sm border-b">
            <th class="pb-3 text-left">Height</th>
            <th class="pb-3 text-left">Hash</th>
            <th class="pb-3 text-left">Proposer</th>
            <th class="pb-3 text-left">No. of Txs</th>
            <th class="pb-3 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="block in blocks" :key="block.height" class="hover:bg-base-200 border-b border-base-200 even:bg-base-100/50">
            <td class="py-3">
              <RouterLink :to="`/${chain}/block/${block.height}`" class="text-primary hover:text-primary-focus">
                {{ block.height }}
              </RouterLink>
            </td>
            <td class="py-3">
              <RouterLink :to="`/${chain}/tx/${block.hash}`" class="hover:text-primary-focus">
                {{ formatHash(block.hash) }}
              </RouterLink>
            </td>
            <td class="py-3">
              <RouterLink :to="`/${chain}/staking/${block.proposer_address}`" class="flex items-center hover:text-primary-focus">
                <div class="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center mr-2">
                  <Icon icon="mdi:account" />
                </div>
                {{ formatValidator(block.proposer_address) }}
              </RouterLink>
            </td>
            <td class="py-3">{{ block.num_txs }}</td>
            <td class="py-3">{{ format.timeFromNow(block.time) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useFormatter, useBlockchain } from '@/stores';

const props = defineProps(['chain']);
const blockchain = useBlockchain();
const format = useFormatter();
const blocks = ref([]);
let timer: any = null;

const formatHash = (hash: string) => {
  if (!hash) return '';
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
};

const formatValidator = (address: string) => {
  // Format validator name (implement your logic here)
  return address.substring(0, 12) + '...';
};

const fetchBlocks = async () => {
  try {
    const latestBlocks = await blockchain.rpc.getLatestBlocks(10);
    blocks.value = latestBlocks;
  } catch (error) {
    console.error('Error fetching blocks:', error);
  }
};

onMounted(() => {
  fetchBlocks();
  timer = setInterval(fetchBlocks, 6000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
