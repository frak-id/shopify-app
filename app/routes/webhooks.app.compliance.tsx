import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { shop, topic } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    switch (topic) {
        /*
        GDPR compliance webhooks
        https://shopify.dev/docs/apps/build/privacy-law-compliance#subscribe-to-compliance-webhooks

        Hooks can be tested using the Shopify CLI:
        shopify app webhook trigger --topic=customers/data_request --address=$SHOPIFY_URL/webhooks/app/compliance --api-version=2025-01
        */

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
