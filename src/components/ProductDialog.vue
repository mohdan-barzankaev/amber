<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  RadioGroupRoot,
  RadioGroupItem,
} from 'reka-ui';
import { X, Plus, Check, Coffee } from '@lucide/vue';
import { type Product, money, categories } from '../data/menu';
import { useCartStore } from '../stores/cart';
const props = defineProps<{ product: Product | null }>();
const emit = defineEmits<{ close: [] }>();
const cart = useCartStore();
const variantId = ref('');
const added = ref(false);
watch(
  () => props.product,
  (product) => {
    variantId.value = product?.variants?.[0]?.id ?? '';
    added.value = false;
  },
);
const price = computed(
  () =>
    props.product?.variants?.find((v) => v.id === variantId.value)?.price ??
    props.product?.price ??
    0,
);
function add() {
  if (props.product) {
    cart.add(props.product.id, variantId.value || undefined);
    added.value = true;
  }
}
</script>
<template>
  <DialogRoot :open="!!product" @update:open="(value) => !value && emit('close')"
    ><DialogPortal
      ><DialogOverlay class="dialog-overlay" /><DialogContent v-if="product" class="product-dialog"
        ><DialogClose class="dialog-close" aria-label="Закрыть карточку"
          ><X :size="20" /></DialogClose
        ><img
          v-if="product?.image"
          class="detail-photo"
          :src="product?.image"
          :alt="product?.name"
          width="720"
          height="720"
        />
        <div v-else class="drink-art detail-drink">
          <Coffee :size="64" :stroke-width="1" /><span>AMBER SPECIALTY COFFEE</span>
        </div>
        <div class="detail-copy">
          <span class="eyebrow">{{
            categories.find((c) => c.id === product?.categories[0])?.name
          }}</span
          ><DialogTitle class="detail-title">{{ product?.name }}</DialogTitle
          ><DialogDescription class="detail-description">{{
            product?.variants?.length
              ? 'Выберите объём напитка.'
              : 'Доступно для доставки и самовывоза.'
          }}</DialogDescription
          ><RadioGroupRoot
            v-if="product?.variants?.length"
            v-model="variantId"
            class="variant-options"
            aria-label="Объём напитка"
            ><RadioGroupItem
              v-for="variant in product?.variants"
              :key="variant.id"
              :value="variant.id"
              class="variant-option"
              >{{ variant.label }}<small>{{ money(variant.price) }}</small></RadioGroupItem
            ></RadioGroupRoot
          >
          <div class="detail-action">
            <strong>{{ money(price) }}</strong
            ><button type="button" class="primary-button" @click="add">
              <Check v-if="added" :size="17" /><Plus v-else :size="17" />{{
                added ? 'Добавить ещё' : 'Добавить в корзину'
              }}
            </button>
          </div>
          <p v-if="added" class="added-message" role="status">Добавлено в корзину</p>
        </div></DialogContent
      ></DialogPortal
    ></DialogRoot
  >
</template>
