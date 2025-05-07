import type { ActionFunctionArgs } from "@remix-run/node";
import { drizzleDb } from "app/db.server";
import { sessionTable } from "db/schema/sessionTable";
import { eq } from "drizzle-orm";
import { purchaseTable } from "../../db/schema/purchaseTable";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { shop, session, topic, payload } =
        await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    switch (topic) {
        /*
        When a shop is uninstalled, the APP_UNINSTALLED webhook is sent to the app.
        The app should use this information to delete any data that it has stored for the shop.

        PAYLOAD app/uninstalled
        */
        case "APP_UNINSTALLED":
            if (session) {
                // Webhook requests can trigger multiple times and after an app has already been uninstalled.
                // If this webhook already ran, the session may have been deleted previously.
                await drizzleDb
                    .delete(sessionTable)
                    .where(eq(sessionTable.shop, shop));
            }
            break;
        /*
        GDPR compliance webhooks
        https://shopify.dev/docs/apps/build/privacy-law-compliance#subscribe-to-compliance-webhooks

        Hooks can be tested using the Shopify CLI:
        shopify app webhook trigger --topic=customers/data_request --address=$SHOPIFY_URL/webhooks/app/compliance --api-version=2025-01
        */

        case "APP_PURCHASES_ONE_TIME_UPDATE":
            /*
         PAYLOAD app_purchases_one_time/update

         {
            "confirmation_url": "https://jsmith.myshopify.com/admin/charges/confirm_application_charge?id=1012637313&amp;signature=BAhpBIGeWzw%3D--17779c1efb4688e9cfa653a3245f923b4f1eb140",
            "created_at": "2013-06-27T08:48:27-04:00",
            "name": "Super Duper Expensive action",
            "id": 675931192,
            "return_url": "http://super-duper.shopifyapps.com",
            "price": "100.00",
            "test": null,
            "status": "accepted",
            "currency": "USD"
            "updated_at": "2013-06-27T08:48:27-04:00",
        }
        */
            if (session) {
                await drizzleDb
                    .update(purchaseTable)
                    .set({
                        status: payload.status,
                        confirmationUrl: payload.confirmation_url,
                    })
                    .where(eq(purchaseTable.purchaseId, payload.id));
            }
            break;

        case "CUSTOMERS_DATA_REQUEST":
        /*
         When a customer requests their data, the CUSTOMERS_DATA_REQUEST webhook is sent to the app.
         The app should use this information to prepare the data for the customer.
         Data must be sent to the customer directly on his email address.

         PAYLOAD customers/data_request

         {
            "shop_id": 954889,
            "shop_domain": "{shop}.myshopify.com",
            "orders_requested": [299938, 280263, 220458],
            "customer": {
                "id": 191167,
                "email": "john@example.com",
                "phone":  "555-625-1199"
            },
            "data_request": {
                "id": 9999
            }
         }
         */
        case "CUSTOMERS_REDACT":
        /*
         When a customer requests to be forgotten, the CUSTOMERS_REDACT webhook is sent to the app.

         PAYLOAD customers/redact

         {
            "shop_id": 954889,
            "shop_domain": "{shop}.myshopify.com",
            "customer": {
                "id": 191167,
                "email": "john@example.com",
                "phone": "555-625-1199"
            },
            "orders_to_redact": [299938, 280263, 220458]
         }
         */
        case "SHOP_REDACT":
        /*
         When a shop is uninstalled, the SHOP_REDACT webhook is sent to the app.
         The app should use this information to delete any data that it has stored for the shop.

         PAYLOAD shop/redact

         {
            "shop_id": 954889,
            "shop_domain": "{shop}.myshopify.com"
         }
         */
    }

    return new Response();
};
