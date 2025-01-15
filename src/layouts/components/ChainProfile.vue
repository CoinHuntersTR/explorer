
<template>
  <div v-if="blockchain.chainName" class="flex items-center space-x-4 bg-base-100 px-4 py-2 rounded-lg">
    <div class="flex items-center space-x-2">
      <img :src="blockchain.logo" class="h-6 w-6 rounded-full" :alt="blockchain.chainName"/>
      <span class="font-medium">{{ blockchain.current?.prettyName || blockchain.chainName }}</span>
    </div>

    <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
      <div class="flex items-center">
        <span class="mr-1">Height:</span>
        <span class="font-medium">{{ baseStore.latest?.block?.header?.height || '-' }}</span>
      </div>

      <div class="flex items-center">
        <span class="mr-1">Chain ID:</span>
        <span class="font-medium">{{ baseStore.latest?.block?.header?.chain_id || '-' }}</span>
      </div>

      <div class="flex items-center">
        <span class="mr-1">Provider:</span>
        <span class="font-medium flex items-center">
          {{ blockchain.endpoint?.provider || '-' }}
          <span v-if="blockchain.endpoint?.provider" class="ml-1 w-2 h-2 rounded-full bg-success"></span>
        </span>
      </div>

      <div class="flex items-center">
        <span class="mr-1">Endpoint:</span>
        <a :href="blockchain.endpoint?.address" target="_blank" class="font-medium text-primary hover:underline">
          {{ blockchain.endpoint?.address || '-' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useBlockchain } from '@/stores/useBlockchain';
import { useBaseStore } from '@/stores/useBaseStore';

const blockchain = useBlockchain();
const baseStore = useBaseStore();
</script>
