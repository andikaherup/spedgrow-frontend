import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/dashboard'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/dashboard'
      },
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'transactions',
        component: () => import('../views/TransactionList.vue')
      },
      {
        path: 'transactions/:id',
        component: () => import('../views/TransactionDetail.vue')
      },
      {
        path: 'nfc',
        component: () => import('../views/NFCPayment.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;