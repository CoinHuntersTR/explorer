<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBlockchain } from '@/stores'

const blockchain = useBlockchain()
const searchQuery = ref('')
const activeTab = ref('Mainnets')

const tabs = [
  { name: 'Mainnets', count: '42' },
  { name: 'Testnets', count: '44' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-indigo-600 mb-4">Coin Hunters Blockchain Explorers</h1>
        <p class="text-gray-600 text-lg">Try the best Cosmos-based network explorers</p>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center space-x-4 mb-8">
        <div v-for="tab in tabs" :key="tab.name" 
             @click="activeTab = tab.name"
             class="inline-flex items-center px-4 py-2 rounded-full cursor-pointer"
             :class="activeTab === tab.name ? 'bg-white shadow-sm' : 'hover:bg-white/50'">
          <span :class="activeTab === tab.name ? 'text-indigo-600' : 'text-gray-600'">
            {{ tab.name }}
          </span>
          <span class="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-sm text-gray-600">
            {{ tab.count }}
          </span>
        </div>
      </div>

      <!-- Search -->
      <div class="max-w-2xl mx-auto mb-12">
        <div class="relative">
          <input type="text" 
                 v-model="searchQuery"
                 placeholder="Enter network"
                 class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="chain in blockchain.chains" :key="chain.name"
             class="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-100">
          <div class="flex items-center space-x-3">
            <img :src="chain.logo" :alt="chain.name" class="w-8 h-8 rounded-full">
            <div>
              <h3 class="font-medium text-gray-900">{{ chain.name }}</h3>
              <p class="text-sm text-gray-500">{{ chain.chain_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>