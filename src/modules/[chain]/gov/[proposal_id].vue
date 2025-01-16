<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import MdEditor from 'md-editor-v3';
import ObjectElement from '@/components/dynamic/ObjectElement.vue';
import {
  useBaseStore,
  useBlockchain,
  useFormatter,
  useGovStore,
  useStakingStore,
  useTxDialog,
} from '@/stores';
import {
  PageRequest,
  type GovProposal,
  type GovVote,
  type PaginatedProposalDeposit,
  type Pagination,
} from '@/types';
import { ref, reactive } from 'vue';
import Countdown from '@/components/Countdown.vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { fromBech32, toHex } from '@cosmjs/encoding';


const props = defineProps(['proposal_id', 'chain']);
const proposal = ref({} as GovProposal);
const format = useFormatter();
const store = useGovStore();
const dialog = useTxDialog();
const stakingStore = useStakingStore();
const chainStore = useBlockchain();

store.fetchProposal(props.proposal_id).then((res) => {
  const proposalDetail = reactive(res.proposal);
  // when status under the voting, final_tally_result are no data, should request fetchTally
  if (res.proposal?.status === 'PROPOSAL_STATUS_VOTING_PERIOD') {
    store.fetchTally(props.proposal_id).then((tallRes) => {
      proposalDetail.final_tally_result = tallRes?.tally;
    });
  }
  proposal.value = proposalDetail;
  // load origin params if the proposal is param change
  if(proposalDetail.content?.changes) {
    proposalDetail.content?.changes.forEach((item) => {  
        chainStore.rpc.getParams(item.subspace, item.key).then((res) => {
          if(proposal.value.content && res.param) {
            if(proposal.value.content.current){
              proposal.value.content.current.push(res.param);
            } else {
              proposal.value.content.current = [res.param];
            };
          }
        })
    })
  }

  const msgType = proposalDetail.content['@type'] || '';
  if(msgType.endsWith('MsgUpdateParams')) {
    if(msgType.indexOf('staking') > -1) {
      chainStore.rpc.getStakingParams().then((res) => {
        addCurrentParams(res);
      });
    } else if(msgType.indexOf('gov') > -1) {
      chainStore.rpc.getGovParamsVoting().then((res) => {
        addCurrentParams(res);
      });
    } else if(msgType.indexOf('distribution') > -1) {
      chainStore.rpc.getDistributionParams().then((res) => {
        addCurrentParams(res);
      });
    } else if(msgType.indexOf('slashing') > -1) {
      chainStore.rpc.getSlashingParams().then((res) => {
        addCurrentParams(res);
      });
    }
  }
});

function addCurrentParams(res: any) {
  if(proposal.value.content && res.params) {
    proposal.value.content.params = [proposal.value.content?.params];
    proposal.value.content.current = [res.params];
  }
}
const color = computed(() => {
  if (proposal.value.status === 'PROPOSAL_STATUS_PASSED') {
    return 'success';
  } else if (proposal.value.status === 'PROPOSAL_STATUS_REJECTED') {
    return 'error';
  }
  return '';
});
const status = computed(() => {
  if (proposal.value.status) {
    return proposal.value.status.replace('PROPOSAL_STATUS_', '');
  }
  return '';
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
  if (v) {
    return format.toDay(v, 'from');
  }
  return '';
}

const votingCountdown = computed((): number => {
  const now = new Date();
  const end = new Date(proposal.value.voting_end_time);
  return end.getTime() - now.getTime();
});

const upgradeCountdown = computed((): number => {
  const height = Number(proposal.value.content?.plan?.height || 0);
  if (height > 0) {
    const base = useBaseStore();
    const current = Number(base.latest?.block?.header?.height || 0);
    return (height - current) * 6 * 1000;
  }
  const now = new Date();
  const end = new Date(proposal.value.content?.plan?.time || '');
  return end.getTime() - now.getTime();
});

const total = computed(() => {
  const tally = proposal.value.final_tally_result;
  let sum = 0;
  if (tally) {
    sum += Number(tally.abstain || 0);
    sum += Number(tally.yes || 0);
    sum += Number(tally.no || 0);
    sum += Number(tally.no_with_veto || 0);
  }
  return sum;
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
    const yes = proposal.value?.final_tally_result?.yes || 0;
    return format.percent(Number(yes) / total.value);
  }
  return 0;
});

const no = computed(() => {
  if (total.value > 0) {
    const value = proposal.value?.final_tally_result?.no || 0;
    return format.percent(Number(value) / total.value);
  }
  return 0;
});

const veto = computed(() => {
  if (total.value > 0) {
    const value = proposal.value?.final_tally_result?.no_with_veto || 0;
    return format.percent(Number(value) / total.value);
  }
  return 0;
});

const abstain = computed(() => {
  if (total.value > 0) {
    const value = proposal.value?.final_tally_result?.abstain || 0;
    return format.percent(Number(value) / total.value);
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

function showValidatorName(voter: string) {
  const { data } = fromBech32(voter);
  const hex = toHex(data);
  const v = stakingStore.validators.find(
    (x) => toHex(fromBech32(x.operator_address).data) === hex
  );
  return v ? v.description.moniker : voter;
}

function pageload(p: number) {
  pageRequest.value.setPage(p);
  store.fetchProposalVotes(props.proposal_id, pageRequest.value).then((x) => {
    votes.value = x.votes;
    pageResponse.value = x.pagination;
  });
}

function metaItem(metadata: string|undefined): { title: string; summary: string } {
  return metadata ? JSON.parse(metadata) : {}
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">
          #{{ proposal_id }}. {{ proposal.title || proposal.content?.title || metaItem(proposal?.metadata)?.title }}
        </h1>
        <div :class="`px-4 py-2 rounded-full text-sm font-semibold ${
          status === 'PASSED' ? 'bg-green-100 text-green-700' :
          status === 'REJECTED' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`">
          {{ status }}
        </div>
      </div>

      <!-- Type and Description Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center mb-2">
            <i class="fas fa-code-branch mr-2"></i>
            <h3 class="font-semibold">Type</h3>
          </div>
          <p class="text-gray-600 dark:text-gray-300">{{ proposal.content?.['@type'] }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div class="flex items-center mb-2">
            <i class="fas fa-file-alt mr-2"></i>
            <h3 class="font-semibold">Description</h3>
          </div>
          <div class="prose dark:prose-invert max-w-none">
            <MdEditor
              :model-value="proposal.content?.description || metaItem(proposal?.metadata)?.summary"
              previewOnly
              class="!bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Voting Status -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg col-span-1">
        <h2 class="text-xl font-bold mb-4">Voting Status</h2>
        <div class="space-y-4">
          <div v-for="(item, index) of processList" :key="index" 
               class="relative">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium">{{ item.name }}</span>
              <span class="text-sm font-medium">{{ item.value }}</span>
            </div>
            <div class="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
              <div :class="item.class" 
                   class="h-full rounded-full transition-all duration-300"
                   :style="`width: ${item.value === '-' || item.value === 'NaN%' ? '0%' : item.value}`">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg col-span-2">
        <h2 class="text-xl font-bold mb-6">Timeline</h2>
        <div class="relative pl-8 space-y-8">
          <div class="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>

          <TimelineItem icon="fas fa-paper-plane" 
                       :active="true"
                       title="Submitted"
                       :date="proposal.submit_time"
                       :timeAgo="shortTime(proposal.submit_time)" />

          <TimelineItem icon="fas fa-coins"
                       :active="proposal.status !== 'PROPOSAL_STATUS_DEPOSIT_PERIOD'"
                       title="Deposit Period"
                       :date="proposal.deposit_end_time"
                       :timeAgo="shortTime(proposal.deposit_end_time)" />

          <TimelineItem icon="fas fa-vote-yea"
                       :active="proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD'"
                       title="Voting Period"
                       :date="proposal.voting_end_time"
                       :timeAgo="shortTime(proposal.voting_end_time)">
            <template #extra>
              <Countdown v-if="proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD'" 
                        :time="votingCountdown" 
                        class="text-sm text-blue-500" />
            </template>
          </TimelineItem>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 mb-6">
      <button @click="dialog.open('vote', { proposal_id })"
              class="flex-1 bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg transition duration-200">
        Vote
      </button>
      <button @click="dialog.open('deposit', { proposal_id })"
              class="flex-1 bg-secondary hover:bg-secondary-dark text-white py-3 px-6 rounded-lg transition duration-200">
        Deposit
      </button>
    </div>

    <!-- Votes List -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 class="text-xl font-bold mb-4">Votes</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(item, index) of votes" :key="index"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
              <td class="py-4 px-6">{{ showValidatorName(item.voter) }}</td>
              <td class="py-4 px-6">
                <span :class="{
                  'text-green-500': item.option === 'VOTE_OPTION_YES',
                  'text-red-500': item.option === 'VOTE_OPTION_NO',
                  'text-yellow-500': item.option === 'VOTE_OPTION_ABSTAIN',
                  'text-purple-500': item.option === 'VOTE_OPTION_NO_WITH_VETO'
                }">
                  {{ String(item.option).replace('VOTE_OPTION_', '') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationBar
          :limit="pageRequest.limit"
          :total="pageResponse.total"
          :callback="pageload"
        />
      </div>
    </div>
  </div>
</template>