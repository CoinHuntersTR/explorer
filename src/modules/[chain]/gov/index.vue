
<template>
  <div class="container mx-auto p-4">
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-grow">
        <input 
          type="text" 
          v-model="searchQuery" 
          class="input input-bordered w-full" 
          placeholder="Search proposals..."
        />
      </div>
      <div class="flex gap-4">
        <select v-model="selectedStatus" class="select select-bordered">
          <option value="">All Status</option>
          <option value="PROPOSAL_STATUS_VOTING_PERIOD">Voting Period</option>
          <option value="PROPOSAL_STATUS_PASSED">Passed</option>
          <option value="PROPOSAL_STATUS_REJECTED">Rejected</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="proposal in filteredProposals" :key="proposal.proposal_id" 
           class="card bg-base-200 hover:shadow-lg transition-all duration-200">
        <div class="card-body">
          <div class="flex justify-between items-start mb-4">
            <span :class="getStatusBadgeClass(proposal.status)" class="badge">
              {{ formatStatus(proposal.status) }}
            </span>
            <h3 class="card-title text-xl">
              #{{ proposal.proposal_id }}
            </h3>
          </div>
          
          <h4 class="text-lg font-medium mb-2 line-clamp-2">
            {{ proposal.content?.title || proposal.title }}
          </h4>
          
          <p class="text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
            {{ proposal.content?.description }}
          </p>

          <div class="flex flex-col gap-2 mt-auto">
            <div class="flex justify-between text-sm opacity-70">
              <span>Submit: {{ formatTime(proposal.submit_time) }}</span>
              <span>Ends: {{ formatTime(proposal.voting_end_time) }}</span>
            </div>
            
            <div class="flex justify-between items-center mt-2">
              <div class="w-32">
                <DonutChart 
                  :data="getVoteData(proposal.final_tally_result)"
                  :colors="['#4CAF50', '#f44336', '#ff9800', '#9e9e9e']"
                  height="80"
                />
              </div>
              <router-link 
                :to="`/${blockchain.chain}/gov/${proposal.proposal_id}`" 
                class="btn btn-primary btn-sm"
              >
                View Details
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredProposals.length === 0" class="text-center py-8">
      No proposals found
    </div>

    <PaginationBar 
      :total="store?.proposals[tab]?.pagination?.total" 
      :limit="pageRequest.limit" 
      :callback="page" 
      class="mt-6"
    />
  </div>
</template>

<script setup lang="ts">
import { useGovStore } from '@/stores'
import { useBlockchain } from '@/stores'
import { ref, computed, onMounted } from 'vue'
import PaginationBar from '@/components/PaginationBar.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import { PageRequest } from '@/types'

const store = useGovStore()
const blockchain = useBlockchain()
const tab = ref('2')
const pageRequest = ref(new PageRequest())
const searchQuery = ref('')
const selectedStatus = ref('')

onMounted(() => {
  store.fetchProposals('2')
  store.fetchProposals('3')
  store.fetchProposals('4')
})

const filteredProposals = computed(() => {
  let proposals = store?.proposals[tab.value]?.proposals || []

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    proposals = proposals.filter(p => 
      p.content?.title?.toLowerCase().includes(query) ||
      p.proposal_id.toString().includes(query)
    )
  }

  if (selectedStatus.value) {
    proposals = proposals.filter(p => p.status === selectedStatus.value)
  }

  return proposals
})

const formatTime = (time: string) => {
  return new Date(time).toLocaleDateString()
}

const formatStatus = (status: string) => {
  return status.replace('PROPOSAL_STATUS_', '').replace(/_/g, ' ')
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    'PROPOSAL_STATUS_VOTING_PERIOD': 'badge-info',
    'PROPOSAL_STATUS_PASSED': 'badge-success',
    'PROPOSAL_STATUS_REJECTED': 'badge-error'
  }
  return `${classes[status] || 'badge-ghost'}`
}

const getVoteData = (tally: any) => {
  if (!tally) return []
  return [
    { name: 'Yes', value: parseInt(tally.yes || '0') },
    { name: 'No', value: parseInt(tally.no || '0') },
    { name: 'NoWithVeto', value: parseInt(tally.no_with_veto || '0') },
    { name: 'Abstain', value: parseInt(tally.abstain || '0') }
  ]
}

const page = (p: number) => {
  pageRequest.value.setPage(p)
  store.fetchProposals(tab.value, pageRequest.value)
}
</script>
