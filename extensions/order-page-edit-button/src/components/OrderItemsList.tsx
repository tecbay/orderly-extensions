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
        <BlockStack spacing="base">
            <TextBlock emphasis="bold">Order Items</TextBlock>
            <BlockStack spacing="tight">
                {items.map((item) => (
                    <BlockStack
                        key={item.id}
                        border="base"
                        padding="base"
                        cornerRadius="base"
                    >
                        <InlineStack spacing="base" blockAlignment="center">
                            {/* Product Image */}
                            {item.image?.url ? (
                                <Image
                                    source={item.image.url}
                                    alt={item.image.altText || item.name}
                                    aspectRatio={1}
                                    fit="cover"
                                    width={60}
                                    borderRadius="base"
                                />
                            ) : (
                                <BlockStack
                                    minInlineSize={60}
                                    minBlockSize={60}
                                    border="base"
                                    cornerRadius="base"
                                    blockAlignment="center"
                                    inlineAlignment="center"
                                >
                                    <TextBlock size="small" appearance="subdued">No image</TextBlock>
                                </BlockStack>
                            )}

                            {/* Product Info */}
                            <BlockStack spacing="extraTight" flex={1}>
                                <TextBlock emphasis="bold">
                                    {item.name}
                                </TextBlock>
                                {item.variantTitle && (
                                    <TextBlock size="small" appearance="subdued">
                                        {item.variantTitle}
                                    </TextBlock>
                                )}
                                <TextBlock size="small" appearance="subdued">
                                    {item.price && `${parseFloat(item.price.amount).toFixed(2)} ${item.price.currencyCode}`}
                                    {item.totalPrice && ` • Total: ${parseFloat(item.totalPrice.amount).toFixed(2)} ${item.totalPrice.currencyCode}`}
                                </TextBlock>
                            </BlockStack>

                            {/* Quantity Control */}
                            <BlockStack spacing="extraTight" minInlineSize={70}>
                                <TextBlock size="small" appearance="subdued">Qty</TextBlock>
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
            </BlockStack>
        </BlockStack>
    );
}