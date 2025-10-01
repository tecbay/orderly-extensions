import {
    Button,
    CustomerAccountAction,
    reactExtension,
    useApi,
    Form,
    BlockStack,
    TextBlock,
    Banner,
    Spinner
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";
import { OrderData, VariantWithProduct } from "./types";
import { useOrderData } from "./hooks/useOrderData";
import { OrderItemsList } from "./components/OrderItemsList";
import { ProductSearchModal } from "./components/ProductSearchModal";

export default reactExtension(
    "customer-account.order.action.render",
    (api) => <OrderEditModal orderId={api.orderId}/>
);

function OrderEditModal({orderId}: { orderId: string }) {
    const {close} = useApi<"customer-account.order.action.render">();
    const {
        orderData,
        quantities,
        setQuantities,
        isLoading,
        error
    } = useOrderData(orderId);

    const [isSaving, setIsSaving] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);

    // Handle quantity changes
    const handleQuantityChange = (lineItemId: string, newQuantity: string) => {
        const quantity = parseInt(newQuantity) || 0;
        setQuantities(prev => ({
            ...prev,
            [lineItemId]: Math.max(0, quantity) // Ensure non-negative
        }));
    };

    // Handle variant selection from search
    const handleVariantSelect = (variant: VariantWithProduct, quantity: number) => {
        console.log('Variant selected:', {
            variantId: variant.variantId,
            variantTitle: variant.variantTitle,
            productTitle: variant.productTitle,
            price: variant.price,
            sku: variant.sku,
            quantity: quantity
        });
        // TODO: Add logic to add variant to order
        if (quantity > 0) {
            // Only close if quantity is selected
            setShowProductSearch(false);
        }
    };

    // Handle form submission
    async function onSubmit() {
        setIsSaving(true);
        try {
            // Here you would typically make an API call to update the order
            // For now, we'll simulate the process
            console.log('Updating order with new quantities:', quantities);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            close();
        } catch (err) {
            console.error('Error updating order:', err);
        } finally {
            setIsSaving(false);
        }
    }

    // Check if any quantities have changed
    const hasChanges = orderData?.lineItems.nodes.some(item =>
        quantities[item.id] !== item.quantity
    ) ?? false;

    if (isLoading) {
        return (
            <CustomerAccountAction title="Loading Order Details...">
                <BlockStack spacing="base">
                    <Spinner/>
                    <TextBlock>Loading order information...</TextBlock>
                </BlockStack>
            </CustomerAccountAction>
        );
    }

    if (error || !orderData) {
        return (
            <CustomerAccountAction
                title="Error"
                secondaryAction={
                    <Button onPress={close}>
                        Close
                    </Button>
                }
            >
                <Banner status="critical">
                    {error || 'Failed to load order details'}
                </Banner>
            </CustomerAccountAction>
        );
    }

    // Show product search modal if active
    if (showProductSearch) {
        return (
            <CustomerAccountAction
                title="Add Product"
                secondaryAction={
                    <Button onPress={() => setShowProductSearch(false)}>
                        Back
                    </Button>
                }
            >
                <ProductSearchModal
                    onVariantSelect={handleVariantSelect}
                    onClose={() => setShowProductSearch(false)}
                />
            </CustomerAccountAction>
        );
    }

    return (
        <CustomerAccountAction
            title={`Edit Order ${orderData.name}`}
            primaryAction={
                <Button
                    loading={isSaving}
                    onPress={onSubmit}
                    disabled={!hasChanges}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            }
            secondaryAction={
                <Button onPress={close}>
                    Cancel
                </Button>
            }
        >
            <Form onSubmit={onSubmit}>
                <BlockStack spacing="base">
                    <TextBlock size="large">
                        Order Total: {orderData.totalPrice.amount} {orderData.totalPrice.currencyCode}
                    </TextBlock>

                    {orderData.subtotal && (
                        <TextBlock size="small">
                            Subtotal: {orderData.subtotal.amount} {orderData.subtotal.currencyCode}
                        </TextBlock>
                    )}

                    {orderData.totalTax && (
                        <TextBlock size="small">
                            Tax: {orderData.totalTax.amount} {orderData.totalTax.currencyCode}
                        </TextBlock>
                    )}

                    <OrderItemsList
                        items={orderData.lineItems.nodes}
                        quantities={quantities}
                        onQuantityChange={handleQuantityChange}
                    />

                    <Button onPress={() => setShowProductSearch(true)}>
                        Add Product
                    </Button>

                    {hasChanges && (
                        <Banner status="info">
                            You have unsaved changes. Click "Save Changes" to update the order.
                        </Banner>
                    )}
                </BlockStack>
            </Form>
        </CustomerAccountAction>
    );
}