/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "shopify-app",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
            provider: {
                aws: {
                    region: "eu-west-1",
                },
            },
        };
    },
    async run() {
        if ($app.stage === "prod") {
            throw new Error(
                "[Deprecated] please use `production` stage instead of `prod`"
            );
        }
        await import("./infra/config");
        await import("./infra/shopify");
    },
});
