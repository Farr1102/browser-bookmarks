import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Home.vue'),
      children: [
        {
          path: '',
          component: () => import('../views/CategoryView.vue'),
          props: { categoryId: 'default' }
        },
        {
          path: 'category/:categoryId',
          name: 'category',
          component: () => import('../views/CategoryView.vue'),
          props: true
        }
      ]
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue')
    }
  ]
});

export default router; 