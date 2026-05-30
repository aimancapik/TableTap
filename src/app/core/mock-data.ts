import { Category, MenuItem, Order, RestaurantTable } from './models';

export const TABLES: RestaurantTable[] = [
  { id: 1, tableNumber: 'T01', isActive: true, seats: 2 },
  { id: 2, tableNumber: 'T08', isActive: true, seats: 4 },
  { id: 3, tableNumber: 'T12', isActive: true, seats: 4 },
  { id: 4, tableNumber: 'T18', isActive: false, seats: 6 },
];

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Popular', slug: 'popular', displayOrder: 1, isActive: true },
  { id: 2, name: 'Rice', slug: 'rice', displayOrder: 2, isActive: true },
  { id: 3, name: 'Chicken', slug: 'chicken', displayOrder: 3, isActive: true },
  { id: 4, name: 'Drinks', slug: 'drinks', displayOrder: 4, isActive: true },
  { id: 5, name: 'Dessert', slug: 'dessert', displayOrder: 5, isActive: true },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 101,
    categoryId: 1,
    name: 'Nasi Lemak Royale',
    description:
      'Coconut rice, sambal tumis, crispy anchovies, peanuts, cucumber, and ayam berempah.',
    price: 18.9,
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    isFeatured: true,
    prepMinutes: 12,
    tags: ['Bestseller', 'Spicy'],
    addOns: [
      { id: 'egg', name: 'Sunny egg', price: 2 },
      { id: 'sambal', name: 'Extra sambal', price: 1.5 },
      { id: 'rice', name: 'Extra rice', price: 2 },
    ],
  },
  {
    id: 102,
    categoryId: 2,
    name: 'Butter Chicken Rice',
    description: 'Crispy chicken tossed in creamy butter sauce with curry leaves and steamed rice.',
    price: 17.5,
    imageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    prepMinutes: 10,
    tags: ['Creamy'],
    addOns: [
      { id: 'cheese', name: 'Cheese pull', price: 3 },
      { id: 'rice', name: 'Extra rice', price: 2 },
    ],
  },
  {
    id: 103,
    categoryId: 3,
    name: 'Hainanese Chicken Chop',
    description: 'Golden chicken cutlet with black pepper gravy, wedges, and slaw.',
    price: 20.9,
    imageUrl:
      'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    prepMinutes: 15,
    tags: ['Crispy'],
    addOns: [
      { id: 'sauce', name: 'Extra gravy', price: 2 },
      { id: 'fries', name: 'Add fries', price: 4 },
    ],
  },
  {
    id: 104,
    categoryId: 2,
    name: 'Kampung Fried Rice',
    description: 'Wok-fried rice with anchovies, long beans, sambal, and a fried egg.',
    price: 15.9,
    imageUrl:
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    prepMinutes: 9,
    tags: ['Wok hei'],
    addOns: [
      { id: 'egg', name: 'Extra egg', price: 2 },
      { id: 'spicy', name: 'Make it extra spicy', price: 0 },
    ],
  },
  {
    id: 105,
    categoryId: 4,
    name: 'Iced Lemon Tea',
    description: 'Fresh brewed tea shaken with lemon, honey, and plenty of ice.',
    price: 7.9,
    imageUrl:
      'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    prepMinutes: 4,
    tags: ['Cold'],
    addOns: [
      { id: 'less-ice', name: 'Less ice', price: 0 },
      { id: 'no-sugar', name: 'No sugar', price: 0 },
    ],
  },
  {
    id: 106,
    categoryId: 4,
    name: 'Gula Melaka Latte',
    description: 'Espresso, chilled milk, and smoky palm sugar syrup.',
    price: 12.5,
    imageUrl:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    prepMinutes: 5,
    tags: ['Signature'],
    addOns: [
      { id: 'oat', name: 'Oat milk', price: 3 },
      { id: 'shot', name: 'Extra shot', price: 4 },
    ],
  },
  {
    id: 107,
    categoryId: 5,
    name: 'Pandan Kaya Toast',
    description: 'Thick toast with pandan kaya, cold butter, and toasted coconut flakes.',
    price: 10.9,
    imageUrl:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    prepMinutes: 7,
    tags: ['Sweet'],
    addOns: [
      { id: 'icecream', name: 'Vanilla ice cream', price: 4 },
      { id: 'kaya', name: 'Extra kaya', price: 2 },
    ],
  },
  {
    id: 108,
    categoryId: 5,
    name: 'Mango Sago Bowl',
    description: 'Mango puree, pomelo, sago pearls, coconut cream, and fresh mango cubes.',
    price: 13.9,
    imageUrl:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80',
    isAvailable: false,
    prepMinutes: 6,
    tags: ['Sold out'],
    addOns: [],
  },
];

export const SAMPLE_ORDER: Order = {
  orderNumber: 'A1001',
  orderType: 'DINE_IN',
  tableNumber: 'T12',
  status: 'RECEIVED',
  subtotal: 34.8,
  serviceCharge: 2.09,
  totalAmount: 36.89,
  paymentMethod: 'PAY_AT_COUNTER',
  paymentStatus: 'UNPAID',
  customerNote: 'Please serve drinks first.',
  createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  items: [
    {
      menuItemId: 101,
      itemNameSnapshot: 'Nasi Lemak Royale',
      priceSnapshot: 18.9,
      quantity: 1,
      notes: 'Extra sambal',
      addOns: [{ id: 'sambal', name: 'Extra sambal', price: 1.5 }],
      subtotal: 20.4,
    },
    {
      menuItemId: 105,
      itemNameSnapshot: 'Iced Lemon Tea',
      priceSnapshot: 7.9,
      quantity: 2,
      notes: 'Less ice',
      addOns: [{ id: 'less-ice', name: 'Less ice', price: 0 }],
      subtotal: 15.8,
    },
  ],
};
