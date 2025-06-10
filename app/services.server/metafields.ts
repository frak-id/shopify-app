import type { AuthenticatedContext } from "app/types/context";

const FRAK_NAMESPACE = "frak";
const MODAL_I18N_KEY = "modal_i18n";

export type I18nCustomizations = {
    fr?: SingleLanguageI18nCustomizations;
    en?: SingleLanguageI18nCustomizations;
};

export type MultiLanguageI18nCustomizations = {
    fr?: SingleLanguageI18nCustomizations;
    en?: SingleLanguageI18nCustomizations;
};

export type SingleLanguageI18nCustomizations = Record<string, string>;

/**
 * Get the i18n customizations from shop metafields
 */
export async function getI18nCustomizations({
    admin: { graphql },
}: AuthenticatedContext): Promise<I18nCustomizations> {
    const response = await graphql(
        `
        query GetShopMetafields($namespace: String!, $key: String!) {
            shop {
                metafield(namespace: $namespace, key: $key) {
                    id
                    value
                    type
                }
            }
        }
    `,
        {
            variables: {
                namespace: FRAK_NAMESPACE,
                key: MODAL_I18N_KEY,
            },
        }
    );

    const {
        data: { shop },
    } = await response.json();

    if (shop.metafield?.value) {
        try {
            return JSON.parse(shop.metafield.value);
        } catch (error) {
            console.error("Error parsing i18n metafield:", error);
        }
    }

    return {
        fr: {},
        en: {},
    };
}

/**
 * Update the i18n customizations in shop metafields
 */
export async function updateI18nCustomizations(
    context: AuthenticatedContext,
    customizations: I18nCustomizations
): Promise<{
    success: boolean;
    userErrors: Array<{ field: string; message: string }>;
}> {
    const {
        admin: { graphql },
    } = context;
    const shopId = await getShopId(context);

    const response = await graphql(
        `
        mutation CreateOrUpdateShopMetafield($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
                metafields {
                    id
                    namespace
                    key
                    value
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `,
        {
            variables: {
                metafields: [
                    {
                        namespace: FRAK_NAMESPACE,
                        key: MODAL_I18N_KEY,
                        type: "json",
                        value: JSON.stringify(customizations),
                        ownerId: shopId,
                    },
                ],
            },
        }
    );

    const {
        data: { metafieldsSet },
    } = await response.json();

    return {
        success: metafieldsSet.userErrors.length === 0,
        userErrors: metafieldsSet.userErrors,
    };
}

/**
 * Get the shop ID for metafield operations
 */
export async function getShopId({
    admin: { graphql },
}: AuthenticatedContext): Promise<string> {
    const response = await graphql(`
        query GetShopId {
            shop {
                id
            }
        }
    `);

    const {
        data: { shop },
    } = await response.json();

    return shop.id;
}

/**
 * Get i18n customizations formatted for liquid template consumption
 */
export async function getI18nCustomizationsForLiquid(
    context: AuthenticatedContext
): Promise<string> {
    const customizations = await getI18nCustomizations(context);

    // Filter out empty values and format for liquid
    const filteredCustomizations: I18nCustomizations = {};

    if (customizations.fr) {
        const frFiltered = Object.entries(customizations.fr)
            .filter(([, value]) => value?.trim())
            .reduce(
                (acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                },
                {} as Record<string, string>
            );
        if (Object.keys(frFiltered).length > 0) {
            filteredCustomizations.fr = frFiltered;
        }
    }

    if (customizations.en) {
        const enFiltered = Object.entries(customizations.en)
            .filter(([, value]) => value?.trim())
            .reduce(
                (acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                },
                {} as Record<string, string>
            );
        if (Object.keys(enFiltered).length > 0) {
            filteredCustomizations.en = enFiltered;
        }
    }

    return JSON.stringify(filteredCustomizations);
}
