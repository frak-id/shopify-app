import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
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
    TextField,
    Toast,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import {
    type I18nCustomizations,
    getI18nCustomizations,
    updateI18nCustomizations,
} from "app/services.server/metafields";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const customizations = await getI18nCustomizations(context);
    return json({ customizations });
};

export async function action({ request }: ActionFunctionArgs) {
    const context = await authenticate.admin(request);
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "save") {
        try {
            // Parse the customizations data
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

            const result = await updateI18nCustomizations(
                context,
                customizations
            );

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

    return Response.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
    );
}

const DEFAULT_I18N_KEYS = [
    {
        key: "sharing.title",
        description: "Title for the system sharing modal",
    },
    {
        key: "sharing.text",
        description: "Text content for sharing",
    },
    {
        key: "sdk.wallet.login.text",
        description: "Default modal login text for end user",
    },
    {
        key: "sdk.wallet.login.primaryAction",
        description: "Default modal login button text",
    },
    {
        key: "sdk.wallet.login.text_sharing",
        description: "Modal login text when in sharing context",
    },
    {
        key: "sdk.wallet.login.text_referred",
        description: "Modal login text for users who opened a sharing link",
    },
];

export default function CustomizationsPage() {
    const { customizations: initialCustomizations } =
        useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [customizations, setCustomizations] = useState<I18nCustomizations>(
        initialCustomizations
    );
    const [showToast, setShowToast] = useState(false);

    const isLoading = navigation.state === "submitting";

    useEffect(() => {
        if (actionData?.success) {
            setShowToast(true);
        }
    }, [actionData]);

    const updateTranslation = (
        language: "fr" | "en",
        key: string,
        value: string
    ) => {
        setCustomizations((prev) => ({
            ...prev,
            [language]: {
                ...prev[language],
                [key]: value,
            },
        }));
    };

    const handleSubmit = () => {
        const form = document.querySelector("form") as HTMLFormElement;
        if (form) {
            // Update the hidden input with current customizations
            const hiddenInput = form.querySelector(
                'input[name="customizations"]'
            ) as HTMLInputElement;
            if (hiddenInput) {
                hiddenInput.value = JSON.stringify(customizations);
            }
            form.submit();
        }
    };

    const toast =
        showToast && actionData?.success ? (
            <Toast
                content={actionData.message}
                onDismiss={() => setShowToast(false)}
            />
        ) : null;

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
            {toast}
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
                                        Modal i18n Customizations
                                    </Badge>
                                </Box>
                                <Text as="p" variant="bodyMd">
                                    Customize the text displayed in Frak modals
                                    for different languages. These
                                    customizations will override the default
                                    text for your store.
                                </Text>

                                <form method="post">
                                    <input
                                        type="hidden"
                                        name="intent"
                                        value="save"
                                    />
                                    <input
                                        type="hidden"
                                        name="customizations"
                                        value={JSON.stringify(customizations)}
                                    />

                                    <FormLayout>
                                        {/* French Translations */}
                                        <Card>
                                            <BlockStack gap="400">
                                                <Text
                                                    as="h3"
                                                    variant="headingMd"
                                                >
                                                    French (fr) Translations
                                                </Text>

                                                {DEFAULT_I18N_KEYS.map(
                                                    ({ key, description }) => (
                                                        <TextField
                                                            key={`fr-${key}`}
                                                            label={key}
                                                            helpText={
                                                                description
                                                            }
                                                            value={
                                                                customizations
                                                                    .fr?.[
                                                                    key
                                                                ] || ""
                                                            }
                                                            onChange={(value) =>
                                                                updateTranslation(
                                                                    "fr",
                                                                    key,
                                                                    value
                                                                )
                                                            }
                                                            multiline={
                                                                key.includes(
                                                                    "text"
                                                                ) ||
                                                                key.includes(
                                                                    "title"
                                                                )
                                                            }
                                                            autoComplete="off"
                                                        />
                                                    )
                                                )}
                                            </BlockStack>
                                        </Card>

                                        {/* English Translations */}
                                        <Card>
                                            <BlockStack gap="400">
                                                <Text
                                                    as="h3"
                                                    variant="headingMd"
                                                >
                                                    English (en) Translations
                                                </Text>

                                                {DEFAULT_I18N_KEYS.map(
                                                    ({ key, description }) => (
                                                        <TextField
                                                            key={`en-${key}`}
                                                            label={key}
                                                            helpText={
                                                                description
                                                            }
                                                            value={
                                                                customizations
                                                                    .en?.[
                                                                    key
                                                                ] || ""
                                                            }
                                                            onChange={(value) =>
                                                                updateTranslation(
                                                                    "en",
                                                                    key,
                                                                    value
                                                                )
                                                            }
                                                            multiline={
                                                                key.includes(
                                                                    "text"
                                                                ) ||
                                                                key.includes(
                                                                    "title"
                                                                )
                                                            }
                                                            autoComplete="off"
                                                        />
                                                    )
                                                )}
                                            </BlockStack>
                                        </Card>
                                    </FormLayout>
                                </form>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
