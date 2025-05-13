import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Card, Page } from "@shopify/polaris";
import { Stepper } from "app/components/Stepper";
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
import { authenticate } from "app/shopify.server";
import type { AuthenticatedContext } from "app/types/context";
import { productIdFromDomain } from "app/utils/productIdFromDomain";
import { useTranslation } from "react-i18next";

/**
 * Extract the step number from the step string
 * @param step - The step string (step1, step2, etc.)
 */
function parseStepNumber(step?: string) {
    if (!step) return 1;
    return Number(step.replace(/\D/g, "")); // Extract only numbers
}

type StepData = {
    webPixel?: GetWebPixelReturnType;
    webhooks?: GetWebhooksSubscriptionsReturnType;
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

/**
 * Handlers for each step that will fetch the data needed
 */
const stepHandlers = {
    3: async (context: AuthenticatedContext): Promise<StepData> => {
        try {
            const webPixel = await getWebPixel(context);
            return { webPixel };
        } catch (error) {
            console.error(error);
            return {};
        }
    },

    4: async (context: AuthenticatedContext): Promise<StepData> => {
        const webhooks = await getWebhooks(context);
        const shop = await shopInfo(context);
        const productId = productIdFromDomain(shop.myshopifyDomain);
        const frakWebhook = await frakWebhookStatus({
            productId: String(productId),
        });
        return { webhooks, frakWebhook, productId };
    },

    5: async (context: AuthenticatedContext): Promise<StepData> => {
        const [isThemeHasFrakActivated, theme] = await Promise.all([
            doesThemeHasFrakActivated(context),
            getMainThemeId(context.admin.graphql),
        ]);
        return { isThemeHasFrakActivated, theme };
    },

    6: async (context: AuthenticatedContext): Promise<StepData> => {
        const [isThemeHasFrakButton, firstProduct, themeWalletButton] =
            await Promise.all([
                doesThemeHasFrakButton(context),
                firstProductPublished(context),
                doesThemeHasFrakWalletButton(context),
            ]);
        return { isThemeHasFrakButton, firstProduct, themeWalletButton };
    },
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const stepNumber = parseStepNumber(params.step);
    const stepHandler = stepHandlers[stepNumber as keyof typeof stepHandlers];
    const stepData = stepHandler ? await stepHandler(context) : {};

    return {
        step: stepNumber,
        ...stepData,
    };
};

export default function OnBoardingPage() {
    const { step } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <Page title={t("common.title")}>
            <BlockStack gap="500">
                <Card>
                    <Stepper step={step} />
                </Card>
            </BlockStack>
        </Page>
    );
}
