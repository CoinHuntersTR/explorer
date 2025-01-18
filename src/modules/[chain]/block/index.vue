<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useBlockModule } from './block';
import { useFormatter } from '@/stores';
const props = defineProps(['chain']);

const tab = ref('blocks');
const blockStore = useBlockModule();
const format = useFormatter();

onMounted(async () => {
  await blockStore.initial();
});

const list = computed(() => blockStore.recents);

const isLoading = computed(() => blockStore.isLoading);
const error = computed(() => blockStore.error);
</script>
<template>
  <div>
    <div class="tabs tabs-boxed bg-transparent mb-4">
      <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === 'blocks' }"
        @click="tab = 'blocks'">{{ $t('block.recent') }}</a>
      <RouterLink class="tab text-gray-400 uppercase" 
        :to="`/${chain}/block/${Number(blockStore.latest?.block?.header.height||0) + 10000}`"
        >{{ $t('block.future') }}</RouterLink>
      <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === 'transactions' }"
        @click="tab = 'transactions'">{{ $t('account.transactions') }}</a>
    </div>

    <div v-if="isLoading && !list.length" class="flex justify-center items-center py-8">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else>
      <div v-show="tab === 'blocks'" class="grid xl:!grid-cols-6 md:!grid-cols-4 grid-cols-1 gap-3">
        <RouterLink v-for="item in list" :key="item.block?.header?.height"
          class="flex flex-col justify-between rounded p-4 shadow bg-base-100"
          :to="`/${chain}/block/${item.block.header.height}`">
          <div class="flex justify-between">
            <h3 class="text-md font-bold sm:!text-lg">
              {{ item.block.header.height }}
            </h3>
            <span class="rounded text-xs whitespace-nowrap font-medium text-green-600">
              {{ format.toDay(item.block?.header?.time, 'from') }}
            </span>
          </div>
          <div class="flex justify-between tooltip" data-tip="Block Proposor">
            <div class="mt-2 hidden text-sm sm:!block truncate">
              <span>{{ format.validator(item.block?.header?.proposer_address) }}</span>
            </div>
            <span class="text-right mt-1 whitespace-nowrap"> {{ item.block?.data?.txs.length }} txs </span>
          </div>
        </RouterLink>
      </div>

      <div v-show="tab === 'transactions'" class="bg-base-100 rounded overflow-x-auto">
        <table class="table w-full table-compact">
          <thead class="bg-base-200">
            <tr>
              <th>{{ $t('account.height') }}</th>
              <th>{{ $t('account.hash') }}</th>
              <th>{{ $t('account.messages') }}</th>
              <th>{{ $t('block.fees') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in blockStore.txsInRecents" :key="index" class="hover">
              <td class="text-sm text-primary">
                <RouterLink :to="`/${props.chain}/block/${item.height}`">{{ item.height }}</RouterLink>
              </td>
              <td class="truncate text-primary" width="50%">
                <RouterLink :to="`/${props.chain}/tx/${item.hash}`">{{ item.hash }}</RouterLink>
              </td>
              <td>{{ format.messages(item.tx.body.messages) }}</td>
              <td>{{ format.formatTokens(item.tx.authInfo.fee?.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'blocks',
        order: 5
      }
    }
  </route>