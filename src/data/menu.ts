import source from './menu.json';
import { assetUrl } from '../lib/assets';
export type Group = 'food' | 'drinks';
export interface Variant {
  id: string;
  label: string;
  price: number;
}
export interface Product {
  id: string;
  name: string;
  price: number;
  categories: string[];
  group: Group;
  image?: string;
  variants?: Variant[];
}
export interface Category {
  id: string;
  name: string;
  group: Group;
}
export const products = source.products.map((product) => ({
  ...product,
  image: product.image ? assetUrl(product.image) : undefined,
})) as Product[];
export const categories = source.categories as Category[];
export const productById = new Map(products.map((p) => [p.id, p]));
export const money = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';

export function positionCount(count: number) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  const word =
    mod100 >= 11 && mod100 <= 14
      ? 'позиций'
      : mod10 === 1
        ? 'позиция'
        : mod10 >= 2 && mod10 <= 4
          ? 'позиции'
          : 'позиций';
  return `${count} ${word}`;
}
