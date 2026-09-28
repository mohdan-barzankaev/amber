<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { registerMenuTools } from './lib/webmcp';
import { MapPin, ShoppingBag, ArrowUpRight } from '@lucide/vue';
import { useCartStore } from './stores/cart';
import CartDrawer from './components/CartDrawer.vue';
import { money } from './data/menu';
import { cafe, mapLink } from './data/config';
import { assetUrl } from './lib/assets';
const cart = useCartStore();
let unregisterTools = () => {};
onMounted(() => {
  unregisterTools = registerMenuTools();
});
onUnmounted(() => unregisterTools());
</script>
<template>
  <a class="skip-link" href="#main">Перейти к содержимому</a>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand" aria-label="Amber — главная"
        ><img :src="assetUrl('/brand/amber-mark.svg')" alt="" width="33" height="43" /><span
          ><strong>AMBER</strong><small>SPECIALTY COFFEE</small></span
        ></RouterLink
      >
      <nav class="desktop-nav" aria-label="Основная навигация">
        <RouterLink to="/#menu">Меню</RouterLink
        ><RouterLink to="/#locations">Наши кофейни</RouterLink>
      </nav>
      <div class="header-actions">
        <span class="header-city"><MapPin :size="15" /> Грозный</span
        ><button
          class="cart-button"
          :aria-label="`Открыть корзину, товаров: ${cart.count}`"
          @click="cart.open = true"
        >
          <ShoppingBag :size="18" /><span>Корзина</span><b>{{ cart.count }}</b>
        </button>
      </div>
    </div>
  </header>
  <main id="main"><RouterView /></main>
  <footer id="locations" class="site-footer">
    <div class="footer-top">
      <div>
        <span class="eyebrow">ВСЕГДА РЯДОМ</span>
        <h2>Два адреса.<br />Одно любимое место.</h2>
      </div>
      <div class="location-list">
        <a
          v-for="location in cafe.locations"
          :key="location.id"
          :href="mapLink(location.fullAddress)"
          target="_blank"
          rel="noopener noreferrer"
          ><span
            ><small>ГРОЗНЫЙ</small><strong>{{ location.address }}</strong
            ><span>Ежедневно · {{ cafe.hours }}</span></span
          ><ArrowUpRight :size="22"
        /></a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© {{ new Date().getFullYear() }} Amber Specialty Coffee</span
      ><a :href="'tel:+' + cafe.whatsapp">{{ cafe.phone }}</a
      ><RouterLink to="/privacy">О данных заказа</RouterLink>
    </div>
  </footer>
  <button
    v-if="cart.count && $route.path !== '/checkout'"
    class="mobile-cart-bar"
    @click="cart.open = true"
  >
    <ShoppingBag :size="19" /><span>Корзина · {{ cart.count }}</span
    ><strong>{{ money(cart.total) }}</strong>
  </button>
  <CartDrawer />
</template>
