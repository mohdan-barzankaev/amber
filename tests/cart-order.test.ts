import { describe, it, expect } from 'vitest';
import { getLines, cartTotal, sanitizeCart } from '../src/lib/cart';
import { orderSchema, createOrderText, whatsappLink, normalizePhone } from '../src/lib/order';
import { products } from '../src/data/menu';
import { cafe, mapLink } from '../src/data/config';
const order = {
  name: 'Тестовый клиент',
  phone: '+7 (999) 123-45-67',
  fulfillment: 'delivery' as const,
  address: 'Тестовая улица, дом 10',
  location: 'esambaeva',
  payment: 'Картой' as const,
  comment: 'Без звонка',
  consent: true as const,
};
describe('basket using current menu', () => {
  it('sums food and selected drink volumes at catalog prices', () => {
    const lines = [
      { productId: 'c628b6', quantity: 2 },
      { productId: 'milk-coffee-1', variantId: '350', quantity: 1 },
    ];
    expect(cartTotal(lines)).toBe(970);
    expect(getLines(lines)[1].variantLabel).toBe('350 мл');
  });
  it('rejects malformed, removed and invalid variants while keeping valid items', () => {
    expect(
      sanitizeCart([
        { productId: 'missing', quantity: 1 },
        { productId: 'c628b6', quantity: -1 },
        { productId: 'c628b6', quantity: 1.5 },
        { productId: 'milk-coffee-1', variantId: '900', quantity: 1 },
        { productId: 'milk-coffee-1', quantity: 1 },
        { productId: 'c628b6', quantity: 2, price: 1 },
      ]),
    ).toEqual([{ productId: 'c628b6', quantity: 2 }]);
    expect(cartTotal([{ productId: 'c628b6', quantity: 2 }])).toBe(640);
  });
  it('merges duplicate lines with a quantity cap and keeps volumes separate', () => {
    const items = sanitizeCart([
      { productId: 'c628b6', quantity: 99 },
      { productId: 'c628b6', quantity: 4 },
      { productId: 'milk-coffee-1', variantId: '250', quantity: 1 },
      { productId: 'milk-coffee-1', variantId: '350', quantity: 1 },
    ]);
    expect(items).toHaveLength(3);
    expect(items[0].quantity).toBe(99);
  });
});
describe('order and WhatsApp handoff', () => {
  it('uses the confirmed cafe contacts and addresses', () => {
    expect(cafe.locations.map((location) => location.fullAddress)).toEqual([
      'Грозный, бульвар М.А. Эсамбаева, 8',
      'Грозный, улица Сайханова, 266',
    ]);
    expect(cafe.hours).toBe('08:00–23:00');
    expect(cafe.phone).toBe('+7 (928) 024-13-13');
    expect(mapLink(cafe.locations[0].fullAddress)).toContain(
      encodeURIComponent('Грозный, бульвар М.А. Эсамбаева, 8'),
    );
  });
  it('requires address for delivery, valid phone and consent', () => {
    expect(orderSchema.safeParse(order).success).toBe(true);
    expect(orderSchema.safeParse({ ...order, address: '' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...order, phone: '123' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...order, consent: false }).success).toBe(false);
    expect(normalizePhone('8 999 123 45 67')).toBe('79991234567');
  });
  it('allows pickup without address, requires a known cafe and omits delivery costs', () => {
    const pickup = orderSchema.parse({
      ...order,
      fulfillment: 'pickup',
      address: '',
      location: 'saykhanova',
    });
    const text = createOrderText(pickup, getLines([{ productId: 'c628b6', quantity: 1 }]));
    expect(text).toContain('Сайханова, 266');
    expect(text).not.toContain('Адрес доставки');
    expect(text).not.toContain('Стоимость доставки');
    expect(orderSchema.safeParse({ ...pickup, location: 'unknown' }).success).toBe(false);
  });
  it('includes every line, volume, client field and safely encodes special characters', () => {
    const valid = orderSchema.parse({ ...order, comment: 'Домофон #12 & вход справа\nСпасибо' });
    const text = createOrderText(
      valid,
      getLines([
        { productId: 'c628b6', quantity: 2 },
        { productId: 'milk-coffee-1', variantId: '350', quantity: 1 },
      ]),
    );
    expect(text).toContain('2 × 320 ₽ = 640 ₽');
    expect(text).toContain('Капучино · 350 мл');
    expect(text).toContain('970 ₽');
    expect(text).toContain('Тестовая улица');
    expect(text).toContain('+79991234567');
    expect(text).toContain('Оплата: Картой');
    const url = new URL(whatsappLink(text));
    expect(url.pathname).toBe('/79280241313');
    expect(url.searchParams.get('text')).toBe(text);
    expect(url.hash).toBe('');
  });
});
describe('imported menu', () => {
  it('has all food and beverage entries, unique IDs and valid variant pricing', () => {
    expect(products.filter((p) => p.group === 'food')).toHaveLength(44);
    expect(products.filter((p) => p.group === 'drinks')).toHaveLength(71);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(products.filter((p) => p.variants?.length).map((p) => p.name)).toEqual([
      'Фильтр кофе',
      'Капучино',
    ]);
    expect(products.filter((p) => p.group === 'food').every((p) => !!p.image)).toBe(true);
  });
});
