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

  return { mainnetChains, testnetChains };
});

const featured = computed(() => {
  const names = ["cosmos", "osmosis", "akash", "celestia", "evmos", "injective", "dydx", "noble"];
  return [...chains.value.mainnetChains, ...chains.value.testnetChains]
    .filter(x => names.includes(x.chainName))
    .sort((a, b) => names.indexOf(a.chainName) - names.indexOf(b.chainName));
});

const chainStore = useBlockchain();
</script>

<template>
  <div class="">
    <div class="flex md:!flex-row flex-col items-center justify-center mb-6 mt-14 gap-2">
      <div class="w-16 rounded-full">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        </svg>
      </div>
      <h1 class="text-primary dark:invert text-3xl md:!text-6xl font-bold">
        {{ $t('pages.title') }}
      </h1>
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

    <div class="flex items-center rounded-lg bg-base-100 border border-gray-200 dark:border-gray-700 mt-10">
      <Icon icon="mdi:magnify" class="text-2xl text-gray-400 ml-3"/>
      <input :placeholder="$t('pages.search_placeholder')" class="px-4 h-10 bg-transparent flex-1 outline-none text-base" v-model="keywords" />
      <div class="px-4 text-base hidden md:!block">{{ chains.mainnetChains.length + chains.testnetChains.length }}/{{ dashboard.length }}</div>
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
