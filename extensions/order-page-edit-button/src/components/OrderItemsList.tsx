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
            <TextBlock emphasis="bold" size="medium">Order Items</TextBlock>
            <BlockStack spacing="base">
                {items.map((item) => (
                    <BlockStack
                        key={item.id}
                        border="base"
                        padding="base"
                        cornerRadius="base"
                    >
                        <InlineStack spacing="base" blockAlignment="center">
                            {/* Product Image */}
                            <BlockStack>
                                {item.image?.url ? (
                                    <Image
                                        source={item.image.url}
                                        alt={item.image.altText || item.name}
                                        aspectRatio={1}
                                        fit="cover"
                                        width={80}
                                        borderRadius="base"
                                    />
                                ) : (
                                    <BlockStack
                                        padding="large"
                                        border="base"
                                        cornerRadius="base"
                                        blockAlignment="center"
                                        inlineAlignment="center"
                                    >
                                        <TextBlock size="small">No image</TextBlock>
                                    </BlockStack>
                                )}
                            </BlockStack>

                            {/* Product Info */}
                            <BlockStack spacing="extraTight" flex={1}>
                                <TextBlock emphasis="bold" size="medium">
                                    {item.name}
                                </TextBlock>
                                {item.variantTitle && (
                                    <TextBlock size="small" appearance="subdued">
                                        {item.variantTitle}
                                    </TextBlock>
                                )}
                                <InlineStack spacing="base">
                                    {item.price && (
                                        <TextBlock size="base" appearance="subdued">
                                            {parseFloat(item.price.amount).toFixed(2)} {item.price.currencyCode}
                                        </TextBlock>
                                    )}
                                    {item.totalPrice && (
                                        <TextBlock size="base" emphasis="bold">
                                            Total: {parseFloat(item.totalPrice.amount).toFixed(2)} {item.totalPrice.currencyCode}
                                        </TextBlock>
                                    )}
                                </InlineStack>
                            </BlockStack>

                            {/* Quantity Control */}
                            <BlockStack spacing="extraTight" minInlineSize={80}>
                                <TextBlock size="small" emphasis="bold">Quantity</TextBlock>
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