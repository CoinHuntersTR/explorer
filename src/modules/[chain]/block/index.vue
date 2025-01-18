
<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useBlockModule } from './block';
import { useFormatter } from '@/stores';
const props = defineProps(['chain']);

const tab = ref('blocks');
const blockStore = useBlockModule();
const format = useFormatter();

onMounted(async () => {
  blockStore.clearRecentBlocks();
  await blockStore.initial();
  await blockStore.fetchLatest();
  await blockStore.startAutoFetch();
});

const list = computed(() => blockStore.recents);
const isLoading = computed(() => blockStore.isLoading);
const error = computed(() => blockStore.error);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="tabs-container mb-6 bg-base-200/50 backdrop-blur-lg rounded-2xl p-2">
      <div class="flex space-x-2">
        <button class="tab-button flex-1 py-3 px-6 rounded-xl transition-all duration-300"
          :class="{ 'bg-primary text-white shadow-lg': tab === 'blocks', 'hover:bg-base-300': tab !== 'blocks' }"
          @click="tab = 'blocks'">
          {{ $t('block.recent') }}
        </button>
        <RouterLink class="tab-button flex-1 py-3 px-6 rounded-xl text-center transition-all duration-300 hover:bg-base-300"
          :to="`/${chain}/block/${Number(blockStore.latest?.block?.header.height||0) + 10000}`">
          {{ $t('block.future') }}
        </RouterLink>
        <button class="tab-button flex-1 py-3 px-6 rounded-xl transition-all duration-300"
          :class="{ 'bg-primary text-white shadow-lg': tab === 'transactions', 'hover:bg-base-300': tab !== 'transactions' }"
          @click="tab = 'transactions'">
          {{ $t('account.transactions') }}
        </button>
      </div>
    </div>

    <div v-if="isLoading && !list.length" class="flex justify-center items-center py-16">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-error rounded-xl shadow-lg">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {{ error }}
      </div>
    </div>

    <div v-else>
      <div v-show="tab === 'blocks'" class="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        <RouterLink v-for="item in list" :key="item.block?.header?.height"
          class="block-card p-5 rounded-xl bg-base-100/80 backdrop-blur border border-base-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          :to="`/${chain}/block/${item.block.header.height}`">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-xl font-bold text-primary">
              #{{ item.block.header.height }}
            </h3>
            <span class="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {{ format.toDay(item.block?.header?.time, 'from') }}
            </span>
          </div>
          <div class="flex justify-between items-end">
            <div class="tooltip" data-tip="Block Proposer">
              <div class="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                {{ format.validator(item.block?.header?.proposer_address) }}
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-sm font-medium">{{ item.block?.data?.txs.length }} txs</span>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-show="tab === 'transactions'" class="bg-base-100/80 backdrop-blur rounded-xl overflow-hidden border border-base-200">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-base-200/50">
              <tr>
                <th class="px-6 py-4 font-semibold">{{ $t('account.height') }}</th>
                <th class="px-6 py-4 font-semibold">{{ $t('account.hash') }}</th>
                <th class="px-6 py-4 font-semibold">{{ $t('account.messages') }}</th>
                <th class="px-6 py-4 font-semibold">{{ $t('block.fees') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in blockStore.txsInRecents" :key="index" 
                  class="hover:bg-base-200/50 transition-colors duration-200">
                <td class="px-6 py-4">
                  <RouterLink :to="`/${props.chain}/block/${item.height}`" 
                            class="text-primary hover:text-primary-focus">
                    {{ item.height }}
                  </RouterLink>
                </td>
                <td class="px-6 py-4 truncate max-w-[200px]">
                  <RouterLink :to="`/${props.chain}/tx/${item.hash}`" 
                            class="text-primary hover:text-primary-focus">
                    {{ item.hash }}
                  </RouterLink>
                </td>
                <td class="px-6 py-4">{{ format.messages(item.tx.body.messages) }}</td>
                <td class="px-6 py-4">{{ format.formatTokens(item.tx.authInfo.fee?.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.block-card {
  transform: translateZ(0);
  will-change: transform;
}

.block-card:hover {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

.tab-button {
  font-weight: 500;
}

.loading {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.table th:first-child {
  position: static;
}

@media (max-width: 640px) {
  .grid {
    gap: 1rem;
  }
}
</style>
