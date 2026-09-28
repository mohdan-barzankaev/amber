import { nextTick } from 'vue';
import { z } from 'zod';
import { products } from '../data/menu';
import { resolveLine, MAX_QUANTITY } from './cart';
import { useCartStore } from '../stores/cart';
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown | Promise<unknown>;
}
interface ModelContext {
  registerTool(tool: ToolDefinition, options: { signal: AbortSignal }): void | Promise<void>;
}
export function registerMenuTools() {
  const context = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!context?.registerTool) return () => {};
  const lifecycle = new AbortController();
  const cart = useCartStore();
  const getCart = () => ({
    items: cart.lines.map((line) => ({
      productId: line.productId,
      name: line.product.name,
      variantId: line.variantId,
      volume: line.variantLabel,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      subtotal: line.subtotal,
    })),
    total: cart.total,
    currency: 'RUB',
  });
  const tools: ToolDefinition[] = [
    {
      name: 'get_amber_menu',
      description:
        'Read Amber menu items and current prices. Filter by food or drinks, or by a name fragment.',
      inputSchema: {
        type: 'object',
        properties: {
          group: { type: 'string', enum: ['food', 'drinks'] },
          query: { type: 'string' },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const filters = z
          .object({
            group: z.enum(['food', 'drinks']).optional(),
            query: z.string().max(100).optional(),
          })
          .strict()
          .parse(input);
        return products
          .filter(
            (p) =>
              (!filters.group || p.group === filters.group) &&
              (!filters.query ||
                p.name
                  .toLocaleLowerCase('ru-RU')
                  .includes(filters.query.toLocaleLowerCase('ru-RU'))),
          )
          .map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            variants: p.variants,
            categories: p.categories,
          }));
      },
    },
    {
      name: 'get_amber_cart',
      description:
        'Read the current device-local shopping cart and total. Does not place or send an order.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        z.object({}).strict().parse(input);
        return getCart();
      },
    },
    {
      name: 'stage_amber_cart_items',
      description:
        'Add valid menu items and selected volumes to the device-local shopping cart and open it for review. Does not send a WhatsApp message or place an order.',
      inputSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            maxItems: 30,
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                variantId: { type: 'string' },
                quantity: { type: 'integer', minimum: 1, maximum: 99 },
              },
              required: ['productId', 'quantity'],
              additionalProperties: false,
            },
          },
        },
        required: ['items'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const data = z
          .object({
            items: z
              .array(
                z
                  .object({
                    productId: z.string(),
                    variantId: z.string().optional(),
                    quantity: z.number().int().min(1).max(MAX_QUANTITY),
                  })
                  .strict(),
              )
              .min(1)
              .max(30),
          })
          .strict()
          .parse(input);
        if (data.items.some((item) => !resolveLine(item)))
          throw new Error('Unknown product or invalid volume. Read the menu first.');
        for (const item of data.items)
          for (let i = 0; i < item.quantity; i++) cart.add(item.productId, item.variantId);
        cart.open = true;
        await nextTick();
        return getCart();
      },
    },
  ];
  for (const tool of tools) {
    try {
      void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(
        () => {},
      );
    } catch {
      /* Unsupported experimental API: ordinary UI remains available. */
    }
  }
  return () => lifecycle.abort();
}
