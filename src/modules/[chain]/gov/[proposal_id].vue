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

onMounted(() => {
  loadProposalData();
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

function pageload(p: number) {
  pageRequest.value.setPage(p);
  store.fetchProposalVotes(props.proposal_id, pageRequest.value).then((x) => {
    votes.value = x.votes;
    pageResponse.value = x.pagination;
  });
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
      <h1 class="text-2xl font-bold mb-4">#{{ proposal_id }}. {{ proposal.title }}</h1>
      <div :class="`inline-block px-3 py-1 rounded-full text-sm ${color ? `text-${color}` : ''}`">
        {{ status }}
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
      <h2 class="text-xl font-bold mb-4">Votes</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <tbody>
            <tr v-for="vote in votes" :key="vote.voter" class="border-b">
              <td class="py-3">{{ vote.voter }}</td>
              <td class="py-3">{{ vote.option }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>