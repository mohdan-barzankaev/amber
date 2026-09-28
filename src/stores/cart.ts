import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { productById } from '../data/menu';
import { getLines, sanitizeCart, itemKey, MAX_QUANTITY, type CartItem } from '../lib/cart';
export const useCartStore = defineStore('cart', () => {
  const items = useStorage<CartItem[]>('amber.cart.v1', [], undefined, {
    serializer: {
      read(value) {
        try {
          return sanitizeCart(JSON.parse(value));
        } catch {
          return [];
        }
      },
      write(value) {
        return JSON.stringify(sanitizeCart(value));
      },
    },
  });
  const open = ref(false);
  const lines = computed(() => getLines(items.value));
  const count = computed(() => lines.value.reduce((n, line) => n + line.quantity, 0));
  const total = computed(() => lines.value.reduce((n, line) => n + line.subtotal, 0));
  function add(productId: string, variantId?: string) {
    const product = productById.get(productId);
    if (!product) return;
    const chosen = product.variants?.length ? (variantId ?? product.variants[0].id) : undefined;
    if (product.variants?.length && !product.variants.some((v) => v.id === chosen)) return;
    const next: CartItem = { productId, variantId: chosen, quantity: 1 };
    const existing = items.value.find((i) => itemKey(i) === itemKey(next));
    if (existing) {
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + 1);
    } else {
      items.value.push(next);
    }
  }
  function setQuantity(key: string, quantity: number) {
    if (!Number.isInteger(quantity)) return;
    if (quantity <= 0) {
      remove(key);
      return;
    }
    const item = items.value.find((i) => itemKey(i) === key);
    if (item) item.quantity = Math.min(MAX_QUANTITY, quantity);
  }
  function remove(key: string) {
    items.value = items.value.filter((i) => itemKey(i) !== key);
  }
  return { items, open, lines, count, total, add, setQuantity, remove };
});
