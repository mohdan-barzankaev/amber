<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useClipboard } from '@vueuse/core';
import {
  RadioGroupRoot,
  RadioGroupItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from 'reka-ui';
import {
  ArrowLeft,
  ArrowRight,
  Truck,
  Store,
  Coffee,
  Copy,
  Check,
  MessageCircle,
  ShoppingBag,
  ChevronDown,
} from '@lucide/vue';
import { useCartStore } from '../stores/cart';
import { cafe } from '../data/config';
import { money } from '../data/menu';
import {
  orderSchema,
  payments,
  createOrderText,
  whatsappLink,
  type OrderDraft,
  type ValidOrder,
} from '../lib/order';
import QuantityControl from '../components/QuantityControl.vue';
const cart = useCartStore();
const form = reactive<OrderDraft>({
  name: '',
  phone: '',
  fulfillment: 'delivery',
  address: '',
  location: cafe.locations[0].id,
  payment: 'Картой',
  comment: '',
  consent: false,
});
const errors = ref<Record<string, string>>({});
const approved = ref<ValidOrder | null>(null);
const formElement = ref<HTMLFormElement>();
const { copy, copied } = useClipboard({ legacy: true });
const copyError = ref('');
const message = computed(() => (approved.value ? createOrderText(approved.value, cart.lines) : ''));
const link = computed(() => whatsappLink(message.value));
watch(form, () => {
  approved.value = null;
  copyError.value = '';
});
watch(
  () => cart.lines,
  () => {
    approved.value = null;
  },
  { deep: true },
);
watch(
  () => form.fulfillment,
  () => {
    errors.value = {};
  },
);
async function prepare() {
  errors.value = {};
  const result = orderSchema.safeParse(form);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      errors.value[field] ??= issue.message;
    }
    await nextTick();
    formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }
  if (!cart.count) return;
  approved.value = result.data;
  await nextTick();
  document.getElementById('order-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
async function copyOrder() {
  try {
    await copy(message.value);
    copyError.value = '';
  } catch {
    copyError.value = 'Не удалось скопировать. Выделите текст заказа ниже и скопируйте вручную.';
  }
}
</script>
<template>
  <section class="checkout-section container">
    <RouterLink to="/#menu" class="back-link"><ArrowLeft :size="16" /> Вернуться к меню</RouterLink
    ><span class="eyebrow">ПОЧТИ ГОТОВО</span>
    <h1 class="page-title">Ваш заказ</h1>
    <div v-if="!cart.count" class="empty-order">
      <ShoppingBag :size="48" :stroke-width="1" />
      <h2>Корзина пока пуста</h2>
      <p>Добавьте блюда или напитки, чтобы оформить заказ.</p>
      <RouterLink to="/#menu" class="primary-button"
        >Выбрать из меню <ArrowRight :size="17"
      /></RouterLink>
    </div>
    <div v-else class="checkout-layout">
      <div>
        <form ref="formElement" class="order-form" novalidate @submit.prevent="prepare">
          <h2>Как вам удобнее?</h2>
          <RadioGroupRoot
            v-model="form.fulfillment"
            class="fulfillment-options"
            aria-label="Способ получения"
            ><RadioGroupItem value="delivery" class="fulfillment-option"
              ><Truck :size="21" /><span
                >Доставка<small>Привезём по вашему адресу</small></span
              ></RadioGroupItem
            ><RadioGroupItem value="pickup" class="fulfillment-option"
              ><Store :size="21" /><span
                >Самовывоз<small>Заберите в одной из кофеен</small></span
              ></RadioGroupItem
            ></RadioGroupRoot
          >
          <label v-if="form.fulfillment === 'delivery'" class="field"
            >Адрес доставки<input
              v-model="form.address"
              name="address"
              autocomplete="street-address"
              placeholder="Улица, дом, квартира"
              maxlength="250"
              :aria-invalid="!!errors.address"
              :aria-describedby="errors.address ? 'error-address' : undefined"
            /><span v-if="errors.address" id="error-address" class="field-error">{{
              errors.address
            }}</span></label
          >
          <div v-else class="field">
            <label id="pickup-location-label">Кофейня для самовывоза</label>
            <SelectRoot v-model="form.location">
              <SelectTrigger
                class="custom-select-trigger"
                aria-labelledby="pickup-location-label"
                :aria-invalid="!!errors.location"
                :aria-describedby="errors.location ? 'error-location' : undefined"
              >
                <SelectValue placeholder="Выберите кофейню" />
                <SelectIcon class="custom-select-chevron"><ChevronDown :size="18" /></SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectContent class="custom-select-content" position="popper" :side-offset="6">
                  <SelectViewport class="custom-select-viewport">
                    <SelectItem
                      v-for="location in cafe.locations"
                      :key="location.id"
                      :value="location.id"
                      class="custom-select-item"
                    >
                      <SelectItemText>{{ location.fullAddress }}</SelectItemText>
                      <SelectItemIndicator class="custom-select-check"
                        ><Check :size="16"
                      /></SelectItemIndicator>
                    </SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
            <span v-if="errors.location" id="error-location" class="field-error">{{
              errors.location
            }}</span>
          </div>
          <p class="form-hint">
            {{
              form.fulfillment === 'delivery'
                ? 'Стоимость доставки и время прибытия уточнит оператор.'
                : 'Кофейни работают каждый день с 08:00 до 23:00. Время готовности уточнит оператор.'
            }}
          </p>
          <div class="form-divider"></div>
          <h2>Ваши контакты</h2>
          <div class="field-grid">
            <label class="field"
              >Имя<input
                v-model="form.name"
                name="name"
                autocomplete="given-name"
                placeholder="Как к вам обращаться"
                maxlength="80"
                :aria-invalid="!!errors.name"
                :aria-describedby="errors.name ? 'error-name' : undefined"
              /><span v-if="errors.name" id="error-name" class="field-error">{{
                errors.name
              }}</span></label
            ><label class="field"
              >Телефон<input
                v-model="form.phone"
                name="phone"
                type="tel"
                autocomplete="tel"
                inputmode="tel"
                placeholder="+7 999 123-45-67"
                maxlength="24"
                :aria-invalid="!!errors.phone"
                :aria-describedby="errors.phone ? 'error-phone' : undefined"
              /><span v-if="errors.phone" id="error-phone" class="field-error">{{
                errors.phone
              }}</span></label
            >
          </div>
          <div class="field">
            <label id="payment-label">Способ оплаты</label>
            <SelectRoot v-model="form.payment">
              <SelectTrigger class="custom-select-trigger" aria-labelledby="payment-label">
                <SelectValue placeholder="Выберите способ оплаты" />
                <SelectIcon class="custom-select-chevron"><ChevronDown :size="18" /></SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectContent class="custom-select-content" position="popper" :side-offset="6">
                  <SelectViewport class="custom-select-viewport">
                    <SelectItem
                      v-for="payment in payments"
                      :key="payment"
                      :value="payment"
                      class="custom-select-item"
                    >
                      <SelectItemText>{{ payment }}</SelectItemText>
                      <SelectItemIndicator class="custom-select-check"
                        ><Check :size="16"
                      /></SelectItemIndicator>
                    </SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
          </div>
          <label class="field"
            >Комментарий <span class="optional">необязательно</span
            ><textarea
              v-model="form.comment"
              name="comment"
              rows="3"
              maxlength="500"
              placeholder="Например, код домофона или пожелание к заказу"
              :aria-invalid="!!errors.comment"
            ></textarea
            ><span v-if="errors.comment" class="field-error">{{ errors.comment }}</span></label
          >
          <div class="consent-row">
            <input
              id="order-consent"
              v-model="form.consent"
              type="checkbox"
              :aria-invalid="!!errors.consent"
              :aria-describedby="errors.consent ? 'error-consent' : undefined"
            /><label for="order-consent"
              >Разрешаю передать указанные данные Amber через WhatsApp для оформления заказа.
              <RouterLink to="/privacy" target="_blank" rel="noopener noreferrer"
                >О данных заказа</RouterLink
              ></label
            >
          </div>
          <p v-if="errors.consent" id="error-consent" class="field-error" role="alert">
            {{ errors.consent }}
          </p>
          <button type="submit" class="primary-button full-width">
            Проверить заказ <ArrowRight :size="17" />
          </button>
          <p class="form-hint centered">Далее откроется готовый текст для WhatsApp.</p>
        </form>
        <section v-if="approved" id="order-preview" class="order-preview">
          <span class="eyebrow">ПРОВЕРЬТЕ ПЕРЕД ОТПРАВКОЙ</span>
          <h2>Всё верно?</h2>
          <p>
            Откроем чат Amber с готовым сообщением. Нажмите «Отправить» в WhatsApp — оператор
            подтвердит заказ.
          </p>
          <pre class="message-preview">{{ message }}</pre>
          <a
            :href="link"
            target="_blank"
            rel="noopener noreferrer"
            class="primary-button full-width"
            ><MessageCircle :size="19" /> Перейти в WhatsApp с заказом <ArrowRight :size="17" /></a
          ><button type="button" class="copy-button" @click="copyOrder">
            <Check v-if="copied" :size="17" /><Copy v-else :size="17" />{{
              copied ? 'Текст скопирован' : 'Скопировать текст заказа'
            }}
          </button>
          <p v-if="copyError" class="field-error" role="alert">{{ copyError }}</p>
          <p class="whatsapp-fallback">
            Если чат не открылся, отправьте текст на
            <a :href="'tel:+' + cafe.whatsapp">{{ cafe.phone }}</a
            >.
          </p>
        </section>
      </div>
      <aside class="order-summary">
        <div class="summary-heading">
          <h2>В корзине</h2>
          <button type="button" class="text-button" @click="cart.open = true">Изменить</button>
        </div>
        <article v-for="line in cart.lines" :key="line.key" class="summary-line">
          <img
            v-if="line.product.image"
            :src="line.product.image"
            :alt="line.product.name"
            width="62"
            height="62"
          />
          <div v-else class="cart-drink"><Coffee :size="23" :stroke-width="1" /></div>
          <div>
            <h3>{{ line.product.name }}</h3>
            <small v-if="line.variantLabel">{{ line.variantLabel }}</small>
            <div class="summary-line-bottom">
              <QuantityControl
                :name="line.product.name + (line.variantLabel ? ' ' + line.variantLabel : '')"
                :quantity="line.quantity"
                @change="cart.setQuantity(line.key, $event)"
              /><strong>{{ money(line.subtotal) }}</strong>
            </div>
          </div>
        </article>
        <div class="total-row">
          <span>Сумма товаров</span><strong>{{ money(cart.total) }}</strong>
        </div>
        <p class="form-hint">
          {{
            form.fulfillment === 'delivery'
              ? 'Стоимость доставки уточнит оператор.'
              : 'Самовывоз из выбранной кофейни.'
          }}
        </p>
        <div class="summary-note">
          <MessageCircle :size="20" />
          <p>Ваш заказ оформит оператор в WhatsApp. Корзина сохранится после перехода.</p>
        </div>
      </aside>
    </div>
  </section>
</template>
