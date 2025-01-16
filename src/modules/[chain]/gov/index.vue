
<template>
  <div class="container mx-auto p-4">
    <!-- Search and Filter Section -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-grow">
        <input 
          type="text" 
          v-model="searchQuery" 
          class="input input-bordered w-full" 
          placeholder="Search proposals by title or ID..."
        />
      </div>
      <div class="flex gap-4">
        <select v-model="selectedStatus" class="select select-bordered">
          <option value="">All Status</option>
          <option value="PROPOSAL_STATUS_DEPOSIT_PERIOD">Deposit Period</option>
          <option value="PROPOSAL_STATUS_VOTING_PERIOD">Voting Period</option>
          <option value="PROPOSAL_STATUS_PASSED">Passed</option>
          <option value="PROPOSAL_STATUS_REJECTED">Rejected</option>
        </select>
        <select v-model="selectedType" class="select select-bordered">
          <option value="">All Types</option>
          <option value="TextProposal">Text</option>
          <option value="ParameterChangeProposal">Parameter Change</option>
          <option value="SoftwareUpgradeProposal">Software Upgrade</option>
        </select>
      </div>
    </div>

    <!-- Proposals List -->
    <div class="grid gap-4">
      <div v-for="proposal in filteredProposals" :key="proposal.proposal_id" 
           class="card bg-base-200 hover:shadow-lg transition-all duration-200">
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div class="flex-grow">
              <div class="flex items-center gap-2 mb-2">
                <span :class="getStatusBadgeClass(proposal.status)" class="badge">
                  {{ formatStatus(proposal.status) }}
                </span>
                <h3 class="text-lg font-medium">
                  #{{ proposal.proposal_id }} {{ proposal.content?.title }}
                </h3>
              </div>
              <p class="text-gray-500 dark:text-gray-400 line-clamp-2">
                {{ proposal.content?.description }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-sm opacity-70">Total Votes</div>
              <div class="text-xl font-semibold">
                {{ formatVoteCount(proposal.final_tally_result) }}
              </div>
            </div>
          </div>
          
          <div class="flex justify-between items-center mt-4">
            <div class="flex gap-4 text-sm opacity-70">
              <div>Submit Time: {{ formatTime(proposal.submit_time) }}</div>
              <div>Voting End: {{ formatTime(proposal.voting_end_time) }}</div>
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

    <!-- Pagination -->
    <PaginationBar 
      :total="store?.proposals[tab]?.pagination?.total" 
      :limit="pageRequest.limit" 
      :callback="page" 
      class="mt-6"
    />
  </div>
</template>

<script lang="ts" setup>
import { useGovStore } from '@/stores'
import { useBlockchain } from '@/stores'
import { ref, computed, onMounted } from 'vue'
import PaginationBar from '@/components/PaginationBar.vue'
import { PageRequest } from '@/types'

const store = useGovStore()
const blockchain = useBlockchain()
const tab = ref('2')
const pageRequest = ref(new PageRequest())
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedType = ref('')

onMounted(() => {
  store.fetchProposals('2').then((x) => {
    if (x?.proposals?.length === 0) {
      tab.value = '3'
      store.fetchProposals('3')
    }
    store.fetchProposals('3')
    store.fetchProposals('4')
  })
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

  if (selectedType.value) {
    proposals = proposals.filter(p => 
      p.content?.['@type']?.includes(selectedType.value)
    )
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
    'PROPOSAL_STATUS_DEPOSIT_PERIOD': 'badge-warning',
    'PROPOSAL_STATUS_VOTING_PERIOD': 'badge-info',
    'PROPOSAL_STATUS_PASSED': 'badge-success',
    'PROPOSAL_STATUS_REJECTED': 'badge-error'
  }
  return `${classes[status] || 'badge-ghost'}`
}

const formatVoteCount = (tally: any) => {
  if (!tally) return 0
  return Object.values(tally).reduce((a: number, b: string) => a + parseInt(b || '0'), 0)
}

const page = (p: number) => {
  pageRequest.value.setPage(p)
  store.fetchProposals(tab.value, pageRequest.value)
}
</script>

<style scoped>
.card {
  @apply transition-all duration-200;
}
.card:hover {
  @apply transform -translate-y-1;
}
</style>
