import type { AuthenticatedContext } from "app/types/context";
import { shopInfo } from "./shop";

const FRAK_NAMESPACE = "frak";
const MODAL_I18N_KEY = "modal_i18n";
const APPEARANCE_KEY = "appearance";

export type AppearanceMetafieldValue = {
    logoUrl?: string;
};

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
 * Read a metafield from the shop
 */
async function readMetafield<T>(
    graphql: AuthenticatedContext["admin"]["graphql"],
    key: string
): Promise<T | null> {
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
                key,
            },
        }
    );

    const {
        data: { shop },
    } = await response.json();

    if (shop.metafield?.value) {
        try {
            return JSON.parse(shop.metafield.value) as T;
        } catch (error) {
            console.error("Error parsing metafield:", error);
        }
    }

    return null;
}

/**
 * Helper function to write to a metafield
 */
async function writeMetafield<T>(
    ctx: AuthenticatedContext,
    key: string,
    value: T | null
): Promise<{
    success: boolean;
    userErrors: Array<{ field: string; message: string }>;
}> {
    const {
        admin: { graphql },
    } = ctx;
    const shopId = await getShopId(ctx);

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
                        key,
                        type: "json",
                        value: value ? JSON.stringify(value) : null,
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

/* -------------------------------------------------------------------------- */
/*                                    i18n                                    */
/* -------------------------------------------------------------------------- */

/**
 * Get the i18n customizations from shop metafields
 */
export async function getI18nCustomizations({
    admin: { graphql },
}: AuthenticatedContext): Promise<I18nCustomizations> {
    const value = await readMetafield<
        SingleLanguageI18nCustomizations | MultiLanguageI18nCustomizations
    >(graphql, MODAL_I18N_KEY);

    if (value) {
        try {
            // If the stored value is a flat structure (single language mode)
            const isFlatStructure =
                value && typeof value === "object" && !value.fr && !value.en;

            if (isFlatStructure) {
                // Extract logoUrl if it exists in the flat structure
                const flatTranslations = value as Record<string, string>;

                return {
                    en: flatTranslations,
                    fr: {},
                };
            }

            // If the structure already contains language keys, return as-is
            return value;
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
    // Determine if we should store as flat structure (single language) or multi-language
    const hasFrenchData = Boolean(
        customizations.fr && Object.keys(customizations.fr).length > 0
    );
    const hasEnglishData = Boolean(
        customizations.en && Object.keys(customizations.en).length > 0
    );

    const computedValueToStore = buildMetafieldValue(customizations, {
        hasFrenchData,
        hasEnglishData,
    });

    return writeMetafield(context, MODAL_I18N_KEY, computedValueToStore);
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
    }: {
        hasFrenchData: boolean;
        hasEnglishData: boolean;
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

    if (hasFrenchData || hasEnglishData) {
        return {
            fr: customizations.fr ?? {},
            en: customizations.en ?? {},
        };
    }

    if (singleLanguageKey) {
        const translations = customizations[singleLanguageKey] as Record<
            string,
            string
        >;
        return translations;
    }

    return {};
}

/* -------------------------------------------------------------------------- */
/*                                 Appearance                                 */
/* -------------------------------------------------------------------------- */

export async function getAppearanceMetafield({
    admin: { graphql },
}: AuthenticatedContext): Promise<AppearanceMetafieldValue> {
    const value = await readMetafield<AppearanceMetafieldValue>(
        graphql,
        APPEARANCE_KEY
    );

    return value ?? {};
}

export async function updateAppearanceMetafield(
    context: AuthenticatedContext,
    appearance: AppearanceMetafieldValue
): Promise<{
    success: boolean;
    userErrors: Array<{ field: string; message: string }>;
}> {
    return writeMetafield(context, APPEARANCE_KEY, appearance);
}

/**
 * Get the shop ID for metafield operations
 */
export async function getShopId(ctx: AuthenticatedContext): Promise<string> {
    const info = await shopInfo(ctx);
    return info.id;
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
