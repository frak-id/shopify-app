import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout, Page, Tabs } from "@shopify/polaris";
import { ButtonTab } from "app/components/Appearance/ButtonTab";
import { CustomizationsTab } from "app/components/Appearance/CustomizationsTab";
import { WalletButtonTab } from "app/components/Appearance/WalletButtonTab";
import {
    type AppearanceMetafieldValue,
    type I18nCustomizations,
    getAppearanceMetafield,
    getI18nCustomizations,
    updateAppearanceMetafield,
    updateI18nCustomizations,
} from "app/services.server/metafields";
import { firstProductPublished } from "app/services.server/shop";
import {
    doesThemeHasFrakButton,
    doesThemeHasFrakWalletButton,
} from "app/services.server/theme";
import { authenticate } from "app/shopify.server";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);

    // Get all data needed for the appearance tabs
    const [
        customizations,
        appearanceMetafield,
        isThemeHasFrakButton,
        firstProduct,
        themeWalletButton,
    ] = await Promise.all([
        getI18nCustomizations(context),
        getAppearanceMetafield(context),
        doesThemeHasFrakButton(context),
        firstProductPublished(context),
        doesThemeHasFrakWalletButton(context),
    ]);

    return Response.json({
        customizations,
        appearanceMetafield,
        isThemeHasFrakButton,
        firstProduct,
        themeWalletButton,
    });
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
        const appearanceMetafieldData = formData.get("appearanceMetafield");

        if (!customizationsData && !appearanceMetafieldData) {
            return Response.json(
                {
                    success: false,
                    message: "No customizations data provided",
                },
                { status: 400 }
            );
        }

        let success = true;
        const userErrors: string[] = [];

        // Handle i18n customizations
        if (customizationsData) {
            const customizations: I18nCustomizations = JSON.parse(
                customizationsData as string
            );

            const result = await updateI18nCustomizations(
                context,
                customizations
            );
            success = result.success;
            userErrors.push(...result.userErrors.map((e) => e.message));
        }

        // Handle appearance metafield
        if (appearanceMetafieldData) {
            const appearanceMetafield: AppearanceMetafieldValue = JSON.parse(
                appearanceMetafieldData as string
            );

            const result = await updateAppearanceMetafield(
                context,
                appearanceMetafield
            );

            success = success && result.success;
            userErrors.push(...result.userErrors.map((e) => e.message));
        }

        if (success) {
            return Response.json({
                success: true,
                message: "Customizations saved successfully!",
            });
        }

        return Response.json(
            {
                success: false,
                message: `Error saving customizations: ${userErrors.join(", ")}`,
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

export default function AppearancePage() {
    const {
        customizations,
        appearanceMetafield,
        isThemeHasFrakButton,
        firstProduct,
        themeWalletButton,
    } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const [selectedTab, setSelectedTab] = useState(0);

    const tabs = [
        {
            id: "customizations",
            content: t("appearance.tabs.customizations"),
            panelID: "customizations-panel",
        },
        {
            id: "share-button",
            content: t("appearance.tabs.shareButton"),
            panelID: "share-button-panel",
        },
        {
            id: "wallet-button",
            content: t("appearance.tabs.walletButton"),
            panelID: "wallet-button-panel",
        },
    ];

    const renderTabContent = () => {
        switch (selectedTab) {
            case 0:
                return (
                    <CustomizationsTab
                        initialCustomizations={customizations}
                        initialAppearanceMetafield={appearanceMetafield}
                    />
                );
            case 1:
                return (
                    <ButtonTab
                        isThemeHasFrakButton={isThemeHasFrakButton}
                        firstProduct={firstProduct}
                    />
                );
            case 2:
                return (
                    <WalletButtonTab themeWalletButton={themeWalletButton} />
                );
            default:
                return null;
        }
    };

    return (
        <Page title={t("appearance.title")}>
            <Layout>
                <Layout.Section>
                    <Tabs
                        tabs={tabs}
                        selected={selectedTab}
                        onSelect={setSelectedTab}
                    >
                        {renderTabContent()}
                    </Tabs>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
