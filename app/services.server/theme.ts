import { parse as jsonc_parse } from "jsonc-parser";
import type { AuthenticatedContext } from "../types/context";

type ThemeFile = {
    filename: string;
    body: {
        content: string;
        sections: {
            id: string;
            section: { type: string; block_order: string[] };
        };
    };
};

/**
 * GraphQL query to fetch theme files from Shopify
 */
const getFilesQuery = `
query getFiles($filenames: [String!]!, $themeId: ID!) {
  theme(id: $themeId) {
    files(filenames: $filenames) {
      nodes {
        filename
        body {
        ... on OnlineStoreThemeFileBodyText { content }
        ... on OnlineStoreThemeFileBodyBase64 { contentBase64 }
        }
      }
    }
  }
}
`;

/**
 * GraphQL query to fetch main theme id
 */
export async function getMainThemeId(
    graphql: AuthenticatedContext["admin"]["graphql"]
) {
    const response = await graphql(`
query getMainThemeId {
  themes(first: 1, roles: [MAIN]) {
    nodes {
      id
    }
  }
}`);
    const {
        data: { themes },
    } = await response.json();
    const gid = themes?.nodes?.[0]?.id;

    if (!gid) {
        console.warn("No main theme found");
        return { themeId: false };
    }

    // Extract the theme id from the full string (e.g. "gid://shopify/OnlineStoreTheme/140895584433")
    const id = gid.split("/").pop();

    return { gid, id };
}

/**
 *
 * @param graphql
 * @param gid
 * @param templates
 * @returns
 */
async function getTemplateFiles(
    graphql: AuthenticatedContext["admin"]["graphql"],
    gid: number,
    templates: string[]
) {
    const response = await graphql(getFilesQuery, {
        variables: {
            themeId: gid,
            filenames: templates,
        },
    });
    const {
        data: { theme },
    } = await response.json();
    const jsonTemplateFiles = theme?.files?.nodes;

    const jsonTemplateData = jsonTemplateFiles.map((file: ThemeFile) => {
        return {
            filename: file.filename,
            body: jsonc_parse(file.body.content),
        };
    });

    return jsonTemplateData;
}

/**
 * Check if the current shop theme support blocks
 */
export async function doesThemeSupportBlock({
    admin: { graphql },
}: AuthenticatedContext) {
    // Get the main theme id
    const { gid } = await getMainThemeId(graphql);

    // Retrieve the JSON templates that we want to integrate with
    const jsonTemplateData = await getTemplateFiles(graphql, gid, [
        "templates/product.json",
    ]);

    // Retrieve the body of JSON templates and find what section is set as `main`
    const templateMainSections = jsonTemplateData
        .map((file: ThemeFile) => {
            const main = Object.entries(file.body.sections).find(
                ([id, section]) =>
                    typeof section !== "string"
                        ? id === "main" || section.type.startsWith("main-")
                        : false
            );
            if (main && typeof main[1] !== "string" && main[1].type) {
                return `sections/${main[1].type}.liquid`;
            }
        })
        .filter((section: string | null) => section);

    const response = await graphql(getFilesQuery, {
        variables: {
            themeId: gid,
            filenames: templateMainSections,
        },
    });
    const {
        data: { theme: themeSectionFiles },
    } = await response.json();
    const sectionFiles = themeSectionFiles?.files?.nodes;

    const sectionsWithAppBlock = sectionFiles
        .map((file: ThemeFile) => {
            let acceptsAppBlock = false;
            const match = file.body.content.match(
                /\{\%\s+schema\s+\%\}([\s\S]*?)\{\%\s+endschema\s+\%\}/m
            );
            if (match) {
                const schema = jsonc_parse(match[1]);
                if (schema?.blocks) {
                    acceptsAppBlock = schema.blocks.some(
                        (b: { type: string }) => b.type === "@app"
                    );
                }
            }
            return acceptsAppBlock ? file : null;
        })
        .filter((section: string | null) => section);

    if (
        jsonTemplateData.length > 0 &&
        jsonTemplateData.length === sectionsWithAppBlock.length
    ) {
        console.log(
            "All desired templates have main sections that support app blocks!"
        );
    } else if (sectionsWithAppBlock.length) {
        console.log("Only some of the desired templates support app blocks.");
    } else {
        console.log("None of the desired templates support app blocks");
    }

    return true;
}

interface ThemeBlockInfo {
    type: string;
    disabled?: boolean;
    settings?: Record<string, unknown>;
}

/**
 * Check if the current shop theme has the Frak app activated
 */
export async function doesThemeHasFrakActivated({
    admin: { graphql },
}: AuthenticatedContext) {
    // Get the main theme id
    const { gid } = await getMainThemeId(graphql);

    // Retrieve the JSON templates that we want to integrate with
    const jsonTemplateData = await getTemplateFiles(graphql, gid, [
        "config/settings_data.json",
    ]);

    if (
        jsonTemplateData.length <= 0 ||
        !jsonTemplateData?.[0]?.body?.current?.blocks
    ) {
        return false;
    }

    const typeMatch = "apps/frak/blocks/listener/";
    const embedBlock = Object.entries(
        jsonTemplateData[0].body.current.blocks as Record<
            string,
            ThemeBlockInfo
        >
    ).find(
        ([_id, info]: [string, ThemeBlockInfo]) =>
            info.type.includes(typeMatch) && !info.disabled
    );

    return !!embedBlock;
}

/**
 * Check if the current shop theme has the Frak button in product page
 */
export async function doesThemeHasFrakButton({
    admin: { graphql },
}: AuthenticatedContext) {
    // Get the main theme id
    const { gid } = await getMainThemeId(graphql);

    // Retrieve the JSON templates that we want to integrate with
    const jsonTemplateData = await getTemplateFiles(graphql, gid, [
        "templates/product.json",
    ]);

    // Retrieve the body of JSON templates and find what section is set as `main`
    // Return true if any of the main sections has a block with the frak_referral_button type
    const templateMainSections = jsonTemplateData
        .map((file: ThemeFile) => {
            const main = Object.entries(file.body.sections).find(
                ([id, section]) =>
                    typeof section !== "string"
                        ? id === "main" || section.type.startsWith("main-")
                        : false
            );

            if (main && typeof main[1] !== "string" && main[1].block_order) {
                return main[1].block_order.some((blockId) =>
                    blockId.includes("frak_referral_button")
                );
            }
        })
        .filter((section: string | null) => section);

    return templateMainSections.length > 0;
}
