import { createRouter, createWebHistory } from 'vue-router';
import MenuView from './views/MenuView.vue';
export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: MenuView },
    { path: '/menu', redirect: '/' },
    { path: '/checkout', component: () => import('./views/CheckoutView.vue') },
    { path: '/privacy', component: () => import('./views/PrivacyView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.hash) return { el: to.hash, top: 120, behavior: 'smooth' };
    if (to.path !== from.path) return { top: 0 };
  },
});
