import { Card, SkeletonBodyText, SkeletonPage } from "@shopify/polaris";
import { Layout } from "@shopify/polaris";

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
