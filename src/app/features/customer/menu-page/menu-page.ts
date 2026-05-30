import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideMinus,
  LucidePlus,
  LucideShoppingBag,
  LucideX,
} from '@lucide/angular';

import { CartService } from '../../../core/cart.service';
import { formatMoney } from '../../../core/money';
import { MenuService } from '../../../core/menu.service';
import { Category, MenuAddOn, MenuItem, RestaurantTable, TableBill } from '../../../core/models';
import { OrderService } from '../../../core/order.service';
import { TableService } from '../../../core/table.service';

interface CategoryCard {
  category: Category;
  imageUrl: string;
  itemCount: number;
  tone: 'cream' | 'white' | 'orange' | 'sage' | 'ink';
}

@Component({
  selector: 'app-menu-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideMinus,
    LucidePlus,
    LucideShoppingBag,
    LucideX,
  ],
  templateUrl: './menu-page.html',
  styleUrl: './menu-page.css',
})
export class MenuPage {
  private readonly route = inject(ActivatedRoute);
  private readonly menuService = inject(MenuService);
  private readonly orderService = inject(OrderService);
  private readonly tableService = inject(TableService);
  readonly cart = inject(CartService);

  readonly categories = signal<Category[]>([]);
  readonly items = signal<MenuItem[]>([]);
  readonly table = signal<RestaurantTable | null>(null);
  readonly tableBill = signal<TableBill | null>(null);
  readonly isLoading = signal(true);
  readonly invalidTable = signal(false);
  readonly searchTerm = signal('');
  readonly activeCategory = signal('popular');
  readonly selectedCategory = signal<string | null>(null);
  readonly selectedItem = signal<MenuItem | null>(null);
  readonly detailQuantity = signal(1);
  readonly selectedAddOns = signal<MenuAddOn[]>([]);
  readonly detailNotes = signal('');

  readonly featuredItem = computed(
    () => this.items().find((item) => item.isFeatured && item.isAvailable) ?? this.items()[0],
  );

  readonly categoryCards = computed<CategoryCard[]>(() => {
    const tones: CategoryCard['tone'][] = ['cream', 'white', 'orange', 'sage', 'ink'];

    return this.categories().map((category, index) => {
      const items = this.itemsForCategory(category.slug);
      const fallback = this.featuredItem();

      return {
        category,
        imageUrl: items[0]?.imageUrl ?? fallback?.imageUrl ?? '',
        itemCount: items.length,
        tone: tones[index % tones.length],
      };
    });
  });

  readonly selectedCategoryName = computed(
    () =>
      this.categories().find((category) => category.slug === this.activeCategory())?.name ??
      'Menu',
  );

  readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const categorySlug = this.activeCategory();
    const categories = this.categories();
    const activeCategory = categories.find((category) => category.slug === categorySlug);

    return this.items().filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term));
      const matchesCategory =
        categorySlug === 'popular'
          ? item.isFeatured || item.tags.includes('Bestseller')
          : item.categoryId === activeCategory?.id;

      return matchesSearch && matchesCategory;
    });
  });

  readonly cartTotal = computed(() => formatMoney(this.cart.total()));
  readonly latestBillOrderNumber = computed(() => this.tableBill()?.orders[0]?.orderNumber ?? null);

  constructor() {
    this.loadMenu();

    this.route.paramMap.subscribe((params) => {
      const tableNumber = params.get('tableNumber') ?? 'T12';
      this.tableService.validateTable(tableNumber).subscribe((table) => {
        this.table.set(table);
        this.invalidTable.set(!table);
        if (table) {
          this.loadTableBill(table.tableNumber);
        } else {
          this.tableBill.set(null);
        }
      });
    });
  }

  formatMoney = formatMoney;

  setCategory(slug: string) {
    this.activeCategory.set(slug);
    this.selectedCategory.set(slug);
  }

  showCategories() {
    this.selectedCategory.set(null);
    this.searchTerm.set('');
  }

  openItem(item: MenuItem) {
    if (!item.isAvailable) {
      return;
    }

    this.selectedItem.set(item);
    this.detailQuantity.set(1);
    this.selectedAddOns.set([]);
    this.detailNotes.set('');
  }

  closeItem() {
    this.selectedItem.set(null);
  }

  updateSearch(value: string) {
    this.searchTerm.set(value);
  }

  increaseQuantity() {
    this.detailQuantity.update((quantity) => quantity + 1);
  }

  decreaseQuantity() {
    this.detailQuantity.update((quantity) => Math.max(1, quantity - 1));
  }

  toggleAddOn(addOn: MenuAddOn, checked: boolean) {
    this.selectedAddOns.update((selected) =>
      checked
        ? [...selected, addOn]
        : selected.filter((current) => current.id !== addOn.id),
    );
  }

  isAddOnSelected(addOnId: string) {
    return this.selectedAddOns().some((addOn) => addOn.id === addOnId);
  }

  addSelectedToCart() {
    const item = this.selectedItem();
    if (!item) {
      return;
    }

    this.cart.addItem(item, this.detailQuantity(), this.selectedAddOns(), this.detailNotes());
    this.closeItem();
  }

  detailTotal() {
    const item = this.selectedItem();
    if (!item) {
      return formatMoney(0);
    }

    const addOnTotal = this.selectedAddOns().reduce((total, addOn) => total + addOn.price, 0);
    return formatMoney((item.price + addOnTotal) * this.detailQuantity());
  }

  private itemsForCategory(slug: string) {
    if (slug === 'popular') {
      return this.items().filter((item) => item.isFeatured || item.tags.includes('Bestseller'));
    }

    const category = this.categories().find((item) => item.slug === slug);
    return this.items().filter((item) => item.categoryId === category?.id);
  }

  private loadMenu() {
    this.isLoading.set(true);
    this.menuService.getMenu().subscribe((payload) => {
      this.categories.set(payload.categories);
      this.items.set(payload.items);
      this.isLoading.set(false);
    });
  }

  private loadTableBill(tableNumber: string) {
    this.orderService.getTableBill(tableNumber).subscribe((bill) => {
      this.tableBill.set(bill.orders.length ? bill : null);
    });
  }
}
