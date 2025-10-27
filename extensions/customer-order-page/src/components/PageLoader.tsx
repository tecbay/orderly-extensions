import {BlockStack, Card, Grid, GridItem, Page, SkeletonText} from "@shopify/ui-extensions-react/customer-account";

export default function PageLoader() {
    return (
        <Page title="Loading...">
            <BlockStack spacing={'base'}>
                {/* Two Column Layout - Responsive */}
                <Grid
                    columns={{
                        default: ['fill'],
                        conditionals: [{
                            conditions: {viewportInlineSize: {min: 'medium'}},
                            value: ['fill', 'fill']
                        }]
                    }}
                    spacing='base'
                    rows='auto'
                >
                    {/* Left Column - Address Skeletons */}
                    <GridItem>
                        <BlockStack
                            spacing={{
                                default: 'none',
                                conditionals: [{
                                    conditions: {viewportInlineSize: {min: 'medium'}},
                                    value: 'base'
                                }]
                            }}
                        >
                            <Card padding={true}>
                                <BlockStack spacing="base">
                                    <SkeletonText size="large"/>
                                    <SkeletonText/>
                                    <SkeletonText/>
                                    <SkeletonText/>
                                </BlockStack>
                            </Card>
                            <Card padding={true}>
                                <BlockStack spacing="base">
                                    <SkeletonText size="large"/>
                                    <SkeletonText/>
                                    <SkeletonText/>
                                    <SkeletonText/>
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </GridItem>

                    {/* Right Column - Order Items Skeleton */}
                    <GridItem>
                        <BlockStack
                            spacing={{
                                default: 'none',
                                conditionals: [{
                                    conditions: {viewportInlineSize: {min: 'medium'}},
                                    value: 'base'
                                }]
                            }}
                        >
                            <Card padding={true}>
                                <BlockStack spacing="base">
                                    <SkeletonText size="large"/>
                                    <SkeletonText/>
                                    <SkeletonText/>
                                    <SkeletonText/>
                                    <SkeletonText/>
                                </BlockStack>
                            </Card>
                            <Card padding={true}>
                                <BlockStack spacing="base">
                                    <SkeletonText size="large"/>
                                    <SkeletonText/>
                                    <SkeletonText/>
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </GridItem>
                </Grid>
            </BlockStack>
        </Page>
    )
}
