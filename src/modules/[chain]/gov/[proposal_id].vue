<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useGovStore } from '@/stores/useGovStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  proposal_id: string
}>()

const store = useGovStore()
const proposal = ref<any>(null)

onMounted(async () => {
  const response = await store.fetchProposal(props.proposal_id)
  proposal.value = response?.proposal || response
})

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

function formatStatus(status: string) {
  return status?.replace('PROPOSAL_STATUS_', '') || ''
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PROPOSAL_STATUS_PASSED':
      return 'bg-green-100 text-green-800'
    case 'PROPOSAL_STATUS_REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

function calculatePercentage(value: string) {
  const total = Object.values(proposal.value?.final_tally_result || {})
    .reduce((sum: number, val: string) => sum + Number(val), 0)
  return total > 0 ? ((Number(value) / total) * 100).toFixed(2) : '0'
}

function formatVoteOption(option: string) {
  return option.replace(/_/g, ' ').toLowerCase()
}

function getVoteTypeColor(type: string) {
  switch (type) {
    case 'yes':
      return 'bg-green-500'
    case 'no':
      return 'bg-red-500'
    case 'abstain':
      return 'bg-yellow-500'
    case 'no_with_veto':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div v-if="proposal" class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">
          #{{ proposal_id }} {{ proposal.content?.title || proposal.title || '' }}
        </h1>
        <span :class="`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(proposal.status)}`">
          {{ formatStatus(proposal.status) }}
        </span>
      </div>

      <!-- Description -->
      <div class="prose dark:prose-invert max-w-none mb-6">
        <p>{{ proposal.content?.description || proposal.description || '' }}</p>
      </div>

      <!-- Voting Progress -->
      <div v-if="proposal.final_tally_result" class="mb-6">
        <h2 class="text-xl font-bold mb-4">Voting Results</h2>
        <div class="space-y-4">
          <div v-for="(value, key) in proposal.final_tally_result" :key="key" class="relative">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium capitalize">{{ formatVoteOption(key) }}</span>
              <span class="text-sm font-medium">{{ calculatePercentage(value) }}%</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full">
              <div class="h-full rounded-full transition-all duration-300"
                   :class="getVoteTypeColor(key)"
                   :style="`width: ${calculatePercentage(value)}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="mb-6">
        <h2 class="text-xl font-bold mb-4">Proposal Timeline</h2>
        <div class="space-y-4">
          <div class="flex items-center">
            <div class="w-24 text-sm text-gray-600">Submit Time:</div>
            <div>{{ formatDate(proposal.submit_time) }}</div>
          </div>
          <div class="flex items-center">
            <div class="w-24 text-sm text-gray-600">Voting End:</div>
            <div>{{ formatDate(proposal.voting_end_time) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>