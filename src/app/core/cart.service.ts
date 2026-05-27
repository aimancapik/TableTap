import { computed, Injectable, signal } from '@angular/core';

import { CartItem, MenuAddOn, MenuItem } from './models';

const CART_KEY = 'tabletap.cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>(this.restoreCart());
  readonly itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this.items().reduce((total, item) => total + item.subtotal, 0),
  );
  readonly serviceCharge = computed(() => roundMoney(this.subtotal() * 0.06));
  readonly total = computed(() => roundMoney(this.subtotal() + this.serviceCharge()));

  addItem(menuItem: MenuItem, quantity: number, addOns: MenuAddOn[], notes: string) {
    const addOnTotal = addOns.reduce((total, addOn) => total + addOn.price, 0);
    const itemTotal = roundMoney((menuItem.price + addOnTotal) * quantity);
    const cartItem: CartItem = {
      cartId: crypto.randomUUID(),
      menuItemId: menuItem.id,
      itemNameSnapshot: menuItem.name,
      priceSnapshot: menuItem.price,
      imageUrl: menuItem.imageUrl,
      quantity,
      notes,
      addOns,
      subtotal: itemTotal,
    };

    this.items.update((items) => [...items, cartItem]);
    this.persist();
  }

  updateQuantity(cartId: string, quantity: number) {
    if (quantity < 1) {
      this.removeItem(cartId);
      return;
    }

    this.items.update((items) =>
      items.map((item) =>
        item.cartId === cartId ? this.reprice({ ...item, quantity }) : item,
      ),
    );
    this.persist();
  }

  updateNotes(cartId: string, notes: string) {
    this.items.update((items) =>
      items.map((item) => (item.cartId === cartId ? { ...item, notes } : item)),
    );
    this.persist();
  }

  removeItem(cartId: string) {
    this.items.update((items) => items.filter((item) => item.cartId !== cartId));
    this.persist();
  }

  clear() {
    this.items.set([]);
    localStorage.removeItem(CART_KEY);
  }

  private reprice(item: CartItem): CartItem {
    const addOnTotal = item.addOns.reduce((total, addOn) => total + addOn.price, 0);
    return {
      ...item,
      subtotal: roundMoney((item.priceSnapshot + addOnTotal) * item.quantity),
    };
  }

  private restoreCart(): CartItem[] {
    const rawCart = localStorage.getItem(CART_KEY);
    if (!rawCart) {
      return [];
    }

    try {
      return JSON.parse(rawCart) as CartItem[];
    } catch {
      localStorage.removeItem(CART_KEY);
      return [];
    }
  }

  private persist() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items()));
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
