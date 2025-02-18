import * as aws from "@pulumi/aws";

// Get the VPC
const { id: vpcId } = await aws.ec2.getVpc({
    filters: [{ name: "tag:Name", values: ["master-vpc"] }],
});
export const vpc = sst.aws.Vpc.get("MasterVpc", vpcId);

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
    ? "https://indexer.frak.id"
    : "https://indexer-dev.frak.id";
export const backendUrl = getStaticVariable({
    prod: "https://backend.frak.id",
    dev: "https://backend-dev.frak.id",
    local: "http://localhost:3030",
});
export const walletUrl = getStaticVariable({
    prod: "https://wallet.frak.id",
    dev: "https://wallet-dev.frak.id",
    local: "https://localhost:3000",
});
export const businessUrl = getStaticVariable({
    prod: "https://business.frak.id",
    dev: "https://business-dev.frak.id",
    local: "https://localhost:3001",
});
export const stage = $app.stage ?? "dev";

// Some secrets
export const postgresHost = new sst.Secret("POSTGRES_HOST");
export const postgresPassword = new sst.Secret("POSTGRES_PASSWORD");

// Shopify
export const shopifyAppUrl = isProd
    ? "https://extension-shop.frak.id"
    : "https://extension-shop-dev.frak.id";
export const shopifyApiKey = "87da8338f40c95301b4881ca4bfb23db";
export const shopifyApiSecret = new sst.Secret("SHOPIFY_API_SECRET");
export const shopifyCustomAppUrl = "https://extension-custom-shop.frak.id";
export const shopifyCustomApiKey = "5a65623a5ceb9e6dc7147271eb7bb9f1";
export const shopifyCustomApiSecret = new sst.Secret(
    "SHOPIFY_CUSTOM_API_SECRET"
);
