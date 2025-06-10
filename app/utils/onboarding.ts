import {
    type FirstProductPublishedReturnType,
    firstProductPublished,
    shopInfo,
} from "app/services.server/shop";
import {
    type GetMainThemeIdReturnType,
    doesThemeHasFrakActivated,
    doesThemeHasFrakButton,
    doesThemeHasFrakWalletButton,
    getMainThemeId,
} from "app/services.server/theme";
import {
    type GetWebPixelReturnType,
    getWebPixel,
} from "app/services.server/webPixel";
import {
    type GetWebhooksSubscriptionsReturnType,
    frakWebhookStatus,
    getWebhooks,
} from "app/services.server/webhook";
import type { AuthenticatedContext } from "app/types/context";

export type OnboardingStepData = {
    webPixel?: GetWebPixelReturnType;
    webhooks?: GetWebhooksSubscriptionsReturnType["edges"];
    isThemeHasFrakActivated?: boolean;
    isThemeHasFrakButton?: boolean;
    theme?: GetMainThemeIdReturnType;
    firstProduct?: FirstProductPublishedReturnType;
    themeWalletButton?: string | null;
    frakWebhook?: {
        setup: boolean;
    };
    productId?: string;
};

export type StepValidation = {
    [key: number]: (data: OnboardingStepData) => boolean;
};

/**
 * Validation functions for each onboarding step
 */
export const stepValidations: StepValidation = {
    1: () => true, // Welcome step, always valid
    2: () => true, // Application pixel info step, always valid
    3: (data) => Boolean(data?.webPixel?.id), // Web pixel must be created
    4: (data) => Boolean(data?.webhooks?.length && data?.frakWebhook?.setup), // Webhooks must be set up
    5: (data) => Boolean(data?.isThemeHasFrakActivated), // Theme must have Frak activated
    6: (data) => Boolean(data?.isThemeHasFrakButton || data?.themeWalletButton), // Theme must have Frak button or wallet button
};

/**
 * Data fetchers for each onboarding step
 */
export const stepDataFetchers = {
    3: async (context: AuthenticatedContext): Promise<OnboardingStepData> => {
        try {
            const webPixel = await getWebPixel(context);
            return { webPixel };
        } catch (error) {
            console.error("Error fetching web pixel:", error);
            return {};
        }
    },

    4: async (context: AuthenticatedContext): Promise<OnboardingStepData> => {
        try {
            const [webhooks, shop] = await Promise.all([
                getWebhooks(context),
                shopInfo(context),
            ]);
            const frakWebhook = await frakWebhookStatus({
                productId: shop.productId,
            });
            return { webhooks, frakWebhook, productId: shop.productId };
        } catch (error) {
            console.error("Error fetching webhooks:", error);
            return {};
        }
    },

    5: async (context: AuthenticatedContext): Promise<OnboardingStepData> => {
        try {
            const [isThemeHasFrakActivated, theme] = await Promise.all([
                doesThemeHasFrakActivated(context),
                getMainThemeId(context.admin.graphql),
            ]);
            return { isThemeHasFrakActivated, theme };
        } catch (error) {
            console.error("Error fetching theme data:", error);
            return {};
        }
    },

    6: async (context: AuthenticatedContext): Promise<OnboardingStepData> => {
        try {
            const [isThemeHasFrakButton, firstProduct, themeWalletButton] =
                await Promise.all([
                    doesThemeHasFrakButton(context),
                    firstProductPublished(context),
                    doesThemeHasFrakWalletButton(context),
                ]);
            return { isThemeHasFrakButton, firstProduct, themeWalletButton };
        } catch (error) {
            console.error("Error fetching button data:", error);
            return {};
        }
    },
};

/**
 * Validates if a specific step is completed based on the provided data
 * @param step - The step number to validate
 * @param data - The onboarding step data
 * @returns boolean indicating if the step is invalid (used for button disabled state)
 */
export function validateStep(step: number, data: OnboardingStepData): boolean {
    const validator = stepValidations[step];
    return validator ? !validator(data) : false;
}

/**
 * Fetches all data needed for comprehensive onboarding validation
 * @param context - The authenticated context
 * @returns Complete onboarding data for all steps
 */
export async function fetchAllOnboardingData(
    context: AuthenticatedContext
): Promise<OnboardingStepData> {
    try {
        // Fetch all data in parallel for efficiency
        const [webPixelData, webhookData, themeData, buttonData] =
            await Promise.all([
                stepDataFetchers[3](context),
                stepDataFetchers[4](context),
                stepDataFetchers[5](context),
                stepDataFetchers[6](context),
            ]);

        // Merge all data
        return {
            ...webPixelData,
            ...webhookData,
            ...themeData,
            ...buttonData,
        };
    } catch (error) {
        console.error("Error fetching complete onboarding data:", error);
        return {};
    }
}

/**
 * Checks if the entire onboarding process is complete
 * @param data - The complete onboarding data
 * @returns object with completion status and failed steps
 */
export function validateCompleteOnboarding(data: OnboardingStepData): {
    isComplete: boolean;
    failedSteps: number[];
    completedSteps: number[];
    firstMissingStep: number | undefined;
} {
    const failedSteps: number[] = [];
    const completedSteps: number[] = [];

    // Check steps 3-6 (steps 1-2 are info steps)
    for (let step = 3; step <= 6; step++) {
        const validator = stepValidations[step];
        if (validator) {
            if (validator(data)) {
                completedSteps.push(step);
            } else {
                failedSteps.push(step);
            }
        }
    }

    // Get the first missing step
    const firstMissingStep =
        failedSteps.length > 0 ? failedSteps[0] : undefined;

    return {
        isComplete: failedSteps.length === 0,
        failedSteps,
        completedSteps,
        firstMissingStep,
    };
}

/**
 * Gets a human-readable status message for onboarding completion
 * @param validationResult - Result from validateCompleteOnboarding
 * @returns Status message object
 */
export function getOnboardingStatusMessage(validationResult: {
    isComplete: boolean;
    failedSteps: number[];
    completedSteps: number[];
}): {
    status: "complete" | "incomplete";
    message: string;
    failedSteps: number[];
} {
    if (validationResult.isComplete) {
        return {
            status: "complete",
            message: "All onboarding steps completed successfully",
            failedSteps: [],
        };
    }

    const stepNames = {
        3: "Web Pixel",
        4: "Webhooks",
        5: "Theme Activation",
        6: "Frak Buttons",
    };

    const failedStepNames = validationResult.failedSteps
        .map((step) => stepNames[step as keyof typeof stepNames])
        .filter(Boolean);

    return {
        status: "incomplete",
        message: `Onboarding incomplete. Missing: ${failedStepNames.join(", ")}`,
        failedSteps: validationResult.failedSteps,
    };
}
