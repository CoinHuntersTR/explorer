<script lang="ts" setup>
import { computed, onMounted, ref, reactive } from 'vue';
import MdEditor from 'md-editor-v3';
import ObjectElement from '@/components/dynamic/ObjectElement.vue';
import { useBaseStore, useBlockchain, useFormatter, useGovStore, useStakingStore, useTxDialog } from '@/stores';
import { PageRequest, type GovProposal, type GovVote, type PaginatedProposalDeposit, type Pagination } from '@/types';
import Countdown from '@/components/Countdown.vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { fromBech32, toHex } from '@cosmjs/encoding';
import DonutChart from "@/components/DonutChart.vue";

const props = defineProps(['proposal_id']);
const proposal = ref({} as GovProposal);
const format = useFormatter();
const store = useGovStore();
const dialog = useTxDialog();
const stakingStore = useStakingStore();
const chainStore = useBlockchain();

onMounted(async () => {
  try {
    const res = await store.fetchProposal(props.proposal_id);
    const proposalDetail = reactive(res?.proposal || res);

    if (proposalDetail?.status === 'PROPOSAL_STATUS_VOTING_PERIOD') {
      const tallRes = await store.fetchTally(props.proposal_id);
      if (tallRes?.tally) {
        proposalDetail.final_tally_result = tallRes.tally;
      }
    }
    proposal.value = proposalDetail;

    // Handle proposal content changes 
    if(proposal.value.content?.changes) {
      for (const item of proposal.value.content.changes) {
        const res = await chainStore.rpc.getParams(item.subspace, item.key);
        if(proposal.value.content && res.param) {
          if(proposal.value.content.current){
            proposal.value.content.current.push(res.param);
          } else {
            proposal.value.content.current = [res.param];
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching proposal:', error);
  }
});

const color = computed(() => {
  if (proposal.value.status === 'PROPOSAL_STATUS_PASSED') return 'success';
  if (proposal.value.status === 'PROPOSAL_STATUS_REJECTED') return 'error';
  return '';
});

const status = computed(() => {
  return proposal.value.status ? proposal.value.status.replace('PROPOSAL_STATUS_', '') : '';
});

const deposit = ref({} as PaginatedProposalDeposit);
store.fetchProposalDeposits(props.proposal_id).then((x) => (deposit.value = x));

const votes = ref({} as GovVote[]);
const pageRequest = ref(new PageRequest());
const pageResponse = ref({} as Pagination);

store.fetchProposalVotes(props.proposal_id).then((x) => {
  votes.value = x.votes;
  pageResponse.value = x.pagination;
});

function shortTime(v: string) {
  return v ? format.toDay(v, 'from') : '';
}

const votingCountdown = computed((): number => {
  const now = new Date();
  const end = new Date(proposal.value.voting_end_time);
  return end.getTime() - now.getTime();
});

const total = computed(() => {
  const tally = proposal.value.final_tally_result;
  if (!tally) return 0;
  return Number(tally.abstain || 0) + 
         Number(tally.yes || 0) + 
         Number(tally.no || 0) + 
         Number(tally.no_with_veto || 0);
});

const turnout = computed(() => {
  if (total.value > 0) {
    const bonded = stakingStore.pool?.bonded_tokens || '1';
    return format.percent(total.value / Number(bonded));
  }
  return 0;
});

const yes = computed(() => {
  if (total.value > 0) {
    return format.percent(Number(proposal.value?.final_tally_result?.yes || 0) / total.value);
  }
  return 0;
});

const no = computed(() => {
  if (total.value > 0) {
    return format.percent(Number(proposal.value?.final_tally_result?.no || 0) / total.value);
  }
  return 0;
});

const veto = computed(() => {
  if (total.value > 0) {
    return format.percent(Number(proposal.value?.final_tally_result?.no_with_veto || 0) / total.value);
  }
  return 0;
});

const abstain = computed(() => {
  if (total.value > 0) {
    return format.percent(Number(proposal.value?.final_tally_result?.abstain || 0) / total.value);
  }
  return 0;
});

const processList = computed(() => {
  return [
    { name: 'Turnout', value: turnout.value, class: 'bg-info' },
    { name: 'Yes', value: yes.value, class: 'bg-success' },
    { name: 'No', value: no.value, class: 'bg-error' },
    { name: 'No With Veto', value: veto.value, class: 'bg-red-800' },
    { name: 'Abstain', value: abstain.value, class: 'bg-warning' },
  ];
});

function pageload(p: number) {
  pageRequest.value.setPage(p);
  store.fetchProposalVotes(props.proposal_id, pageRequest.value).then((x) => {
    votes.value = x.votes;
    pageResponse.value = x.pagination;
  });
}
</script>

<template>
  <div v-if="proposal">
    <div class="bg-base-100 px-4 pt-3 pb-4 rounded mb-4 shadow">
      <h2 class="card-title flex flex-col md:!justify-between md:!flex-row mb-2">
        <p class="truncate w-full">{{ proposal.title || proposal.content?.title }}</p>
        <div :class="['badge badge-ghost', color === 'success' ? 'text-yes' : color === 'error' ? 'text-no' : 'text-info']">
          {{ status }}
        </div>
      </h2>
      <div v-if="proposal.content">
        <ObjectElement :value="proposal.content" />
      </div>
      <div v-if="proposal.summary && !proposal.content?.description">
        <MdEditor :model-value="format.multiLine(proposal.summary)" previewOnly class="md-editor-recover" />
      </div>
    </div>

    <div class="gap-4 mb-4 grid lg:grid-cols-3 auto-rows-max">
      <div class="bg-base-100 px-4 pt-3 pb-4 rounded shadow">
        <h2 class="card-title mb-1">Voting</h2>
        <div class="flex flex-col items-center">
          <DonutChart :data="[
              { name: 'Yes', value: Number(proposal?.final_tally_result?.yes || 0) },
              { name: 'No', value: Number(proposal?.final_tally_result?.no || 0) },
              { name: 'No With Veto', value: Number(proposal?.final_tally_result?.no_with_veto || 0) },
              { name: 'Abstain', value: Number(proposal?.final_tally_result?.abstain || 0) }
            ]"
            :colors="['#4CAF50', '#f44336', '#d32f2f', '#ffa726']"
            height="200"
            class="mb-4" />
          <div class="grid grid-cols-2 gap-4 w-full mt-4">
            <div v-for="(item, index) of processList" :key="index" 
                 class="flex items-center justify-between p-3 rounded-lg bg-base-200">
              <span class="font-medium">{{ item.name }}</span>
              <span class="text-sm" :class="item.class">{{ item.value }}</span>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-2">
            <label class="btn btn-primary float-right btn-sm mx-1" @click="dialog.open('vote', { proposal_id })">Vote</label>
            <label class="btn btn-primary float-right btn-sm mx-1" @click="dialog.open('deposit', { proposal_id })">Deposit</label>
          </div>
        </div>
      </div>

      <div class="bg-base-100 px-4 pt-3 pb-4 rounded shadow lg:col-span-2">
        <h2 class="card-title">Timeline</h2>
        <div class="px-1">
          <div class="flex items-center mb-4 mt-2">
            <div class="w-2 h-2 rounded-full bg-error mr-3"></div>
            <div class="text-base flex-1 text-main">Submit at: {{ format.toDay(proposal.submit_time) }}</div>
            <div class="text-sm">{{ shortTime(proposal.submit_time) }}</div>
          </div>
          <div class="flex items-center mb-4">
            <div class="w-2 h-2 rounded-full bg-primary mr-3"></div>
            <div class="text-base flex-1 text-main">
              Deposited at: {{ format.toDay(proposal.voting_start_time) }}
            </div>
            <div class="text-sm">{{ shortTime(proposal.voting_start_time) }}</div>
          </div>
          <div class="mb-4">
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full bg-yes mr-3"></div>
              <div class="text-base flex-1 text-main">
                Vote Start: {{ format.toDay(proposal.voting_start_time) }}
              </div>
              <div class="text-sm">{{ shortTime(proposal.voting_start_time) }}</div>
            </div>
            <div class="pl-5 text-sm mt-2">
              <Countdown :time="votingCountdown" />
            </div>
          </div>
          <div>
            <div class="flex items-center mb-1">
              <div class="w-2 h-2 rounded-full bg-success mr-3"></div>
              <div class="text-base flex-1 text-main">
                Vote End: {{ format.toDay(proposal.voting_end_time) }}
              </div>
              <div class="text-sm">{{ shortTime(proposal.voting_end_time) }}</div>
            </div>
            <div class="pl-5 text-sm">
              Current Status: {{ status }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-base-100 px-4 pt-3 pb-4 rounded mb-4 shadow">
      <h2 class="card-title">Votes</h2>
      <div class="overflow-x-auto">
        <table class="table w-full table-zebra">
          <tbody>
            <tr v-for="(item, index) of votes" :key="index">
              <td class="py-2 text-sm">{{ item.voter }}</td>
              <td v-if="item.option" class="py-2 text-sm"
                :class="{
                  'text-yes': item.option === 'VOTE_OPTION_YES',
                  'text-gray-400': item.option === 'VOTE_OPTION_ABSTAIN'
                }">
                {{ String(item.option).replace('VOTE_OPTION_', '') }}
              </td>
              <td v-if="item.options" class="py-2 text-sm">
                {{ item.options.map(x => `${x.option.replace('VOTE_OPTION_', '')}:${format.percent(x.weight)}`).join(', ') }}
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationBar :limit="pageRequest.limit" :total="pageResponse.total" :callback="pageload" />
      </div>
    </div>
  </div>
</template>