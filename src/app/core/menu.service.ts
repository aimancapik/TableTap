import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';

import { CATEGORIES, MENU_ITEMS } from './mock-data';
import { MenuItem, MenuPayload } from './models';

const MENU_KEY = 'tabletap.menu';
type MenuItemPatch = Partial<
  Pick<
    MenuItem,
    'name' | 'description' | 'price' | 'prepMinutes' | 'imageUrl' | 'tags' | 'isAvailable'
  >
>;

@Injectable({ providedIn: 'root' })
export class MenuService {
  getMenu() {
    const menu = this.restoreMenu();
    const payload: MenuPayload = {
      categories: menu.categories
        .filter((category) => category.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder),
      items: menu.items,
    };

    return of(payload).pipe(delay(180));
  }

  getAdminMenu() {
    const menu = this.restoreMenu();
    const payload: MenuPayload = {
      categories: menu.categories.sort((a, b) => a.displayOrder - b.displayOrder),
      items: menu.items,
    };

    return of(payload).pipe(delay(120));
  }

  updateMenuItem(itemId: number, patch: MenuItemPatch) {
    const menu = this.restoreMenu();
    const nextMenu: MenuPayload = {
      categories: menu.categories,
      items: menu.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...patch,
              price: patch.price === undefined ? item.price : roundMoney(patch.price),
              prepMinutes:
                patch.prepMinutes === undefined ? item.prepMinutes : Math.max(0, patch.prepMinutes),
            }
          : item,
      ),
    };

    localStorage.setItem(MENU_KEY, JSON.stringify(nextMenu));
    return of(nextMenu).pipe(delay(90));
  }

  private restoreMenu(): MenuPayload {
    const rawMenu = localStorage.getItem(MENU_KEY);
    if (!rawMenu) {
      const seed = cloneMenu({
        categories: CATEGORIES,
        items: MENU_ITEMS,
      });
      localStorage.setItem(MENU_KEY, JSON.stringify(seed));
      return seed;
    }

    try {
      return JSON.parse(rawMenu) as MenuPayload;
    } catch {
      localStorage.removeItem(MENU_KEY);
      return this.restoreMenu();
    }
  }
}

function cloneMenu(menu: MenuPayload): MenuPayload {
  return JSON.parse(JSON.stringify(menu)) as MenuPayload;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
