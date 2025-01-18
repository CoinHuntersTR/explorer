
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useBaseStore } from '@/stores/useBaseStore';
import { useRouter } from 'vue-router';
import { formatDistance } from 'date-fns';

const baseStore = useBaseStore();
const router = useRouter();

const refreshTimer = ref(null);

const updateTimes = () => {
  baseStore.recents.forEach(block => {
    const timestamp = new Date(block.block.header.time);
    block.timeAgo = formatDistance(timestamp, new Date(), { addSuffix: true });
  });
};

const navigateToBlock = (height: string) => {
  router.push(`/${baseStore.blockchain.chainName}/block/${height}`);
};

const navigateToValidator = (address: string) => {
  router.push(`/${baseStore.blockchain.chainName}/staking/${address}`);
};

onMounted(() => {
  refreshTimer.value = setInterval(() => {
    baseStore.fetchLatest();
    updateTimes();
  }, 6000);
  updateTimes();
});

onUnmounted(() => {
  if (refreshTimer.value) clearInterval(refreshTimer.value);
});
</script>

<template>
  <div class="latest-blocks-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Latest Blocks</h2>
      <router-link 
        :to="`/${baseStore.blockchain.chainName}/block`"
        class="text-primary hover:text-primary-600 text-sm font-medium"
      >
        View all
      </router-link>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
            <th class="pb-4">Height</th>
            <th class="pb-4">Hash</th>
            <th class="pb-4">Proposer</th>
            <th class="pb-4">No. of Txs</th>
            <th class="pb-4">Time</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr 
            v-for="block in baseStore.recents.slice(0, 10)" 
            :key="block.block_id.hash"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <td class="py-4">
              <a 
                @click="navigateToBlock(block.block.header.height)"
                class="text-primary hover:text-primary-600 cursor-pointer"
              >
                {{ block.block.header.height }}
              </a>
            </td>
            <td class="py-4">
              <span class="font-mono">
                {{ block.block_id.hash.substring(0, 8) }}...{{ block.block_id.hash.substring(block.block_id.hash.length - 8) }}
              </span>
            </td>
            <td class="py-4">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-xs">V</span>
                </div>
                <a 
                  @click="navigateToValidator(block.block.header.proposer_address)"
                  class="text-gray-700 dark:text-gray-300 hover:text-primary cursor-pointer"
                >
                  {{ block.block.header.proposer_address.substring(0, 12) }}...
                </a>
              </div>
            </td>
            <td class="py-4">
              {{ block.block.data.txs ? block.block.data.txs.length : 0 }}
            </td>
            <td class="py-4 text-gray-500">
              {{ block.timeAgo }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
tr:nth-child(even) {
  @apply bg-gray-50 dark:bg-gray-700/50;
}
</style>
