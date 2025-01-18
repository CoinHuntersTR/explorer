import { useBlockchain } from "@/stores";
import { createRouter, createWebHistory } from "vue-router";
import GovView from '@/modules/[chain]/gov/index.vue'
// @ts-ignore
import { setupLayouts } from "virtual:generated-layouts";
// @ts-ignore
import routes from "~pages";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...setupLayouts(routes),
    {
      path: '/:chain/gov',
      name: 'governance',
      component: () => import('@/modules/[chain]/gov/index.vue'),
      meta: {
        i18n: 'governance',
        order: 4
      }
    },
    {
      path: '/:chain/block',
      name: 'blocks',
      component: () => import('@/modules/[chain]/block/index.vue'),
      meta: {
        i18n: 'blocks',
        order: 2
      }
    }
  ],
});

//update current blockchain
router.beforeEach((to) => {
    const { chain } = to.params
    if(chain){
      const blockchain = useBlockchain()
      if(chain !== blockchain.chainName) {
        blockchain.setCurrent(chain.toString())
      }
    } 
})

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards

export default router;