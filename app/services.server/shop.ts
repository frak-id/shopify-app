import type { AuthenticatedContext } from "app/types/context";

type ShopInfoReturnType = {
    id: string;
    name: string;
    url: string;
    myshopifyDomain: string;
    primaryDomain: {
        id: string;
        host: string;
        url: string;
    };
    domain: string;
};

/**
 * Get the shop name and url
 */
export async function shopInfo({
    admin: { graphql },
}: AuthenticatedContext): Promise<ShopInfoReturnType> {
    const response = await graphql(`
query shopInfo {
  shop {
    id
    name
    url
    myshopifyDomain
    primaryDomain { id, host, url }
  }
}`);
    const {
        data: { shop },
    } = await response.json();

    return {
        ...shop,
        domain: shop.primaryDomain?.host ?? shop.myshopifyDomain,
    };
}

export type FirstProductPublishedReturnType = {
    handle: string;
};

/**
 * Get the first product published
 */
export async function firstProductPublished({
    admin: { graphql },
}: AuthenticatedContext): Promise<FirstProductPublishedReturnType> {
    const response = await graphql(`
query GetFirstPublishedProduct {
  products(first: 1, query: "published_status:published") {
    edges {
      node {
        handle
      }
    }
  }
}`);
    const {
        data: { products },
    } = await response.json();

    return products.edges?.[0]?.node;
}
