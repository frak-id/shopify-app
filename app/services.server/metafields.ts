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
            const storedValue = JSON.parse(shop.metafield.value);

            // Check if it's a flat structure (single language mode)
            // If the stored value doesn't have 'fr' or 'en' keys, it's a flat structure
            if (
                storedValue &&
                typeof storedValue === "object" &&
                !storedValue.fr &&
                !storedValue.en
            ) {
                // Map flat structure to 'en' for frontend compatibility
                return {
                    en: storedValue,
                    fr: {},
                };
            }

            // Return multi-language structure as-is
            return storedValue;
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

    // Determine if we should store as flat structure (single language) or multi-language
    const hasFrenchData =
        customizations.fr && Object.keys(customizations.fr).length > 0;
    const hasEnglishData =
        customizations.en && Object.keys(customizations.en).length > 0;

    let valueToStore:
        | I18nCustomizations
        | SingleLanguageI18nCustomizations
        | Record<string, never>;

    if (hasFrenchData && hasEnglishData) {
        // Multi-language: store with language structure
        valueToStore = customizations;
    } else if (hasEnglishData && !hasFrenchData && customizations.en) {
        // Single language (English): store flat structure
        valueToStore = customizations.en;
    } else if (hasFrenchData && !hasEnglishData && customizations.fr) {
        // Single language (French): store flat structure
        valueToStore = customizations.fr;
    } else {
        // No data: store empty object
        valueToStore = {};
    }

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
                        value: JSON.stringify(valueToStore),
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
