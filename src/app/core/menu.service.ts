import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';

import { CATEGORIES, MENU_ITEMS } from './mock-data';
import { MenuPayload } from './models';

@Injectable({ providedIn: 'root' })
export class MenuService {
  getMenu() {
    const payload: MenuPayload = {
      categories: CATEGORIES.filter((category) => category.isActive).sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
      items: MENU_ITEMS,
    };

    return of(payload).pipe(delay(180));
  }
}
