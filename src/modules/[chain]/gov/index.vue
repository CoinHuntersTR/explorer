
<template>
  <div>
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-grow">
        <input type="text" class="input w-full" placeholder="Search Proposal" v-model="searchQuery">
      </div>
      <div class="flex gap-4">
        <select class="select" v-model="selectedPeriod">
          <option value="">All Period</option>
          <option value="voting">Voting Period</option>
          <option value="deposit">Deposit Period</option>
          <option value="passed">Passed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select class="select" v-model="selectedType">
          <option value="">All Proposals</option>
          <option value="text">Text Proposal</option>
          <option value="parameter">Parameter Change</option>
          <option value="software">Software Upgrade</option>
        </select>
      </div>
    </div>

    <div class="grid gap-4">
      <div v-for="p in filteredProposals" :key="p.proposal_id" class="card bg-base-100 hover:shadow-lg transition-shadow">
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span :class="getStatusClass(p.status)" class="badge">{{ p.status }}</span>
                <h3 class="text-lg font-medium">#{{ p.proposal_id }} {{ p.content.title }}</h3>
              </div>
              <p class="text-gray-500 dark:text-gray-400">{{ p.content.description?.substring(0, 200) }}...</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Reviews</div>
              <div class="text-xl font-semibold">{{ getVoteCount(p) }}</div>
            </div>
          </div>
          <div class="card-actions justify-end mt-4">
            <router-link :to="`/${blockchain.chain}/gov/${p.proposal_id}`" class="btn btn-primary">
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGovStore } from '@/stores'
import { useBlockchain } from '@/stores'

const store = useGovStore()
const blockchain = useBlockchain()
const searchQuery = ref('')
const selectedPeriod = ref('')
const selectedType = ref('')

const filteredProposals = computed(() => {
  let proposals = store.proposals['2'] || []
  
  if (searchQuery.value) {
    proposals = proposals.filter(p => 
      p.content.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.proposal_id.toString().includes(searchQuery.value)
    )
  }

  if (selectedPeriod.value) {
    proposals = proposals.filter(p => p.status.toLowerCase().includes(selectedPeriod.value.toLowerCase()))
  }

  if (selectedType.value) {
    proposals = proposals.filter(p => p.content['@type'].toLowerCase().includes(selectedType.value.toLowerCase()))
  }

  return proposals
})

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'passed': return 'badge-success'
    case 'rejected': return 'badge-error'
    case 'voting_period': return 'badge-warning'
    default: return 'badge-info'
  }
}

const getVoteCount = (proposal: any) => {
  const tally = proposal.final_tally_result
  return tally ? parseInt(tally.yes) + parseInt(tally.no) + parseInt(tally.abstain) + parseInt(tally.no_with_veto) : 0
}
</script>

<style scoped>
.select, .input {
  @apply bg-base-200 border-none;
}
</style>
