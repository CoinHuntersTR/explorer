<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import {
  useDashboard,
  LoadingStatus,
  type ChainConfig,
} from '@/stores/useDashboard';
import ChainSummary from '@/components/ChainSummary.vue';
import { computed, ref } from 'vue';
import { useBlockchain } from '@/stores';

const dashboard = useDashboard();

const keywords = ref('');
const activeTab = ref('mainnet');

const chains = computed(() => {
  const allChains = Object.values(dashboard.chains);

  const filteredChains = keywords.value
    ? allChains.filter(
        (x: ChainConfig) =>
          x.chainName.toLowerCase().includes(keywords.value.toLowerCase()) ||
          x.prettyName.toLowerCase().includes(keywords.value.toLowerCase())
      )
    : allChains;

  const testnetChains = filteredChains.filter((x: ChainConfig) =>
    x.chainName.endsWith('-Testnet')
  );
  const mainnetChains = filteredChains.filter(
    (x: ChainConfig) => !x.chainName.endsWith('-Testnet')
  );

  return activeTab.value === 'mainnet' ? { mainnetChains, testnetChains: [] } : { mainnetChains: [], testnetChains };
});

const featured = computed(() => {
  const names = ["cosmos", "osmosis", "akash", "celestia", "evmos", "injective", "dydx", "noble"];
  return [...chains.value.mainnetChains, ...chains.value.testnetChains]
    .filter(x => names.includes(x.chainName))
    .sort((a, b) => names.indexOf(a.chainName) - names.indexOf(b.chainName));
});

const chainStore = useBlockchain();
const height = ref(0);

// Update height when chain is selected
watch(() => chainStore.chainName, async (newChain) => {
  if (newChain && chainStore.rpc) {
    try {
      const status = await chainStore.rpc.getStatus();
      height.value = status.sync_info.latest_block_height;
    } catch (e) {
      console.error('Failed to fetch block height:', e);
    }
  }
}, { immediate: true });
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="text-center space-y-4 mb-12">
      <img src="https://coinhunterstr.com/wp-content/uploads/2022/12/CH_logo.webp" alt="CoinHunters Logo" class="mx-auto h-24 mb-4"/>
      <div v-if="chainStore.current" class="flex items-center justify-center gap-4 bg-white/80 backdrop-blur p-4 rounded-lg shadow-sm">
        <img :src="chainStore.logo" :alt="chainStore.current.chainName" class="w-10 h-10 rounded-full"/>
        <div class="flex flex-col items-start">
          <span class="font-medium text-lg">{{ chainStore.current.prettyName }}</span>
          <div class="text-sm text-gray-600">
            <span>Chain ID: {{ chainStore.current.chainId }}</span>
            <span class="mx-2">•</span>
            <span>Height: {{ chainStore.height || 'Loading...' }}</span>
          </div>
        </div>
      </div>
      <p class="text-gray-600">
        CoinHunters Dashboard is not just an explorer but also a wallet and more... ✨
      </p>
      <p class="text-primary">
        Cosmos Ecosystem Blockchains 🚀
      </p>
    </div>
    <div class="text-center text-base">
      <p class="mb-1">
        {{ $t('pages.slogan') }}
      </p>
    </div>
    <div
      v-if="dashboard.status !== LoadingStatus.Loaded"
      class="flex justify-center"
    >
      <progress class="progress progress-info w-80 h-1"></progress>
    </div>

    <div v-if="featured.length > 0" class="text-center text-base mt-6 text-primary">
      <h2 class="mb-6"> Featured Blockchains 🔥 </h2>
    </div>

    <div v-if="featured.length > 0"
      class="grid grid-cols-1 gap-4 mt-6 md:!grid-cols-3 lg:!grid-cols-4 2xl:!grid-cols-5"
    >
      <ChainSummary
        v-for="(chain, index) in featured"
        :key="index"
        :name="chain.chainName"
      />
    </div>

    <div class="text-center text-base mt-6 text-primary">
      <h2 class="mb-6">{{ $t('pages.description') }}</h2>
    </div>

    <div class="space-y-6">
      <div class="flex justify-center gap-4 mb-8">
        <button class="tab-button" :class="{ active: activeTab === 'mainnet' }" @click="activeTab = 'mainnet'">
          Mainnets ({{ chains.mainnetChains.length }})
        </button>
        <button class="tab-button" :class="{ active: activeTab === 'testnet' }" @click="activeTab = 'testnet'">
          Testnets ({{ chains.testnetChains.length }})
        </button>
      </div>
      
      <div class="relative max-w-2xl mx-auto">
        <Icon icon="mdi:magnify" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"/>
        <input 
          :placeholder="$t('pages.search_placeholder')" 
          class="search-input pl-12" 
          v-model="keywords" 
        />
      </div>
    </div>

    <div v-if="chains.mainnetChains.length > 0" class="text-center text-base mt-6 text-primary">
      <h2 class="mb-6">Mainnet Chains</h2>
    </div>
    <div
      v-if="chains.mainnetChains.length > 0"
      class="grid grid-cols-1 gap-4 mt-6 md:!grid-cols-3 lg:!grid-cols-4 2xl:!grid-cols-5"
    >
      <ChainSummary
        v-for="(chain, index) in chains.mainnetChains"
        :key="index"
        :name="chain.chainName"
      />
    </div>

    <div v-if="chains.testnetChains.length > 0" class="text-center text-base mt-6 text-primary">
      <h2 class="mb-6">Testnet Chains</h2>
    </div>
    <div
      v-if="chains.testnetChains.length > 0"
      class="grid grid-cols-1 gap-4 mt-6 md:!grid-cols-3 lg:!grid-cols-4 2xl:!grid-cols-5"
    >
      <ChainSummary
        v-for="(chain, index) in chains.testnetChains"
        :key="index"
        :name="chain.chainName"
      />
    </div>
  </div>
</template>
