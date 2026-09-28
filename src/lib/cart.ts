import { z } from 'zod';
import { productById, type Product } from '../data/menu';
export const MAX_QUANTITY = 99;
export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}
export interface CartLine extends CartItem {
  key: string;
  product: Product;
  variantLabel?: string;
  unitPrice: number;
  subtotal: number;
}
const storedItem = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
});
export const itemKey = (item: Pick<CartItem, 'productId' | 'variantId'>) =>
  `${item.productId}:${item.variantId ?? ''}`;
export function resolveLine(item: CartItem): CartLine | null {
  const product = productById.get(item.productId);
  if (!product) return null;
  const variant = product.variants?.find((v) => v.id === item.variantId);
  if (product.variants?.length && !variant) return null;
  if (!product.variants?.length && item.variantId) return null;
  const unitPrice = variant?.price ?? product.price;
  return {
    ...item,
    key: itemKey(item),
    product,
    variantLabel: variant?.label,
    unitPrice,
    subtotal: unitPrice * item.quantity,
  };
}
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, CartItem>();
  for (const candidate of raw.slice(0, 500)) {
    const parsed = storedItem.safeParse(candidate);
    if (!parsed.success || !resolveLine(parsed.data)) continue;
    const key = itemKey(parsed.data);
    const previous = merged.get(key);
    merged.set(key, {
      ...parsed.data,
      quantity: Math.min(MAX_QUANTITY, (previous?.quantity ?? 0) + parsed.data.quantity),
    });
  }
  return [...merged.values()];
}
export function getLines(items: CartItem[]): CartLine[] {
  return sanitizeCart(items)
    .map(resolveLine)
    .filter((line): line is CartLine => line !== null);
}
export const cartTotal = (items: CartItem[]) =>
  getLines(items).reduce((total, line) => total + line.subtotal, 0);
