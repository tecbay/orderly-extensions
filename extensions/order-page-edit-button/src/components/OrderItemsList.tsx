import {
    BlockStack,
    InlineStack,
    TextBlock,
    TextField,
    Image,
} from "@shopify/ui-extensions-react/customer-account";
import { LineItem } from "../types";

interface OrderItemsListProps {
    items: LineItem[];
    quantities: Record<string, number>;
    onQuantityChange: (lineItemId: string, newQuantity: string) => void;
}

export function OrderItemsList({ items, quantities, onQuantityChange }: OrderItemsListProps) {
    return (
        <>
            <TextBlock emphasis="bold">Order Items:</TextBlock>
            {items.map((item) => (
                <BlockStack key={item.id} spacing="tight" border="base" padding="base">
                    <InlineStack spacing="base" blockAlignment="center">
                        {item.image?.url && (
                            <Image
                                source={item.image.url}
                                alt={item.image.altText || item.name}
                                aspectRatio={1}
                                fit="cover"
                                width={60}
                            />
                        )}

                        <BlockStack spacing="tight" flex={1}>
                            <TextBlock emphasis="bold">{item.name}</TextBlock>
                            {item.variantTitle && (
                                <TextBlock size="small">{item.variantTitle}</TextBlock>
                            )}
                            {item.totalPrice && (
                                <TextBlock size="small">
                                    Total: {item.totalPrice.amount} {item.totalPrice.currencyCode}
                                </TextBlock>
                            )}
                            {item.price && (
                                <TextBlock size="small">
                                    Unit Price: {item.price.amount} {item.price.currencyCode}
                                </TextBlock>
                            )}
                        </BlockStack>

                        <BlockStack spacing="tight">
                            <TextBlock size="small">Quantity:</TextBlock>
                            <TextField
                                label="Quantity"
                                value={quantities[item.id]?.toString() || item.quantity.toString()}
                                onChange={(value) => onQuantityChange(item.id, value)}
                                type="number"
                                min={0}
                            />
                        </BlockStack>
                    </InlineStack>
                </BlockStack>
            ))}
        </>
    );
}