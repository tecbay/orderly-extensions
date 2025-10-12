import {
    Card,
    BlockStack,
    Heading,
    Divider,
    Grid,
    GridItem,
    TextBlock,
    InlineStack,
    Badge
} from "@shopify/ui-extensions-react/customer-account";

interface OrderTotal {
    amount: string;
    currencyCode: string;
}

interface OrderSummaryCardProps {
    subtotal: OrderTotal;
    tax: OrderTotal;
    total: OrderTotal;
    financialStatus?: string | null;
    fulfillmentStatus?: string | null;
}

function getFinancialStatusBadge(status: string | null) {
    if (!status) return null;

    const statusMap: Record<string, { label: string; tone: 'info' | 'success' | 'critical' | 'attention' }> = {
        'PENDING': { label: 'Pending', tone: 'attention' },
        'AUTHORIZED': { label: 'Authorized', tone: 'info' },
        'PARTIALLY_PAID': { label: 'Partially Paid', tone: 'attention' },
        'PAID': { label: 'Paid', tone: 'success' },
        'PARTIALLY_REFUNDED': { label: 'Partially Refunded', tone: 'attention' },
        'REFUNDED': { label: 'Refunded', tone: 'info' },
        'VOIDED': { label: 'Voided', tone: 'info' },
    };

    const statusInfo = statusMap[status.toUpperCase()] || { label: status, tone: 'info' as const };
    return <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>;
}

function getFulfillmentStatusBadge(status: string | null) {
    if (!status) return null;

    const statusMap: Record<string, { label: string; tone: 'info' | 'success' | 'critical' | 'attention' }> = {
        'UNFULFILLED': { label: 'Unfulfilled', tone: 'attention' },
        'PARTIALLY_FULFILLED': { label: 'Partially Fulfilled', tone: 'info' },
        'FULFILLED': { label: 'Fulfilled', tone: 'success' },
        'RESTOCKED': { label: 'Restocked', tone: 'info' },
        'PENDING_FULFILLMENT': { label: 'Pending', tone: 'attention' },
        'OPEN': { label: 'Open', tone: 'info' },
        'IN_PROGRESS': { label: 'In Progress', tone: 'info' },
        'ON_HOLD': { label: 'On Hold', tone: 'attention' },
        'SCHEDULED': { label: 'Scheduled', tone: 'info' },
    };

    const statusInfo = statusMap[status.toUpperCase()] || { label: status, tone: 'info' as const };
    return <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>;
}

export function OrderSummaryCard({ subtotal, tax, total, financialStatus, fulfillmentStatus }: OrderSummaryCardProps) {
    return (
        <Card padding={'100'}>
            <BlockStack spacing="base">
                <BlockStack spacing="extraTight">
                    <Heading level={3}>Order Summary</Heading>
                    {(financialStatus || fulfillmentStatus) && (
                        <InlineStack spacing="extraTight">
                            {getFinancialStatusBadge(financialStatus)}
                            {getFulfillmentStatusBadge(fulfillmentStatus)}
                        </InlineStack>
                    )}
                </BlockStack>
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
