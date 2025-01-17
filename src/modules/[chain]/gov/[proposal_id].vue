
<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
      <h1 class="text-2xl font-bold mb-4">#{{ proposal_id }}. {{ proposal.title }}</h1>
      <div :class="`inline-block px-3 py-1 rounded-full text-sm ${color ? `text-${color}` : ''}`">
        {{ status }}
      </div>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-gray-600 dark:text-gray-400">Submit Time: {{ shortTime(proposal.submit_time) }}</p>
          <p class="text-gray-600 dark:text-gray-400">Voting Start: {{ shortTime(proposal.voting_start_time) }}</p>
          <p class="text-gray-600 dark:text-gray-400">Voting End: {{ shortTime(proposal.voting_end_time) }}</p>
        </div>
        
        <div v-if="proposal.final_tally_result" class="mt-4">
          <h3 class="font-semibold mb-2">Voting Results</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p>Yes: {{ format.formatNumber(proposal.final_tally_result.yes) }}</p>
              <p>No: {{ format.formatNumber(proposal.final_tally_result.no) }}</p>
              <p>Abstain: {{ format.formatNumber(proposal.final_tally_result.abstain) }}</p>
              <p>No with Veto: {{ format.formatNumber(proposal.final_tally_result.no_with_veto) }}</p>
            </div>
            <div>
              <p>Total: {{ format.formatNumber(total) }}</p>
            </div>
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

    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 class="text-xl font-bold mb-4">Validators Votes</h2>
      
      <div class="mb-4 flex gap-2">
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

      <div class="mb-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search moniker / valoper"
          class="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <tbody>
            <tr v-for="vote in filteredVotes" :key="vote.voter" class="border-b">
              <td class="py-3">{{ vote.voter }}</td>
              <td class="py-3">{{ vote.option }}</td>
              <td class="py-3">{{ shortTime(vote.time) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import MdEditor from 'md-editor-v3';
import {
  useBaseStore,
  useBlockchain,
  useFormatter,
  useGovStore,
  useStakingStore,
  useTxDialog,
} from '@/stores';
import { PageRequest, type GovProposal, type GovVote } from '@/types';

const props = defineProps(['proposal_id', 'chain']);
const proposal = ref({} as GovProposal);
const format = useFormatter();
const store = useGovStore();
const dialog = useTxDialog();
const stakingStore = useStakingStore();
const chainStore = useBlockchain();

const votes = ref([] as GovVote[]);
const pageRequest = ref(new PageRequest());
const pageResponse = ref({});
const searchQuery = ref('');
const selectedVoteType = ref('Yes');

async function loadProposalData() {
  try {
    const res = await store.fetchProposal(props.proposal_id);
    if (!res) return;

    const proposalDetail = res.proposal || res;
    if (!proposalDetail.final_tally_result) {
      proposalDetail.final_tally_result = {
        yes: '0',
        abstain: '0',
        no: '0',
        no_with_veto: '0'
      };
    }

    if (proposalDetail.status === 'PROPOSAL_STATUS_VOTING_PERIOD') {
      const tallRes = await store.fetchTally(props.proposal_id);
      if (tallRes?.tally) {
        proposalDetail.final_tally_result = tallRes.tally;
      }
    }

    proposal.value = proposalDetail;

    const votesRes = await store.fetchProposalVotes(props.proposal_id, pageRequest.value);
    if (votesRes) {
      votes.value = votesRes.votes;
      pageResponse.value = votesRes.pagination;
    }
  } catch (error) {
    console.error('Error loading proposal data:', error);
  }
}

const filteredVotes = computed(() => {
  return votes.value.filter(vote => {
    const matchesSearch = vote.voter.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = selectedVoteType.value === vote.option;
    return matchesSearch && matchesType;
  });
});

const color = computed(() => {
  if (proposal.value.status === 'PROPOSAL_STATUS_PASSED') return 'success';
  if (proposal.value.status === 'PROPOSAL_STATUS_REJECTED') return 'error';
  return '';
});

const status = computed(() => {
  return proposal.value.status ? proposal.value.status.replace('PROPOSAL_STATUS_', '') : '';
});

const total = computed(() => {
  const tally = proposal.value.final_tally_result;
  if (!tally) return 0;
  return Number(tally.abstain || 0) +
         Number(tally.yes || 0) +
         Number(tally.no || 0) +
         Number(tally.no_with_veto || 0);
});

function shortTime(v: string) {
  return v ? format.toDay(v, 'from') : '';
}

onMounted(() => {
  loadProposalData();
});
</script>
