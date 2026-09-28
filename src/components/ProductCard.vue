<script setup lang="ts">
import { computed } from 'vue';
import { Plus, Coffee } from '@lucide/vue';
import { money, type Product } from '../data/menu';
import { useCartStore } from '../stores/cart';
import { itemKey } from '../lib/cart';
import QuantityControl from './QuantityControl.vue';
const props = defineProps<{ product: Product }>();
const emit = defineEmits<{ details: [product: Product] }>();
const cart = useCartStore();
const line = computed(() =>
  cart.lines.find((l) => l.productId === props.product.id && !l.variantId),
);
function add() {
  if (props.product.variants?.length) {
    emit('details', props.product);
  } else {
    cart.add(props.product.id);
  }
}
</script>
<template>
  <article class="product-card">
    <button
      type="button"
      class="product-image-button"
      :aria-label="'Подробнее: ' + product.name"
      @click="emit('details', product)"
    >
      <div v-if="product.image" class="product-photo">
        <img
          :src="product.image"
          :alt="product.name"
          loading="lazy"
          decoding="async"
          width="720"
          height="720"
        />
      </div>
      <div v-else class="drink-art"><Coffee :size="40" :stroke-width="1" /><span>AMBER</span></div>
    </button>
    <div class="product-info">
      <h4>
        <button type="button" class="product-name" @click="emit('details', product)">
          {{ product.name }}
        </button>
      </h4>
      <div class="product-bottom">
        <strong>{{ product.variants ? 'от ' : '' }}{{ money(product.price) }}</strong
        ><QuantityControl
          v-if="line"
          :quantity="line.quantity"
          :name="product.name"
          @change="cart.setQuantity(itemKey(line), $event)"
        /><button
          v-else
          type="button"
          class="add-button"
          :aria-label="'Добавить ' + product.name"
          @click="add"
        >
          <Plus :size="17" /><span>Добавить</span>
        </button>
      </div>
    </div>
  </article>
</template>
