import { Card, Layout, SkeletonBodyText, SkeletonPage } from "@shopify/polaris";

export function Skeleton() {
    return (
        <SkeletonPage>
            <Layout>
                <Layout.Section>
                    <Card>
                        <SkeletonBodyText lines={5} />
                    </Card>
                </Layout.Section>
            </Layout>
        </SkeletonPage>
    );
}
