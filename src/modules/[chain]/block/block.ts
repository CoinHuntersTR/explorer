
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
      initialized: false,
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
      this.recents.forEach((x) => {
        if (x.block?.data?.txs) {
          x.block.data.txs.forEach((tx: Uint8Array) => {
            if (tx) {
              try {
                txs.push({
                  hash: hashTx(tx),
                  tx: decodeTxRaw(tx),
                  height: x.block?.header?.height
                });
              } catch (e) {}
            }
          });
        }
      });
      return txs;
    },
  },
  actions: {
    async initial() {
      if (!this.initialized) {
        this.initialized = true;
        this.clearRecentBlocks();
        await this.startAutoFetch();
      }
    },
    clearRecentBlocks() {
      this.recents = [];
      this.error = null;
    },
    async startAutoFetch() {
      try {
        await this.fetchLatest();
        setTimeout(() => this.startAutoFetch(), 6000);
      } catch (e) {
        console.error('Failed to fetch blocks:', e);
        setTimeout(() => this.startAutoFetch(), 6000);
      }
    },
    async fetchLatest() {
      this.isLoading = true;
      try {
        if (!this.blockchain.rpc) {
          throw new Error('RPC not initialized');
        }
        const latest = await this.blockchain.rpc.getBaseBlockLatest();
        if (!latest) throw new Error('Failed to fetch latest block');
        
        this.latest = latest;
        if (!this.recents.find(b => b.block?.header?.height === latest.block?.header?.height)) {
          if (this.recents.length >= 50) this.recents.shift();
          this.recents.push(latest);
        }
        
        this.isLoading = false;
        return latest;
      } catch (e: any) {
        this.isLoading = false;
        this.error = e.message;
        throw e;
      }
    },
    async fetchBlock(height: string) {
      this.isLoading = true;
      try {
        if (!this.blockchain.rpc) {
          throw new Error('RPC not initialized');
        }
        const block = await this.blockchain.rpc.getBaseBlockAt(height);
        if (!block) throw new Error('Failed to fetch block');
        
        this.current = block;
        this.isLoading = false;
        return block;
      } catch (e: any) {
        this.isLoading = false;
        this.error = e.message;
        throw e;
      }
    },
  },
});
