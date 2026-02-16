// Get some info about the deployment env
export const isProd = $app.stage === "production";
export const isLocal = $dev ?? false;

/**
 * Get a static variable depending on the stack
 * @param string
 * @param string
 * @param local
 */
export function getStaticVariable({
    prod,
    dev,
    local,
}: {
    prod: string;
    dev: string;
    local?: string;
}) {
    if (isProd) {
        return prod;
    }
    if (isLocal) {
        return local ?? dev;
    }
    return dev;
}

// Some simple config depending on the stack
export const indexerUrl = isProd
    ? "https://ponder.gcp.frak.id"
    : "https://ponder.gcp-dev.frak.id";
export const backendUrl = getStaticVariable({
    prod: "https://backend.frak.id",
    dev: "https://backend.gcp-dev.frak.id",
    local: "https://backend.gcp-dev.frak.id",
});
export const walletUrl = getStaticVariable({
    prod: "https://wallet.frak.id",
    dev: "https://wallet.gcp-dev.frak.id",
    local: "https://wallet.gcp-dev.frak.id",
});
export const businessUrl = getStaticVariable({
    prod: "https://business.frak.id",
    dev: "https://business.gcp-dev.frak.id/",
    local: "https://business.gcp-dev.frak.id/",
});
export const stage = $app.stage ?? "dev";

// Some secrets
export const postgresHost = new sst.Secret("POSTGRES_HOST");
export const postgresPassword = new sst.Secret("POSTGRES_PASSWORD");
export const productSetupCodeSalt = new sst.Secret("PRODUCT_SETUP_CODE_SALT");
export const rpcSecret = new sst.Secret("RPC_SECRET");

// Shopify
export const shopifyAppUrl = isProd
    ? "https://extension-shop.frak.id"
    : "https://extension-shop-dev.frak.id";
export const shopifyApiKey = isProd
    ? "87da8338f40c95301b4881ca4bfb23db"
    : "de34932679bc2a2c5a8dddb21a216247";
export const shopifyApiSecret = new sst.Secret("SHOPIFY_API_SECRET");
