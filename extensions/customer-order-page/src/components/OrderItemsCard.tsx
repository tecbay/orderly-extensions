import {
    Card,
    BlockStack,
    Heading,
    Divider,
    Button,
    Modal
} from "@shopify/ui-extensions-react/customer-account";
import { LineItemRow } from "./LineItemRow";
import { VariantWithProduct } from "../../../../extensions/order-edit-button/src/types";

interface OrderItemsCardProps {
    lineItems: any[];
    quantities: Record<string, number>;
    selectedVariants: Array<{ variant: VariantWithProduct; quantity: number }>;
    canEdit: boolean;
    canEditItems: boolean;
    onQuantityChange: (lineItemId: string, value: string) => void;
    onRemoveLineItem: (lineItemId: string) => void;
    onNewVariantQuantityChange: (variantId: string, value: string) => void;
    onRemoveVariant: (variantId: string) => void;
    addItemsModal: React.ReactNode;
    onAddItemsClick?: () => void;
}

export function OrderItemsCard({
    lineItems,
    quantities,
    selectedVariants,
    canEdit,
    canEditItems,
    onQuantityChange,
    onRemoveLineItem,
    onNewVariantQuantityChange,
    onRemoveVariant,
    addItemsModal,
    onAddItemsClick
}: OrderItemsCardProps) {
    return (
        <Card padding={'100'}>
            <BlockStack spacing="base">
                <Heading level={3}>Order Items</Heading>
                <Divider/>

                {/* Existing Line Items */}
                <BlockStack spacing="base">
                    {lineItems.map((item: any) => (
                        <LineItemRow
                            key={item.id}
                            item={item}
                            quantity={quantities[item.id] || item.quantity || 0}
                            onQuantityChange={(value) => onQuantityChange(item.id, value)}
                            onRemove={() => onRemoveLineItem(item.id)}
                            disabled={!canEdit || !canEditItems}
                        />
                    ))}

                    {/* New variants to add */}
                    {selectedVariants.map((item, index) => (
                        <LineItemRow
                            key={`new-${index}`}
                            item={item}
                            quantity={item.quantity}
                            onQuantityChange={(value) => onNewVariantQuantityChange(item.variant.variantId, value)}
                            onRemove={() => onRemoveVariant(item.variant.variantId)}
                            disabled={!canEdit || !canEditItems}
                            isNew={true}
                        />
                    ))}
                </BlockStack>

                {/* Add Items Button */}
                {canEdit && canEditItems && (
                    <Button
                        kind={'primary'}
                        appearance={'monochrome'}
                        overlay={addItemsModal}
                        onPress={onAddItemsClick}
                    >
                        Add items
                    </Button>
                )}
            </BlockStack>
        </Card>
    );
}
