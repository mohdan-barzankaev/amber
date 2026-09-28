<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui';
import { X, ShoppingBag, Trash2, ArrowRight, Coffee } from '@lucide/vue';
import { useCartStore } from '../stores/cart';
import { money } from '../data/menu';
import QuantityControl from './QuantityControl.vue';
const cart = useCartStore();
const router = useRouter();
function checkout() {
  cart.open = false;
  router.push('/checkout');
}
</script>
<template>
  <DialogRoot v-model:open="cart.open"
    ><DialogPortal
      ><DialogOverlay class="dialog-overlay" /><DialogContent class="cart-drawer"
        ><div class="drawer-heading">
          <div>
            <span class="eyebrow">ХОРОШИЙ ВЫБОР</span
            ><DialogTitle class="drawer-title">Ваша корзина</DialogTitle>
          </div>
          <DialogClose class="icon-button" aria-label="Закрыть корзину"
            ><X :size="22"
          /></DialogClose>
        </div>
        <DialogDescription class="drawer-description">{{
          cart.count
            ? 'Можно изменить количество и перейти к оформлению.'
            : 'Здесь появятся ваши любимые блюда и напитки.'
        }}</DialogDescription>
        <div v-if="!cart.count" class="empty-cart">
          <ShoppingBag :size="52" :stroke-width="1" />
          <h3>Пока ничего нет</h3>
          <p>Самое время выбрать что-нибудь вкусное.</p>
          <DialogClose class="primary-button"
            >Посмотреть меню <ArrowRight :size="17"
          /></DialogClose>
        </div>
        <div v-else class="drawer-lines">
          <article v-for="line in cart.lines" :key="line.key" class="cart-line">
            <img
              v-if="line.product.image"
              :src="line.product.image"
              :alt="line.product.name"
              width="76"
              height="76"
            />
            <div v-else class="cart-drink"><Coffee :size="27" :stroke-width="1" /></div>
            <div class="cart-line-info">
              <h3>{{ line.product.name }}</h3>
              <small>{{ line.variantLabel ?? money(line.unitPrice) }}</small>
              <div>
                <QuantityControl
                  :quantity="line.quantity"
                  :name="line.product.name + (line.variantLabel ? ' ' + line.variantLabel : '')"
                  @change="cart.setQuantity(line.key, $event)"
                /><strong>{{ money(line.subtotal) }}</strong>
              </div>
            </div>
            <button
              type="button"
              class="remove-button"
              :aria-label="
                'Удалить ' + line.product.name + (line.variantLabel ? ' ' + line.variantLabel : '')
              "
              @click="cart.remove(line.key)"
            >
              <Trash2 :size="16" />
            </button>
          </article>
        </div>
        <div v-if="cart.count" class="drawer-bottom">
          <div class="total-row">
            <span>Сумма товаров</span><strong>{{ money(cart.total) }}</strong>
          </div>
          <p>Доставка и самовывоз. Заказ подтвердит оператор.</p>
          <button type="button" class="primary-button full-width" @click="checkout">
            Оформить заказ <ArrowRight :size="18" />
          </button>
        </div> </DialogContent></DialogPortal
  ></DialogRoot>
</template>
