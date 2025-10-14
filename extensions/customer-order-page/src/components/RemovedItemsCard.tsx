import {
    Card,
    BlockStack,
    Heading,
    Divider,
    TextBlock
} from "@shopify/ui-extensions-react/customer-account";
import { LineItemRow } from "./LineItemRow";

interface RemovedItemsCardProps {
    lineItems: any[];
    quantities: Record<string, number>;
}

export function RemovedItemsCard({
    lineItems,
    quantities
}: RemovedItemsCardProps) {
    // Don't render the card if there are no removed items
    if (lineItems.length === 0) {
        return null;
    }

    return (
        <Card padding={'100'}>
            <BlockStack spacing="base">
                <Heading level={3}>Removed Items</Heading>
                <TextBlock appearance="subdued" size="small">
                    These items were previously removed from the order
                </TextBlock>
                <Divider/>

                <BlockStack spacing="base">
                    {lineItems.map((item: any) => (
                        <LineItemRow
                            key={item.id}
                            item={item}
                            quantity={quantities[item.id] !== undefined ? quantities[item.id] : item.currentQuantity}
                            onQuantityChange={() => {}} // No-op for removed items
                            onRemove={() => {}} // No-op for removed items
                            disabled={true} // Always disabled
                        />
                    ))}
                </BlockStack>
            </BlockStack>
        </Card>
    );
}
