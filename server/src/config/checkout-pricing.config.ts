import { ConfigService } from '@nestjs/config';

export interface CheckoutPricingSnapshot {
  taxRate: number;
  freeShippingThreshold: number;
  flatShipping: number;
}

export function getCheckoutPricing(config: ConfigService): CheckoutPricingSnapshot {
  const taxRate = Number(config.get<string>('CART_TAX_RATE') ?? '0.08');
  const freeShippingThreshold = Number(config.get<string>('CART_FREE_SHIPPING_THRESHOLD') ?? '75');
  const flatShipping = Number(config.get<string>('CART_FLAT_SHIPPING') ?? '9.99');
  return {
    taxRate: Number.isFinite(taxRate) ? taxRate : 0.08,
    freeShippingThreshold: Number.isFinite(freeShippingThreshold) ? freeShippingThreshold : 75,
    flatShipping: Number.isFinite(flatShipping) ? flatShipping : 9.99,
  };
}
