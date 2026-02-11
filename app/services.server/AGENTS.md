# services.server/ — Server Business Logic

All Shopify Admin API + external API interactions live here. **Never import these from client code.**

## PATTERN

Every service exports **async functions** taking `AuthenticatedContext` as first param:

```ts
import type { AuthenticatedContext } from "...";

export async function doSomething(
    context: AuthenticatedContext,
    params: { ... }
): Promise<Result> {
    const { admin, session } = context;
    const response = await admin.graphql(`query { ... }`, { variables: { ... } });
    const { data } = await response.json();
    return data;
}
```

`AuthenticatedContext` comes from `authenticate.admin(request)` in route loaders/actions.

## INVENTORY

| Service           | Purpose                                                    | Caching  | External API                  |
| ----------------- | ---------------------------------------------------------- | -------- | ----------------------------- |
| **shop.ts**       | Shop metadata (name, domain, currency), first product      | LRU 1min | Shopify GraphQL               |
| **metafields.ts** | Read/write shop metafields (i18n, appearance)              | None     | Shopify GraphQL               |
| **theme.ts**      | Theme inspection, block detection, Frak integration status | LRU 30s  | Shopify GraphQL               |
| **webPixel.ts**   | Web pixel CRUD                                             | None     | Shopify GraphQL               |
| **webhook.ts**    | Webhook subscription management + status check             | None     | Shopify GraphQL + backend API |
| **purchase.ts**   | One-time app purchases, DB tracking                        | None     | Shopify GraphQL + Drizzle     |
| **onchain.ts**    | On-chain product/bank/campaign data from indexer           | LRU 5s   | indexer API (ponder)          |
| **mint.ts**       | Product setup code generation                              | None     | Pure crypto (keccak256)       |

## CONVENTIONS

- **GraphQL inline**: queries written as template literals directly in service functions. No separate `.graphql` files.
- **LRU caching**: `lru-cache` with TTL. Cache key = `session.shop`. Used for high-frequency reads (shop info, theme state).
- **Metafield namespace**: `"frak"`. Keys: `modal_i18n`, `appearance`. Values: JSON-stringified.
- **Generic helpers**: `metafields.ts` has `readMetafield<T>()` / `writeMetafield<T>()` — reuse for new metafields.
- **Error handling**: try-catch with `console.error`, return `null`/`undefined` on failure. Never throw from services.

## WHERE TO LOOK

| Task                    | File            | Key exports                                                                                                                       |
| ----------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Query shop data         | `shop.ts`       | `shopInfo()`, `getFirstPublishedProduct()`                                                                                        |
| Read/write metafields   | `metafields.ts` | `getI18nCustomizations()`, `updateI18nCustomizations()`, `getAppearanceMetafield()`, `updateAppearanceMetafield()`, `getShopId()` |
| Check theme integration | `theme.ts`      | `doesThemeSupportBlock()`, `doesThemeHasFrakActivated()`, `doesThemeHasFrakButton()`, `doesThemeHasFrakWalletButton()`            |
| Manage web pixel        | `webPixel.ts`   | `getWebPixel()`, `createWebPixel()`, `deleteWebPixel()`                                                                           |
| Manage webhooks         | `webhook.ts`    | `getWebhookSubscriptions()`, `createWebhookSubscription()`, `deleteWebhookSubscription()`, `isWebhookEnabled()`                   |
| App purchases           | `purchase.ts`   | `startupPurchase()`, `getCurrentPurchases()`, `getPurchase()`                                                                     |
| On-chain data           | `onchain.ts`    | `getOnchainProductInfo()`                                                                                                         |
| Setup codes             | `mint.ts`       | `getProductSetupCode()`                                                                                                           |

## DEPENDENCY GRAPH

```
shop.ts (foundation — most services depend on it)
  ↑
  ├─ metafields.ts → shopInfo() for shop ID
  ├─ theme.ts → shopInfo() for shop domain
  ├─ purchase.ts → shopInfo() for shop info + ID
  ├─ webhook.ts → shopInfo() for product ID
  ├─ onchain.ts → shopInfo() for normalized domain
  └─ mint.ts → shopInfo() for normalized domain

webPixel.ts (independent — no service dependencies)
```

## ANTI-PATTERNS

- **No client imports**: files use `.server.ts` suffix or live in `services.server/` dir — Remix treeshakes them from client bundle.
- **No direct DB calls outside purchase.ts/webhooks.tsx**: purchase.ts owns the purchase table; session adapter owns session table.
- **No throwing**: services return null on error. Let the route decide how to handle missing data.
- **No `.graphql` files**: queries are inline template literals. Use `#graphql` pragma for IDE hints.
