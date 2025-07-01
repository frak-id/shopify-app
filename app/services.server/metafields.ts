import type { AuthenticatedContext } from "app/types/context";

const FRAK_NAMESPACE = "frak";
const MODAL_I18N_KEY = "modal_i18n";

export type I18nCustomizations = {
    logoUrl?: string;
    fr?: SingleLanguageI18nCustomizations;
    en?: SingleLanguageI18nCustomizations;
};

export type MultiLanguageI18nCustomizations = {
    logoUrl?: string;
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

            // If the stored value is a flat structure (single language mode)
            const isFlatStructure =
                storedValue &&
                typeof storedValue === "object" &&
                !storedValue.fr &&
                !storedValue.en;

            if (isFlatStructure) {
                // Extract logoUrl if it exists in the flat structure
                const { logoUrl, ...flatTranslations } = storedValue as Record<
                    string,
                    string
                > & {
                    logoUrl?: string;
                };

                return {
                    logoUrl,
                    en: flatTranslations,
                    fr: {},
                };
            }

            // If the structure already contains language keys, return as-is
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
    const hasFrenchData = Boolean(
        customizations.fr && Object.keys(customizations.fr).length > 0
    );
    const hasEnglishData = Boolean(
        customizations.en && Object.keys(customizations.en).length > 0
    );
    const hasLogoUrl = Boolean(customizations.logoUrl);

    const computedValueToStore = buildMetafieldValue(customizations, {
        hasFrenchData,
        hasEnglishData,
        hasLogoUrl,
    });

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
                        value: JSON.stringify(computedValueToStore),
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

    if (customizations.logoUrl) {
        filteredCustomizations.logoUrl = customizations.logoUrl;
    }

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

/**
 * Helper to compute the value we want to persist in the metafield, while keeping
 * the main updateI18nCustomizations function simple.
 */
function buildMetafieldValue(
    customizations: I18nCustomizations,
    {
        hasFrenchData,
        hasEnglishData,
        hasLogoUrl,
    }: {
        hasFrenchData: boolean;
        hasEnglishData: boolean;
        hasLogoUrl: boolean;
    }
):
    | I18nCustomizations
    | SingleLanguageI18nCustomizations
    | Record<string, never> {
    const singleLanguageKey =
        hasEnglishData && !hasFrenchData
            ? "en"
            : hasFrenchData && !hasEnglishData
              ? "fr"
              : null;

    if (hasFrenchData && hasEnglishData) {
        return {
            ...(hasLogoUrl ? { logoUrl: customizations.logoUrl } : {}),
            fr: customizations.fr ?? {},
            en: customizations.en ?? {},
        };
    }

    if (singleLanguageKey) {
        const translations = customizations[singleLanguageKey] as Record<
            string,
            string
        >;
        return {
            ...translations,
            ...(hasLogoUrl ? { logoUrl: customizations.logoUrl } : {}),
        };
    }

    return hasLogoUrl ? { logoUrl: customizations.logoUrl } : {};
}
