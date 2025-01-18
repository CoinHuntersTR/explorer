
import { defineStore } from 'pinia';
import { decodeTxRaw, type DecodedTxRaw } from '@cosmjs/proto-signing';
import { useBlockchain } from '@/stores';
import { hashTx } from '@/libs';
import type { Block } from '@/types';

export const useBlockModule = defineStore('blockModule', {
  state: () => {
    return {
      latest: {} as Block,
      current: {} as Block,
      recents: [] as Block[],
      isLoading: false,
      error: null as string | null,
    };
  },
  getters: {
    blockchain() {
      return useBlockchain();
    },
    blocktime() {
      if (this.recents.length < 2) return 6000;
      const latest = this.recents[0];
      const oldest = this.recents[this.recents.length - 1];
      if (!latest?.block?.header?.time || !oldest?.block?.header?.time) return 6000;
      const diff = new Date(latest.block.header.time).getTime() - new Date(oldest.block.header.time).getTime();
      return Math.floor(diff / this.recents.length);
    },
    txsInRecents() {
      const txs = [] as { hash: string; tx: DecodedTxRaw; height?: string }[];
      this.recents.forEach((x) =>
        x.block?.data?.txs.forEach((tx: Uint8Array) => {
          if (tx) {
            try {
              txs.push({
                hash: hashTx(tx),
                tx: decodeTxRaw(tx),
                height: x.block?.header?.height
              });
            } catch (e) {}
          }
        })
      );
      return txs;
    },
  },
  actions: {
    async initial() {
      this.clearRecentBlocks();
      await this.autoFetch();
    },
    clearRecentBlocks() {
      this.recents = [];
      this.error = null;
    },
    async autoFetch() {
      try {
        const block = await this.fetchLatest();
        this.latest = block;
        setTimeout(() => this.autoFetch(), 6000);
      } catch (e) {
        console.error('Failed to fetch latest block:', e);
        setTimeout(() => this.autoFetch(), 6000);
      }
    },
    async fetchLatest() {
      this.isLoading = true;
      try {
        const latest = await this.blockchain.rpc?.getBaseBlockLatest();
        if (!latest) throw new Error('Failed to fetch latest block');
        
        if (this.recents.length >= 50) this.recents.shift();
        this.recents.push(latest);
        
        return latest;
      } catch (e: any) {
        this.error = e.message;
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchBlock(height: string) {
      this.isLoading = true;
      try {
        const block = await this.blockchain.rpc?.getBaseBlockAt(height);
        if (!block) throw new Error('Failed to fetch block');
        
        this.current = block;
        return block;
      } catch (e: any) {
        this.error = e.message;
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
