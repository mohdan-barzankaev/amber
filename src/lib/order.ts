import { z } from 'zod';
import { cafe } from '../data/config';
import { money } from '../data/menu';
import type { CartLine } from './cart';
export const payments = ['Картой', 'Переводом', 'Наличными'] as const;
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return '7' + digits;
  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8'))
    return '7' + digits.slice(1);
  return digits;
}
const phone = z
  .string()
  .trim()
  .refine(
    (value) => /^7\d{10}$/.test(normalizePhone(value)),
    'Укажите телефон в формате +7 999 123-45-67',
  );
const common = {
  name: z.string().trim().min(2, 'Укажите имя, минимум 2 символа').max(80, 'Имя слишком длинное'),
  phone,
  payment: z.enum(payments),
  comment: z.string().trim().max(500, 'Не более 500 символов'),
  consent: z.literal(true, { error: 'Нужно согласие на передачу данных для заказа' }),
};
export const orderSchema = z.discriminatedUnion('fulfillment', [
  z.object({
    ...common,
    fulfillment: z.literal('delivery'),
    address: z
      .string()
      .trim()
      .min(5, 'Укажите улицу, дом и квартиру')
      .max(250, 'Адрес слишком длинный'),
    location: z.string(),
  }),
  z.object({
    ...common,
    fulfillment: z.literal('pickup'),
    address: z.string(),
    location: z
      .string()
      .refine((id) => cafe.locations.some((l) => l.id === id), 'Выберите кофейню'),
  }),
]);
export type ValidOrder = z.infer<typeof orderSchema>;
export interface OrderDraft {
  name: string;
  phone: string;
  fulfillment: 'delivery' | 'pickup';
  address: string;
  location: string;
  payment: (typeof payments)[number];
  comment: string;
  consent: boolean;
}
export function createOrderText(order: ValidOrder, lines: CartLine[]): string {
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const clean = (text: string) => text.replace(/[\r\n]+/g, ' ').trim();
  const details = lines
    .map(
      (line, index) =>
        `${index + 1}. ${line.product.name}${line.variantLabel ? ' · ' + line.variantLabel : ''}\n   ${line.quantity} × ${money(line.unitPrice)} = ${money(line.subtotal)}`,
    )
    .join('\n');
  return [
    'Заказ в AMBER',
    '',
    details,
    '',
    `Сумма товаров: ${money(total)}`,
    order.fulfillment === 'delivery' ? 'Доставка: стоимость уточните, пожалуйста.' : 'Самовывоз',
    '',
    `Имя: ${clean(order.name)}`,
    `Телефон: +${normalizePhone(order.phone)}`,
    order.fulfillment === 'delivery'
      ? `Адрес доставки: ${clean(order.address)}`
      : `Кофейня: ${cafe.locations.find((l) => l.id === order.location)!.fullAddress}`,
    `Оплата: ${order.payment}`,
    order.comment ? `Комментарий: ${order.comment}` : '',
    '',
    'Пожалуйста, подтвердите заказ и время готовности.',
  ]
    .filter((v, i, a) => v !== '' || a[i - 1] !== '')
    .join('\n');
}
export const whatsappLink = (message: string) =>
  `https://wa.me/${cafe.whatsapp}?text=${encodeURIComponent(message)}`;
