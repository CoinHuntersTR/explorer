
<template>
  <div v-if="blockchain.chainName" class="flex items-center space-x-6 relative">
    <div class="flex items-center space-x-2 group cursor-pointer">
      <img :src="blockchain.logo" class="h-6 w-6 rounded-full" :alt="blockchain.chainName"/>
      <span class="font-medium">{{ blockchain.current?.prettyName || blockchain.chainName }}</span>
      
      <!-- Dropdown Card -->
      <div class="absolute hidden group-hover:block top-full left-0 mt-2 bg-base-100 shadow-lg rounded-lg p-4 z-50 border border-gray-100 dark:border-gray-700">
        <div class="text-sm">
          <div class="mb-2">
            <span class="font-medium text-gray-700 dark:text-gray-200">Endpoint:</span>
            <a :href="blockchain.endpoint?.address" target="_blank" class="ml-2 text-primary hover:underline">
              {{ blockchain.endpoint?.address }}
            </a>
          </div>
        </div>
      </div>
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

      
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useBlockchain } from '@/stores/useBlockchain';
import { useBaseStore } from '@/stores/useBaseStore';

const blockchain = useBlockchain();
const baseStore = useBaseStore();
</script>
