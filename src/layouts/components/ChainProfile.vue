<script setup lang="ts">
import { useBlockchain, useBaseStore, type Endpoint } from '@/stores';
import { useRouter } from 'vue-router';
const chainStore = useBlockchain();
const baseStore = useBaseStore();
chainStore.initial();
const router = useRouter();
function changeEndpoint(item: Endpoint) {
  chainStore.setRestEndpoint(item);
  if (chainStore.current) router.push(`/${chainStore.current.chainName}`);
}
</script>

<template>
  <div class="dropdown">
    <label tabindex="0" class="flex items-center">
      <div class="p-1 relative mr-3 cursor-pointer">
        <img v-lazy="chainStore.logo" class="w-9 h-9 rounded-full" />
        <div
          class="w-2 h-2 rounded-full absolute right-0 bottom-0 shadow" :class="{
            'bg-success': baseStore.connected,
            'bg-error': !baseStore.connected
          }"
        ></div>
      </div>
      <div class="flex-1 w-0">
        <div
          :key="baseStore.latest?.block?.header?.height || ''"
          class="capitalize whitespace-nowrap text-base font-semibold text-gray-600 dark:text-gray-200 hidden md:!block"
        >
          {{ baseStore.latest?.block?.header?.height ? `#${baseStore.latest.block.header.height}` : '0' }}
          <span class="text-error">{{ baseStore.connected ? '' : 'disconnected' }}</span>
        </div>
        <div
          class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden md:!block"
        >
          {{ chainStore.connErr || chainStore.endpoint.address }}
        </div>
      </div>
    </label>
    <div
      tabindex="0"
      class="dropdown-content -left-6 w-80 menu shadow bg-base-200 rounded-box overflow-auto"
    >

      <!-- Removed Information section -->
      <!-- bottom-->
      <div class="px-4 py-2">&nbsp;</div>
    </div>
  </div>
</template>