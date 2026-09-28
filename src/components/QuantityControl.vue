<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue';
import { MAX_QUANTITY } from '../lib/cart';
defineProps<{ quantity: number; name: string }>();
defineEmits<{ change: [quantity: number] }>();
</script>
<template>
  <div class="quantity-control">
    <button
      type="button"
      :aria-label="'Уменьшить количество: ' + name"
      @click="$emit('change', quantity - 1)"
    >
      <Minus :size="14" /></button
    ><span aria-live="polite">{{ quantity }}</span
    ><button
      type="button"
      :disabled="quantity >= MAX_QUANTITY"
      :aria-label="'Увеличить количество: ' + name"
      @click="$emit('change', quantity + 1)"
    >
      <Plus :size="14" />
    </button>
  </div>
</template>
