import {
    backendUrl,
    businessUrl,
    indexerUrl,
    isProd,
    postgresHost,
    postgresPassword,
    shopifyApiKey,
    shopifyApiSecret,
    shopifyAppUrl,
    stage,
    walletUrl,
} from "./config";

const shopifyEnv = {
    STAGE: stage,
    FRAK_WALLET_URL: walletUrl,
    BUSINESS_URL: businessUrl,
    BACKEND_URL: backendUrl,
    INDEXER_URL: indexerUrl,

    POSTGRES_SHOPIFY_DB: isProd ? "shopify_app" : "shopify_app_dev",
    POSTGRES_USER: isProd ? "backend" : "backend-dev",

    SHOPIFY_APP_URL: isProd ? shopifyAppUrl : "http://localhost",
    SHOPIFY_API_KEY: shopifyApiKey,
};

const subdomain = isProd ? "extension-shop" : "extension-shop-dev";

new sst.aws.Remix("Shopify", {
    dev: {
        command: "bun run shopify:dev",
    },
    // Set the custom domain
    domain: {
        name: `${subdomain}.frak.id`,
    },
    // Environment variables
    environment: shopifyEnv,
    link: [postgresHost, postgresPassword, shopifyApiSecret],
});
