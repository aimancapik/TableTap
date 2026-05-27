# TableTap

TableTap is a QR table-ordering prototype for restaurants. This first milestone is the customer-facing Angular app: guests land on a table-specific menu, browse dishes, add items to cart, submit a mock order, and track the order status.

## Current Scope

- Mobile-first customer menu for `/menu/table/:tableNumber`
- Item detail modal with quantity, add-ons, and special requests
- Persistent local cart with editable quantities and notes
- Mock order creation and timed status progression
- API-shaped Angular services for future backend replacement

Not included yet: backend, database, auth, admin dashboard, kitchen board, QR generation, or payments.

## Routes

```text
/menu/table/T12
/cart
/order/A1001
```

## Local Development

```bash
npm install
npm start -- --port 4300 --host 127.0.0.1
```

Open `http://127.0.0.1:4300/menu/table/T12`.

## Build

```bash
npm run build
```

## Future Backend Direction

The mock services are shaped around the planned full MVP stack: Express, Prisma, Socket.IO, JWT, and cloud PostgreSQL through Neon or Supabase.
