
<template>
  <div v-if="proposal" class="bg-white dark:bg-gray-800 rounded-lg p-6">
    <h2 class="text-2xl font-bold mb-4">#{{ proposal_id }} {{ proposal.content?.title || proposal.title }}</h2>
    
    <ProposalProcess :proposal="proposal" />
    
    <div class="mt-6 space-y-4">
      <div>
        <h3 class="font-semibold">Description</h3>
        <p class="mt-2 whitespace-pre-wrap">{{ proposal.content?.description || proposal.description }}</p>
      </div>
      
      <div v-if="proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD'">
        <h3 class="font-semibold">Current Tally</h3>
        <div class="mt-2">
          <DonutChart v-if="proposal.final_tally_result" :data="proposal.final_tally_result" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGovStore } from '@/stores/useGovStore'
import { storeToRefs } from 'pinia'
import DonutChart from '@/components/charts/DonutChart.vue'
import ProposalProcess from '@/components/ProposalProcess.vue'

const props = defineProps<{
  proposal_id: string
}>()

const store = useGovStore()
const proposal = ref(null)

onMounted(async () => {
  try {
    const response = await store.fetchProposal(props.proposal_id)
    proposal.value = response?.proposal || response
    
    if (proposal.value?.status === 'PROPOSAL_STATUS_VOTING_PERIOD') {
      const tallRes = await store.fetchTally(props.proposal_id)
      if (tallRes?.tally) {
        proposal.value.final_tally_result = tallRes.tally
      }
    }
  } catch (error) {
    console.error('Error fetching proposal:', error)
  }
})
</script>
