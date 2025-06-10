import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    FormLayout,
    Layout,
    Page,
    Text,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import {
    type I18nCustomizations,
    getI18nCustomizations,
    updateI18nCustomizations,
} from "app/services.server/metafields";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    MultiLanguageFields,
    SingleLanguageFields,
} from "../components/Customizations/Field";
import { LanguageModeSelector } from "../components/Customizations/LanguageSelector";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const customizations = await getI18nCustomizations(context);
    return Response.json({ customizations });
};

export async function action({ request }: ActionFunctionArgs) {
    const context = await authenticate.admin(request);
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent !== "save") {
        return Response.json(
            { success: false, message: "Invalid action" },
            { status: 400 }
        );
    }

    try {
        const customizationsData = formData.get("customizations");
        if (!customizationsData) {
            return Response.json(
                {
                    success: false,
                    message: "No customizations data provided",
                },
                { status: 400 }
            );
        }

        const customizations: I18nCustomizations = JSON.parse(
            customizationsData as string
        );

        const result = await updateI18nCustomizations(context, customizations);

        if (result.success) {
            return Response.json({
                success: true,
                message: "Customizations saved successfully!",
            });
        }

        return Response.json(
            {
                success: false,
                message: `Error saving customizations: ${result.userErrors.map((e) => e.message).join(", ")}`,
            },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error in customizations action:", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred while saving customizations",
            },
            { status: 500 }
        );
    }
}

type LanguageMode = "single" | "multi";

export default function CustomizationsPage() {
    const { customizations: initialCustomizations } =
        useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [customizations, setCustomizations] = useState<I18nCustomizations>(
        initialCustomizations
    );
    const [languageMode, setLanguageMode] = useState<LanguageMode>("single");

    const isLoading = navigation.state === "submitting";

    // Determine initial language mode based on existing data
    useEffect(() => {
        const hasFrench =
            customizations.fr && Object.keys(customizations.fr).length > 0;
        const hasEnglish =
            customizations.en && Object.keys(customizations.en).length > 0;

        if (hasFrench && hasEnglish) {
            setLanguageMode("multi");
        } else {
            setLanguageMode("single");
        }
    }, [customizations.fr, customizations.en]);

    useEffect(() => {
        if (actionData?.success) {
            shopify.toast.show(actionData.message);
        }
    }, [actionData]);

    // Handle single language updates
    const handleSingleLanguageUpdate = (key: string, value: string) => {
        setCustomizations((prev) => {
            const newCustomizations = { ...prev };

            // For single mode, store in 'en' and clear 'fr'
            if (!newCustomizations.en) newCustomizations.en = {};
            newCustomizations.en[key] = value;

            // Sync sdk.wallet.login.text with sdk.wallet.login.text_sharing
            if (key === "sdk.wallet.login.text_sharing") {
                newCustomizations.en["sdk.wallet.login.text"] = value;
            }

            return newCustomizations;
        });
    };

    // Handle multi language updates
    const handleMultiLanguageUpdate = (
        language: "fr" | "en",
        key: string,
        value: string
    ) => {
        setCustomizations((prev) => ({
            ...prev,
            [language]: {
                ...(prev[language] as Record<string, string>),
                [key]: value,
                // Sync sdk.wallet.login.text with sdk.wallet.login.text_sharing
                ...(key === "sdk.wallet.login.text_sharing"
                    ? { "sdk.wallet.login.text": value }
                    : {}),
            },
        }));
    };

    // Handle language mode change
    const handleLanguageModeChange = (mode: LanguageMode) => {
        setLanguageMode(mode);

        if (mode === "single") {
            // Convert to single language (keep only English)
            const englishData = customizations.en || {};
            setCustomizations(englishData as Record<string, string>);
        }
    };

    const handleSubmit = () => {
        const form = document.querySelector("form") as HTMLFormElement;
        if (form) {
            const hiddenInput = form.querySelector(
                'input[name="customizations"]'
            ) as HTMLInputElement;
            if (hiddenInput) {
                hiddenInput.value = JSON.stringify(customizations);
            }
            form.submit();
        }
    };

    return (
        <Page
            title={t("customizations.title")}
            primaryAction={
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={isLoading}
                >
                    {t("customizations.save")}
                </Button>
            }
        >
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        <Card>
                            <BlockStack gap="400">
                                <Box
                                    paddingBlockStart="200"
                                    paddingBlockEnd="200"
                                >
                                    <Badge tone="info" icon={CheckIcon}>
                                        {t("customizations.modal.title")}
                                    </Badge>
                                </Box>
                                <Text as="p" variant="bodyMd">
                                    {t("customizations.modal.description")}
                                </Text>
                            </BlockStack>
                        </Card>

                        <LanguageModeSelector
                            mode={languageMode}
                            onModeChange={handleLanguageModeChange}
                        />

                        <form method="post">
                            <input type="hidden" name="intent" value="save" />
                            <input
                                type="hidden"
                                name="customizations"
                                value={JSON.stringify(customizations)}
                            />

                            <FormLayout>
                                {languageMode === "single" ? (
                                    <SingleLanguageFields
                                        customizations={
                                            customizations as SingleLanguageI18nCustomizations
                                        }
                                        onUpdate={handleSingleLanguageUpdate}
                                    />
                                ) : (
                                    <MultiLanguageFields
                                        customizations={
                                            customizations as MultiLanguageI18nCustomizations
                                        }
                                        onUpdate={handleMultiLanguageUpdate}
                                    />
                                )}
                            </FormLayout>
                        </form>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
