import {
    Card,
    BlockStack,
    Heading,
    Divider,
    Grid,
    GridItem,
    TextBlock
} from "@shopify/ui-extensions-react/customer-account";

interface OrderTotal {
    amount: string;
    currencyCode: string;
}

interface OrderSummaryCardProps {
    subtotal: OrderTotal;
    tax: OrderTotal;
    total: OrderTotal;
}

export function OrderSummaryCard({ subtotal, tax, total }: OrderSummaryCardProps) {
    return (
        <Card padding={'100'}>
            <BlockStack spacing="base">
                <Heading level={3}>Order Summary</Heading>
                <Divider/>
                <BlockStack spacing="tight">
                    <Grid columns={['fill', 'auto']} spacing="base">
                        <GridItem>
                            <TextBlock>Subtotal</TextBlock>
                        </GridItem>
                        <GridItem>
                            <TextBlock>
                                {subtotal.amount} {subtotal.currencyCode}
                            </TextBlock>
                        </GridItem>
                    </Grid>
                    <Grid columns={['fill', 'auto']} spacing="base">
                        <GridItem>
                            <TextBlock>Tax</TextBlock>
                        </GridItem>
                        <GridItem>
                            <TextBlock>
                                {tax.amount} {tax.currencyCode}
                            </TextBlock>
                        </GridItem>
                    </Grid>
                </BlockStack>
                <Divider/>
                <Grid columns={['fill', 'auto']} spacing="base">
                    <GridItem>
                        <TextBlock emphasis="bold" size="large">Total</TextBlock>
                    </GridItem>
                    <GridItem>
                        <TextBlock emphasis="bold" size="large">
                            {total.amount} {total.currencyCode}
                        </TextBlock>
                    </GridItem>
                </Grid>
            </BlockStack>
        </Card>
    );
}
