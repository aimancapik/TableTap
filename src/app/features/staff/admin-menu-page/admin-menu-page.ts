import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { formatMoney } from '../../../core/money';
import { MenuService } from '../../../core/menu.service';
import { Category, MenuItem } from '../../../core/models';

@Component({
  selector: 'app-admin-menu-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-menu-page.html',
  styleUrl: './admin-menu-page.css',
})
export class AdminMenuPage {
  private readonly menuService = inject(MenuService);

  readonly categories = signal<Category[]>([]);
  readonly items = signal<MenuItem[]>([]);
  readonly searchTerm = signal('');
  readonly activeCategoryId = signal<number | 'ALL'>('ALL');
  readonly isLoading = signal(true);
  readonly savingItemId = signal<number | null>(null);

  readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const categoryId = this.activeCategoryId();

    return this.items().filter((item) => {
      const matchesCategory = categoryId === 'ALL' || item.categoryId === categoryId;
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  });

  readonly soldOutCount = computed(() => this.items().filter((item) => !item.isAvailable).length);

  formatMoney = formatMoney;

  constructor() {
    this.loadMenu();
  }

  categoryName(categoryId: number) {
    return this.categories().find((category) => category.id === categoryId)?.name ?? 'Menu';
  }

  toggleAvailability(item: MenuItem) {
    this.updateItem(item.id, { isAvailable: !item.isAvailable });
  }

  updateText(itemId: number, field: 'name' | 'description' | 'imageUrl', value: string) {
    this.updateItem(itemId, { [field]: value });
  }

  updatePrice(itemId: number, value: string) {
    const price = Number(value);
    if (Number.isFinite(price)) {
      this.updateItem(itemId, { price: Math.max(0, price) });
    }
  }

  updatePrepMinutes(itemId: number, value: string) {
    const prepMinutes = Number(value);
    if (Number.isFinite(prepMinutes)) {
      this.updateItem(itemId, { prepMinutes: Math.max(0, Math.round(prepMinutes)) });
    }
  }

  updateTags(itemId: number, value: string) {
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.updateItem(itemId, { tags });
  }

  private loadMenu() {
    this.isLoading.set(true);
    this.menuService.getAdminMenu().subscribe((payload) => {
      this.categories.set(payload.categories);
      this.items.set(payload.items);
      this.isLoading.set(false);
    });
  }

  private updateItem(itemId: number, patch: Partial<MenuItem>) {
    this.savingItemId.set(itemId);
    this.menuService.updateMenuItem(itemId, patch).subscribe((payload) => {
      this.categories.set(payload.categories);
      this.items.set(payload.items);
      this.savingItemId.set(null);
    });
  }
}
