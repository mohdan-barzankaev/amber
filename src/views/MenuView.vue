<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowDown, ArrowUpRight, Clock3, Search, X } from '@lucide/vue';
import { categories, products, positionCount, type Group, type Product } from '../data/menu';
import ProductCard from '../components/ProductCard.vue';
import ProductDialog from '../components/ProductDialog.vue';
import { assetUrl } from '../lib/assets';
const route = useRoute();
const router = useRouter();
const group = ref<Group>('food');
const category = ref('breakfast');
const search = ref('');
const selectedProduct = ref<Product | null>(null);
const currentCategories = computed(() => categories.filter((c) => c.group === group.value));
const visibleProducts = computed(() =>
  products.filter(
    (p) =>
      p.group === group.value &&
      (search.value.trim()
        ? p.name.toLocaleLowerCase('ru-RU').includes(search.value.trim().toLocaleLowerCase('ru-RU'))
        : p.categories.includes(category.value)),
  ),
);
watch(
  () => route.query,
  (query) => {
    group.value = query.group === 'drinks' ? 'drinks' : 'food';
    category.value = currentCategories.value.some((c) => c.id === query.category)
      ? String(query.category)
      : currentCategories.value[0].id;
  },
  { immediate: true },
);
function selectGroup(next: Group) {
  search.value = '';
  selectCategory(categories.find((c) => c.group === next)!.id, next);
}
function selectCategory(id: string, next: Group = group.value) {
  search.value = '';
  router.replace({ path: '/', query: { group: next, category: id }, hash: '#menu' });
}
</script>
<template>
  <section class="hero container">
    <div class="hero-copy">
      <span class="eyebrow"><span class="tiny-line"></span> AMBER SPECIALTY COFFEE</span>
      <h1>Дом там, где<br /><em>вкусная еда.</em></h1>
      <p>Любимый кофе, неспешные завтраки<br />и тёплые встречи в самом сердце Грозного.</p>
      <RouterLink to="/#menu" class="primary-button"
        >Выбрать что-нибудь вкусное <ArrowDown :size="17"
      /></RouterLink>
      <div class="hero-details">
        <span><Clock3 :size="16" /> Каждый день, 08:00–23:00</span><span class="dot"></span
        ><span>Доставка и самовывоз</span>
      </div>
    </div>
    <div class="hero-visual">
      <img
        class="hero-photo"
        :src="assetUrl('/images/c1e1b6.webp')"
        alt="Брускетта с креветками из меню Amber"
        fetchpriority="high"
        width="720"
        height="720"
      />
      <div class="hero-brand-seal">
        <img
          :src="assetUrl('/brand/amber-logo.svg')"
          alt="Amber Specialty Coffee"
          width="100"
          height="100"
        />
      </div>
      <div class="hero-photo-label">
        <span>Хорошее утро начинается здесь</span><ArrowUpRight :size="18" />
      </div>
    </div>
  </section>
  <div class="menu-divider">
    <span>КОФЕ, ЕДА И НЕМНОГО СЧАСТЬЯ</span><span>С ЛЮБОВЬЮ, AMBER</span>
  </div>
  <section id="menu" class="menu-section container">
    <div class="menu-heading">
      <div>
        <span class="eyebrow">НАЙДИТЕ СВОЁ ЛЮБИМОЕ</span>
        <h2>Наше меню</h2>
      </div>
      <div class="group-tabs" aria-label="Тип меню">
        <button
          :class="{ active: group === 'food' }"
          :aria-pressed="group === 'food'"
          @click="selectGroup('food')"
        >
          Еда</button
        ><button
          :class="{ active: group === 'drinks' }"
          :aria-pressed="group === 'drinks'"
          @click="selectGroup('drinks')"
        >
          Напитки
        </button>
      </div>
    </div>
    <nav class="category-tabs" aria-label="Категории меню">
      <button
        v-for="item in currentCategories"
        :key="item.id"
        :class="{ active: category === item.id && !search.trim() }"
        :aria-pressed="category === item.id && !search.trim()"
        @click="selectCategory(item.id)"
      >
        {{ item.name }}
      </button>
    </nav>
    <div class="menu-tools">
      <div class="category-heading">
        <h3>
          {{
            search.trim() ? 'Результаты поиска' : categories.find((c) => c.id === category)?.name
          }}
        </h3>
        <span>{{ positionCount(visibleProducts.length) }}</span>
      </div>
      <div class="search-field">
        <Search :size="16" /><input
          v-model="search"
          type="search"
          aria-label="Поиск по меню"
          placeholder="Найти любимое…"
          maxlength="100"
        /><button v-if="search" type="button" aria-label="Очистить поиск" @click="search = ''">
          <X :size="15" />
        </button>
      </div>
    </div>
    <div v-if="visibleProducts.length" class="product-grid">
      <ProductCard
        v-for="product in visibleProducts"
        :key="product.id"
        :product="product"
        @details="selectedProduct = $event"
      />
    </div>
    <div v-else class="search-empty">
      <Search :size="32" :stroke-width="1" />
      <h3>Ничего не нашли</h3>
      <p>Попробуйте другое название или посмотрите категории.</p>
      <button type="button" class="text-button" @click="search = ''">Сбросить поиск</button>
    </div>
    <p class="menu-photo-note">Внешний вид блюда может немного отличаться от фотографии.</p>
    <ProductDialog :product="selectedProduct" @close="selectedProduct = null" />
  </section>
</template>
