
<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
      <h1 class="text-2xl font-bold mb-4">#{{ proposal_id }}. {{ proposal.title }}</h1>
      <div :class="`inline-block px-3 py-1 rounded-full text-sm ${color}`">
        {{ status }}
      </div>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Voting Status -->
        <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h2 class="text-lg font-semibold mb-4">Voting Status</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span>Turnout</span>
              <span>{{ turnoutPercent }}%</span>
            </div>
            <div v-for="(value, key) in tallies" :key="key" class="space-y-2">
              <div class="flex justify-between items-center">
                <span>{{ key }}</span>
                <span>{{ (value.percent || 0).toFixed(2) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary h-2 rounded-full" :style="`width: ${value.percent || 0}%`"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h2 class="text-lg font-semibold mb-4">Timeline</h2>
          <div class="space-y-4">
            <TimelineItem label="Submit Time" :time="proposal.submit_time" />
            <TimelineItem label="Deposit End Time" :time="proposal.deposit_end_time" />
            <TimelineItem label="Voting Start Time" :time="proposal.voting_start_time" />
            <TimelineItem label="Voting End Time" :time="proposal.voting_end_time" />
          </div>
        </div>
      </div>

      <div class="mt-6">
        <MdEditor
          :model-value="proposal.content?.description"
          previewOnly
          class="!bg-transparent"
        />
      </div>
    </div>

    <!-- Votes Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 class="text-xl font-bold mb-4">Votes</h2>
      <div class="space-y-4">
        <div class="flex gap-2 mb-4">
          <button
            v-for="option in ['Yes', 'No', 'Veto', 'Abstain', 'Did Not Vote']"
            :key="option"
            class="px-4 py-2 rounded-full text-sm"
            :class="selectedVoteType === option ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'"
            @click="selectedVoteType = option"
          >
            {{ option }}
          </button>
        </div>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search moniker / valoper"
          class="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
        />
        <div v-if="votes.length" class="space-y-2">
          <div v-for="vote in filteredVotes" :key="vote.voter" 
            class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <span>{{ vote.voter }}</span>
            <span>{{ vote.option }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGovStore, useBlockchain } from '@/stores';
import MdEditor from 'md-editor-v3';
import TimelineItem from '@/components/TimelineItem.vue';
import type { GovProposal, GovVote } from '@/types';

const route = useRoute();
const store = useGovStore();
const blockchain = useBlockchain();
const proposal_id = route.params.proposal_id as string;

const proposal = ref({} as GovProposal);
const votes = ref([] as GovVote[]);
const searchQuery = ref('');
const selectedVoteType = ref('Yes');

const tallies = computed(() => {
  if (!proposal.value.final_tally_result) return {};
  const total = Number(proposal.value.final_tally_result.yes) +
                Number(proposal.value.final_tally_result.no) +
                Number(proposal.value.final_tally_result.abstain) +
                Number(proposal.value.final_tally_result.no_with_veto);
  
  return {
    Yes: {
      amount: proposal.value.final_tally_result.yes,
      percent: (Number(proposal.value.final_tally_result.yes) / total) * 100
    },
    No: {
      amount: proposal.value.final_tally_result.no,
      percent: (Number(proposal.value.final_tally_result.no) / total) * 100
    },
    Abstain: {
      amount: proposal.value.final_tally_result.abstain,
      percent: (Number(proposal.value.final_tally_result.abstain) / total) * 100
    },
    'No With Veto': {
      amount: proposal.value.final_tally_result.no_with_veto,
      percent: (Number(proposal.value.final_tally_result.no_with_veto) / total) * 100
    }
  };
});

const turnoutPercent = computed(() => {
  // Calculate turnout percentage
  return 0; // Implement actual calculation
});

const status = computed(() => {
  return proposal.value.status ? proposal.value.status.replace('PROPOSAL_STATUS_', '') : '';
});

const color = computed(() => {
  switch (proposal.value.status) {
    case 'PROPOSAL_STATUS_PASSED':
      return 'bg-green-100 text-green-800';
    case 'PROPOSAL_STATUS_REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
});

const filteredVotes = computed(() => {
  return votes.value.filter(vote => {
    const matchesSearch = vote.voter.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = selectedVoteType.value === vote.option;
    return matchesSearch && matchesType;
  });
});

async function loadProposalData() {
  try {
    const res = await store.fetchProposal(proposal_id);
    if (res) {
      proposal.value = res.proposal || res;
      
      // Fetch votes
      const votesRes = await store.fetchProposalVotes(proposal_id);
      if (votesRes) {
        votes.value = votesRes.votes;
      }
      
      // Fetch tally if in voting period
      if (proposal.value.status === 'PROPOSAL_STATUS_VOTING_PERIOD') {
        const tallyRes = await store.fetchTally(proposal_id);
        if (tallyRes?.tally) {
          proposal.value.final_tally_result = tallyRes.tally;
        }
      }
    }
  } catch (error) {
    console.error('Error loading proposal data:', error);
  }
}

onMounted(() => {
  loadProposalData();
});
</script>
