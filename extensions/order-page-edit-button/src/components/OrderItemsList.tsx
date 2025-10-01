import {
    BlockStack,
    InlineStack,
    InlineLayout,
    TextBlock,
    TextField,
    Image,
    View, ProductThumbnail,
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
                        <InlineLayout spacing="base" blockAlignment="center" columns={["auto", "fill", "auto"]}>
                            {/* Product Image */}
                            <View>
                                <ProductThumbnail source={item.image?.url} badge={item.quantity}/>
                            </View>

                            {/* Product Info */}
                            <View>
                                <BlockStack spacing="extraTight">
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
                            </View>

                            {/* Quantity Control */}
                            <View>
                                <BlockStack spacing="extraTight" minInlineSize={70}>
                                    <TextField
                                        label="Quantity"
                                        value={quantities[item.id]?.toString() || item.quantity.toString()}
                                        onChange={(value) => onQuantityChange(item.id, value)}
                                        type="number"
                                        min={0}
                                    />
                                </BlockStack>
                            </View>
                        </InlineLayout>
                    </BlockStack>
                ))}
            </BlockStack>
        </BlockStack>
    );
}
