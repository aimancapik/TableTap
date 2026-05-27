import { Injectable, signal } from '@angular/core';
import { delay, of } from 'rxjs';

import { TABLES } from './mock-data';

@Injectable({ providedIn: 'root' })
export class TableService {
  readonly currentTableNumber = signal(localStorage.getItem('tabletap.table') ?? 'T12');

  validateTable(tableNumber: string) {
    const table = TABLES.find(
      (item) => item.tableNumber.toLowerCase() === tableNumber.toLowerCase(),
    );

    if (table?.isActive) {
      this.currentTableNumber.set(table.tableNumber);
      localStorage.setItem('tabletap.table', table.tableNumber);
    }

    return of(table && table.isActive ? table : null).pipe(delay(160));
  }
}
