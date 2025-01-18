<script lang="ts" setup>
import MdEditor from 'md-editor-v3';
import PriceMarketChart from '@/components/charts/PriceMarketChart.vue';

import { Icon } from '@iconify/vue';
import {
  useBlockchain,
  useFormatter,
  useTxDialog,
  useWalletStore,
  useStakingStore,
  useParamStore,
  useGovStore
} from '@/stores';
import { onMounted, ref } from 'vue';
import { useIndexModule, colorMap } from './indexStore';
import { computed } from '@vue/reactivity';
import LatestBlocks from '@/components/LatestBlocks.vue'; // Imported LatestBlocks component

import CardStatisticsVertical from '@/components/CardStatisticsVertical.vue';
import ProposalListItem from '@/components/ProposalListItem.vue';
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue'
import { useRouter } from 'vue-router'
import ProposalProcess from '@/components/ProposalProcess.vue'

const props = defineProps(['chain']);

const blockchain = useBlockchain();
const store = useIndexModule();
const walletStore = useWalletStore();
const format = useFormatter();
const dialog = useTxDialog();
const stakingStore = useStakingStore();
const paramStore = useParamStore()
const govStore = useGovStore()
const router = useRouter()
const coinInfo = computed(() => {
  return store.coinInfo;
});

onMounted(async () => {
  store.loadDashboard();
  walletStore.loadMyAsset();
  paramStore.handleAbciInfo()
  activeProposals.value = await govStore.fetchProposals('2') // Fetch voting period proposals
});
const ticker = computed(() => store.coinInfo.tickers[store.tickerIndex]);

const currName = ref("")
blockchain.$subscribe((m, s) => {
  if (s.chainName !== currName.value) {
    currName.value = s.chainName
    store.loadDashboard();
    walletStore.loadMyAsset();
    paramStore.handleAbciInfo()
  }
});
function shortName(name: string, id: string) {
  return name.toLowerCase().startsWith('ibc/') ||
    name.toLowerCase().startsWith('0x')
    ? id
    : name;
}

const comLinks = [
  {
    name: 'Website',
    icon: 'mdi-web',
    href: store.homepage,
  },
  {
    name: 'Twitter',
    icon: 'mdi-twitter',
    href: store.twitter,
  },
  {
    name: 'Telegram',
    icon: 'mdi-telegram',
    href: store.telegram,
  },
  {
    name: 'Github',
    icon: 'mdi-github',
    href: store.github,
  },
];

// wallet box
const change = computed(() => {
  const token = walletStore.balanceOfStakingToken;
  return token ? format.priceChanges(token.denom) : 0;
});
const color = computed(() => {
  switch (true) {
    case change.value > 0:
      return 'text-green-600';
    case change.value === 0:
      return 'text-grey-500';
    case change.value < 0:
      return 'text-red-600';
  }
});

function updateState() {
  walletStore.loadMyAsset()
}

function trustColor(v: string) {
  return `text-${colorMap(v)}`
}

const quantity = ref(100)
const qty = computed({
  get: () => {
    return parseFloat(quantity.value.toFixed(6))
  },
  set: val => {
    quantity.value = val
  }
})
const amount = computed({
  get: () => {
    return quantity.value * ticker.value.converted_last.usd || 0
  },
  set: val => {
    quantity.value = val / ticker.value.converted_last.usd || 0
  }
})

const activeProposals = ref()

</script>

<template>
  <div>
    <div v-if="coinInfo && coinInfo.name" class="bg-base-100 rounded shadow mb-4">
      <div class="grid grid-cols-2 md:grid-cols-3 p-4">
        <div class="col-span-2 md:col-span-1">
          <div class="text-xl font-semibold text-main">
            {{ coinInfo.name }} (<span class="uppercase">{{
              coinInfo.symbol
            }}</span>)
          </div>
          <div class="text-xs mt-2">
            {{ $t('index.rank') }}:
            <div class="badge text-xs badge-error bg-[#fcebea] dark:bg-[#41384d] text-red-400">
              #{{ coinInfo.market_cap_rank }}
            </div>
          </div>

          <div class="my-4 flex flex-wrap items-center">
            <a v-for="(item, index) of comLinks" :key="index" :href="item.href"
              class="link link-primary px-2 py-1 rounded-sm no-underline hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center">
              <Icon :icon="item?.icon" />
              <span class="ml-1 text-sm uppercase">{{ item?.name }}</span>
            </a>
          </div>

          <div>
            <div class="dropdown dropdown-hover w-full">
              <label>
                <div
                  class="bg-gray-100 dark:bg-[#384059] flex items-center justify-between px-4 py-2 cursor-pointer rounded">
                  <div>
                    <div class="font-semibold text-xl text-[#666] dark:text-white">
                      {{ ticker?.market?.name || '' }}
                    </div>
                    <div class="text-info text-sm">
                      {{ shortName(ticker?.base, ticker?.coin_id) }}/{{
                        shortName(ticker?.target, ticker?.target_coin_id)
                      }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-xl font-semibold text-[#666] dark:text-white">
                      ${{ ticker?.converted_last?.usd }}
                    </div>
                    <div class="text-sm" :class="store.priceColor">
                      {{ store.priceChange }}%
                    </div>
                  </div>
                </div>
              </label>
              <div class="dropdown-content pt-1">
                <div class="h-64 overflow-auto w-full shadow rounded">
                  <ul class="menu w-full bg-gray-100 rounded dark:bg-[#384059]">
                    <li v-for="(item, index) in store.coinInfo.tickers" :key="index" @click="store.selectTicker(index)">
                      <div class="flex items-center justify-between hover:bg-base-100">
                        <div class="flex-1">
                          <div class="text-main text-sm" :class="trustColor(item.trust_score)">
                            {{ item?.market?.name }}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">
                            {{ shortName(item?.base, item?.coin_id) }}/{{
                              shortName(item?.target, item?.target_coin_id)
                            }}
                          </div>
                        </div>

                        <div class="text-base text-main">
                           ${{ item?.converted_last?.usd }}
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="flex">
              <label class="btn btn-primary !px-1 my-5 mr-2" for="calculator">
                <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="4" y="2" width="16" height="20" rx="2"></rect> <line x1="8" x2="16" y1="6" y2="6"></line> <line x1="16" x2="16" y1="14" y2="18"></line> <path d="M16 10h.01"></path> <path d="M12 10h.01"></path> <path d="M8 10h.01"></path> <path d="M12 14h.01"></path> <path d="M8 14h.01"></path> <path d="M12 18h.01"></path> <path d="M8 18h.01"></path> </g></svg>
              </label>
              <!-- Put this part before </body> tag -->
              <input type="checkbox" id="calculator" class="modal-toggle" />
              <div class="modal">
                <div class="modal-box">
                  <h3 class="text-lg font-bold">{{ $t('index.price_calculator') }}</h3>
                  <div class="flex flex-col w-full mt-5">
                    <div class="grid h-20 flex-grow card rounded-box place-items-center">
                      <div class="join w-full">
                        <label class="join-item btn">
                          <span class="uppercase">{{ coinInfo.symbol }}</span>
                        </label>
                        <input type="number" v-model="qty" min="0" placeholder="Input a number" class="input grow input-bordered join-item" />
                      </div>
                    </div>
                    <div class="divider">=</div>
                    <div class="grid h-20 flex-grow card rounded-box place-items-center">
                      <div class="join w-full">
                        <label class="join-item btn">
                          <span>USD</span>
                        </label>
                        <input type="number" v-model="amount" min="0" placeholder="Input amount" class="join-item grow input input-bordered" />
                      </div>
                    </div>
                  </div>
                </div>
                <label class="modal-backdrop" for="calculator">{{ $t('index.close') }}</label>
              </div>
              <a class="my-5 !text-white btn grow" :class="{'!btn-success': store.trustColor === 'green', '!btn-warning': store.trustColor === 'yellow'}" :href="ticker.trade_url"
                target="_blank">
                {{ $t('index.buy') }} {{ coinInfo.symbol || '' }}
              </a>
            </div>
          </div>
        </div>

        <div class="col-span-2">
          <PriceMarketChart />
        </div>
      </div>
      <div class="h-[1px] w-full bg-gray-100 dark:bg-[#384059]"></div>
      <div class="max-h-[250px] overflow-auto p-4 text-sm">
        <MdEditor :model-value="coinInfo.description?.en" previewOnly></MdEditor>
      </div>
      <div class="mx-4 flex flex-wrap items-center">
        <div v-for="tag in coinInfo.categories"
          class="mr-2 mb-4 text-xs bg-gray-100 dark:bg-[#384059] px-3 rounded-full py-1">
          {{ tag }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Statistics Card -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-lg font-semibold text-main dark:text-white mb-4">Chain Statistics</h3>
          <div class="grid grid-cols-2 gap-4">
            <!-- Height -->
            <div class="stats-card p-4 rounded-xl">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                  <Icon icon="mdi-cube-outline" class="text-primary text-xl" />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-300">Height</span>
              </div>
              <div class="text-xl font-semibold">{{ store.stats[0]?.value }}</div>
            </div>

            <!-- Validators -->
            <div class="stats-card p-4 rounded-xl">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mr-3">
                  <Icon icon="mdi-account-group" class="text-success text-xl" />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-300">Validators</span>
              </div>
              <div class="text-xl font-semibold">{{ store.stats[1]?.value }}</div>
            </div>

            <!-- Supply -->
            <div class="stats-card p-4 rounded-xl">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center mr-3">
                  <Icon icon="mdi-currency-usd" class="text-info text-xl" />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-300">Supply</span>
              </div>
              <div class="text-xl font-semibold">{{ store.stats[2]?.value || '-' }}</div>
            </div>

            <!-- Bonded Tokens -->
            <div class="stats-card p-4 rounded-xl">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center mr-3">
                  <Icon icon="mdi-lock" class="text-warning text-xl" />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-300">Bonded Tokens</span>
              </div>
              <div class="text-xl font-semibold">{{ store.stats[3]?.value || '-' }}</div>
            </div>

            <!-- Inflation -->
            <div class="stats-card p-4 rounded-xl">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center mr-3">
                  <Icon icon="mdi-trending-up" class="text-error text-xl" />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-300">Inflation</span>
              </div>
              <div class="text-xl font-semibold">{{ store.stats[4]?.value }}</div>
            </div>

            <!-- Community Pool -->
            <div class="stats-card p-4 rounded-xl">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center mr-3">
                  <Icon icon="mdi-bank" class="text-secondary text-xl" />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-300">Community Pool</span>
              </div>
              <div class="text-xl font-semibold">{{ store.stats[5]?.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Proposals Card -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-lg font-semibold text-main dark:text-white mb-4">Active Proposals</h3>
          <div v-if="activeProposals?.proposals?.length > 0" class="space-y-4">
            <div v-for="proposal in activeProposals.proposals" :key="proposal.proposal_id" 
                 class="bg-base-200/50 p-4 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer"
                 @click="router.push(`/${chain}/gov/${proposal.proposal_id}`)">
              <div class="flex justify-between items-start mb-2">
                <div class="badge badge-info">VOTING</div>
                <h4 class="text-lg font-medium">#{{ proposal.proposal_id }}</h4>
              </div>
              <h5 class="text-base font-medium mb-3 line-clamp-2">{{ proposal.content?.title || proposal.title }}</h5>
              <ProposalProcess :pool="stakingStore.pool" :tally="proposal.final_tally_result" />
              <div class="text-sm text-gray-500 mt-2">
                Ends: {{ format.toDay(proposal.voting_end_time, 'from') }}
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            No active proposals at this time
          </div>
        </div>
      </div>
    </div>

    <div class="bg-base-100 rounded mt-4 shadow">
      <div class="flex justify-between px-4 pt-4 pb-2 text-lg font-semibold text-main">
        <span class="truncate" >{{ walletStore.currentAddress || 'Not Connected' }}</span>
        <RouterLink v-if="walletStore.currentAddress"
          class="float-right text-sm cursor-pointert link link-primary no-underline font-medium"
          :to="`/${chain}/account/${walletStore.currentAddress}`">{{ $t('index.more') }}</RouterLink>
      </div>
      <div class="grid grid-cols-1 md:!grid-cols-4 auto-cols-auto gap-4 px-4 pb-6">
        <div class="bg-gray-100 dark:bg-[#373f59] rounded-sm px-4 py-3">
          <div class="text-sm mb-1">{{ $t('account.balance') }}</div>
          <div class="text-lg font-semibold text-main">
            {{ format.formatToken(walletStore.balanceOfStakingToken) }}
          </div>
          <div class="text-sm" :class="color">
            ${{ format.tokenValue(walletStore.balanceOfStakingToken) }}
          </div>
        </div>
        <div class="bg-gray-100 dark:bg-[#373f59] rounded-sm px-4 py-3">
          <div class="text-sm mb-1">{{ $t('module.staking') }}</div>
          <div class="text-lg font-semibold text-main">
            {{ format.formatToken(walletStore.stakingAmount) }}
          </div>
          <div class="text-sm" :class="color">
            ${{ format.tokenValue(walletStore.stakingAmount) }}
          </div>
        </div>
        <div class="bg-gray-100 dark:bg-[#373f59] rounded-sm px-4 py-3">
          <div class="text-sm mb-1">{{ $t('index.reward') }}</div>
          <div class="text-lg font-semibold text-main">
            {{ format.formatToken(walletStore.rewardAmount) }}
          </div>
          <div class="text-sm" :class="color">
            ${{ format.tokenValue(walletStore.rewardAmount) }}
          </div>
        </div>
        <div class="bg-gray-100 dark:bg-[#373f59] rounded-sm px-4 py-3">
          <div class="text-sm mb-1">{{ $t('index.unbonding') }}</div>
          <div class="text-lg font-semibold text-main">
            {{ format.formatToken(walletStore.unbondingAmount) }}
          </div>
          <div class="text-sm" :class="color">
            ${{ format.tokenValue(walletStore.unbondingAmount) }}
          </div>
        </div>
      </div>

      <div v-if="walletStore.delegations.length > 0" class="px-4 pb-4 overflow-auto">
        <table class="table table-compact w-full table-zebra">
          <thead>
            <tr>
              <th>{{ $t('account.validator') }}</th>
              <th>{{ $t('account.delegations') }}</th>
              <th>{{ $t('account.rewards') }}</th>
              <th>{{ $t('staking.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in walletStore.delegations" :key="index">
              <td>
                <RouterLink class="link link-primary no-underline" :to="`/${chain}/staking/${item?.delegation?.validator_address}`">
                {{
                  format.validatorFromBech32(
                    item?.delegation?.validator_address
                  )
                }}
                </RouterLink>
              </td>
              <td>{{ format.formatToken(item?.balance) }}</td>
              <td>
                {{
                  format.formatTokens(
                    walletStore?.rewards?.rewards?.find(
                      (el) =>
                        el?.validator_address ===
                        item?.delegation?.validator_address
                    )?.reward)
                }}
              </td>
              <td>
                <div>
                  <label for="delegate" class="btn !btn-xs !btn-primary btn-ghost rounded-sm mr-2"
                    @click="dialog.open('delegate', { validator_address: item.delegation.validator_address }, updateState)">
                    {{ $t('account.btn_delegate') }}
                  </label>
                  <label for="withdraw" class="btn !btn-xs !btn-primary btn-ghost rounded-sm"
                    @click="dialog.open('withdraw', { validator_address: item.delegation.validator_address }, updateState)">
                    {{ $t('index.btn_withdraw_reward') }}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-3 gap-4 px-4 pb-6 mt-4">
        <label for="PingTokenConvert" class="btn btn-primary text-white">{{ $t('index.btn_swap') }}</label>
        <label for="send" class="btn !bg-yes !border-yes text-white" @click="dialog.open('send', {}, updateState)">{{ $t('account.btn_send') }}</label>
        <label for="delegate" class="btn !bg-info !border-info text-white"
          @click="dialog.open('delegate', {}, updateState)">{{ $t('account.btn_delegate') }}</label>
        <RouterLink to="/wallet/receive" class="btn !bg-info !border-info text-white hidden">{{ $t('index.receive') }}</RouterLink>
      </div>
      <Teleport to="body">
        <ping-token-convert :chain-name="blockchain?.current?.prettyName" :endpoint="blockchain?.endpoint?.address"
          :hd-path="walletStore?.connectedWallet?.hdPath"></ping-token-convert>
      </Teleport>
    </div>

    <div class="bg-base-100 rounded mt-4">
      <!-- Latest Blocks -->
      <LatestBlocks :chain="$route.params.chain" />
      <div class="h-4"></div>
    </div>

    <div v-if="!store.coingeckoId" class="bg-base-100 rounded mt-4">
      <div class="px-4 pt-4 pb-2 text-lg font-semibold text-main">
        {{ $t('index.node_info') }}
      </div>
      <ArrayObjectElement :value="paramStore.nodeVersion?.items" :thead="false" />      
      <div class="h-4"></div>
    </div>
  </div>
</template>

<route>
  {
    meta: {
      i18n: 'dashboard',
      order: 1,
    }
  }
</route>