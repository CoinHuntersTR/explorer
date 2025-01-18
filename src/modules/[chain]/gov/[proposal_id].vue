<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
      <!-- Header -->
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
              <span>{{ (Number(turnoutPercent)/1e18).toFixed(2) }}%</span>
            </div>
            <div v-if="proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD'" class="mt-2">
              <Countdown :end-time="proposal.voting_end_time" />
            </div>
            <div v-for="(value, key) in tallies" :key="key" class="space-y-2">
              <div class="flex justify-between items-center">
                <span>{{ key }}</span>
                <span class="font-medium">{{ (value.percent || 0).toFixed(2) }}%</span>
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

      <!-- Description -->
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
          <div v-for="vote in sortedFilteredVotes" :key="vote.voter" 
            class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <div class="flex flex-col">
              <span class="font-medium">{{ getValidatorName(vote.voter) }}</span>
              <span class="text-sm text-gray-500">{{ vote.voter }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span :class="getVoteStatusClass(vote.option)">{{ formatVoteOption(vote.option) }}</span>
              <span class="text-sm">{{ formatVotingPower(vote.voting_power) }}</span>
            </div>
          </div>
          <div class="mt-4">
            <nav class="flex items-center justify-between">
              <button 
                class="px-4 py-2 text-sm rounded bg-primary text-white disabled:opacity-50"
                :disabled="currentPage === 1"
                @click="currentPage--">
                Previous
              </button>
              <span class="text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
              <button 
                class="px-4 py-2 text-sm rounded bg-primary text-white disabled:opacity-50"
                :disabled="currentPage >= totalPages"
                @click="currentPage++">
                Next
              </button>
            </nav>
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
import Countdown from '@/components/Countdown.vue'; // Added import for Countdown component
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

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(num);
};

const turnoutPercent = computed(() => {
  if (!proposal.value.final_tally_result) return '0.00%';
  const total = Number(proposal.value.final_tally_result.yes) +
                Number(proposal.value.final_tally_result.no) +
                Number(proposal.value.final_tally_result.abstain) +
                Number(proposal.value.final_tally_result.no_with_veto);
  return `${formatNumber((total / 1e18) * 100)}%`;
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

const currentPage = ref(1);
const itemsPerPage = 10;

const filteredVotes = computed(() => {
  return votes.value.filter(vote => {
    const matchesSearch = vote.voter.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = selectedVoteType.value === formatVoteOption(vote.option);
    return matchesSearch && matchesType;
  });
});

const sortedFilteredVotes = computed(() => {
  const sorted = [...filteredVotes.value].sort((a, b) => Number(b.voting_power) - Number(a.voting_power));
  const start = (currentPage.value - 1) * itemsPerPage;
  return sorted.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(filteredVotes.value.length / itemsPerPage));

const formatVoteOption = (option: string) => {
  return option.replace('VOTE_OPTION_', '').split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

const formatVotingPower = (power: string) => {
  return `${formatNumber(Number(power) / 1e18)} voting power`;
};

const getVoteStatusClass = (option: string) => {
  const baseClasses = 'px-3 py-1 rounded-full text-sm';
  switch(option) {
    case 'VOTE_OPTION_YES': return `${baseClasses} bg-green-100 text-green-800`;
    case 'VOTE_OPTION_NO': return `${baseClasses} bg-red-100 text-red-800`;
    case 'VOTE_OPTION_ABSTAIN': return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'VOTE_OPTION_NO_WITH_VETO': return `${baseClasses} bg-yellow-100 text-yellow-800`;
    default: return baseClasses;
  }
};

const getValidatorName = (address: string) => {
  // You can implement validator name lookup here if available
  return address.slice(0, 12) + '...' + address.slice(-8);
};

async function loadProposalData() {
  try {
    const res = await store.fetchProposal(proposal_id);
    if (res) {
      proposal.value = res.proposal || res;
      const votesRes = await store.fetchProposalVotes(proposal_id);
      if (votesRes) {
        votes.value = votesRes.votes;
      }

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