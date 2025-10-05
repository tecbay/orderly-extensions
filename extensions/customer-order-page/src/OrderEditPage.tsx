import {
    reactExtension,
    Page,
    BlockStack,
    TextBlock,
    useOrder,
    InlineStack,
    Button,
    Grid,
    GridItem,
    Heading,
    Divider,
    Banner,
    TextField, Modal, Link,
} from "@shopify/ui-extensions-react/customer-account";
import {useState} from "react";
import {VariantWithProduct} from "../../../extensions/order-edit-button/src/types";
import {ProductSearchModal} from "../../../extensions/order-edit-button/src/components/ProductSearchModal";

export default reactExtension("customer-account.order.page.render",
    (api) => <OrderPage api={api}/>);

function OrderPage({api}) {
    const {order, lines, billingAddress, shippingAddress, buyerIdentity} = api;
    console.log('order', order);
    console.log('lines', lines);
    console.log('billingAddress', billingAddress);
    console.log('shippingAddress', shippingAddress);

    const [showProductSearch, setShowProductSearch] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState<Array<{ variant: VariantWithProduct; quantity: number }>>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Get current lines array from the lines object
    const lineItems = lines?.current || [];

    // Initialize quantities from lines (only once)
    if (lineItems.length > 0 && Object.keys(quantities).length === 0) {
        const initialQuantities: Record<string, number> = {};
        lineItems.forEach((item: any) => {
            initialQuantities[item.id] = item.quantity;
        });
        if (Object.keys(initialQuantities).length > 0) {
            setQuantities(initialQuantities);
        }
    }

    const handleQuantityChange = (lineItemId: string, newQuantity: string) => {
        const quantity = parseInt(newQuantity) || 0;
        setQuantities(prev => ({
            ...prev,
            [lineItemId]: Math.max(0, quantity)
        }));
    };

    const handleVariantSelect = (variant: VariantWithProduct, quantity: number) => {
        console.log('Variant selected:', {
            variantId: variant.variantId,
            variantTitle: variant.variantTitle,
            productTitle: variant.productTitle,
            price: variant.price,
            sku: variant.sku,
            quantity: quantity
        });

        setSelectedVariants(prev => [...prev, {variant, quantity}]);
    };

    const handleVariantDelete = (variantId: string) => {
        setSelectedVariants(prev => prev.filter(item => item.variant.variantId !== variantId));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log('Saving order with quantities:', quantities);
            console.log('New variants:', selectedVariants);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message or redirect
        } catch (err) {
            console.error('Error saving order:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!order) {
        return (
            <Page title="Loading...">
                <TextBlock>Loading order...</TextBlock>
            </Page>
        );
    }

    if (showProductSearch) {
        return (
            <Page title="Add Products">
                <BlockStack spacing="base">
                    <InlineStack spacing="base">
                        <Button onPress={() => setShowProductSearch(false)}>
                            ← Back to Order
                        </Button>
                        <Button
                            onPress={() => setShowProductSearch(false)}
                            disabled={selectedVariants.length === 0}
                        >
                            Done ({selectedVariants.length})
                        </Button>
                    </InlineStack>

                    <ProductSearchModal
                        onVariantSelect={handleVariantSelect}
                        onVariantDelete={handleVariantDelete}
                        selectedVariants={selectedVariants}
                        onClose={() => setShowProductSearch(false)}
                    />
                </BlockStack>
            </Page>
        );
    }

    const hasChanges = lineItems.some((item: any) =>
        quantities[item.id] !== item.quantity
    ) || selectedVariants.length > 0;

    return (
        <Page
            title={`Order ${order.current.name}`}
            primaryAction={
                <Button
                    overlay={
                        <Modal
                            id="my-modal"
                            padding
                            title="Add Items"
                        >
                            // Product search should go here
                        </Modal>
                    }
                >
                    Add items
                </Button>

            }
        >
            <BlockStack spacing="base">
                {/* Header with Save button */}
                <InlineStack spacing="base" blockAlignment="center">
                    <Heading level={2}>Order Details</Heading>
                    <Button
                        onPress={handleSave}
                        loading={isSaving}
                        disabled={!hasChanges}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </InlineStack>

                {hasChanges && (
                    <Banner status="info">
                        You have unsaved changes.
                    </Banner>
                )}

                <Divider/>

                {/* Two Column Layout */}
                <Grid columns={['fill', 'fill']} spacing="base">
                    {/* Left Column - Addresses */}
                    <GridItem>
                        <BlockStack spacing="base">
                            {/* Billing Address */}
                            <BlockStack spacing="tight">
                                <Heading level={3}>Billing Address</Heading>
                                <Divider/>
                                {billingAddress?.current ? (
                                    <BlockStack spacing="extraTight">
                                        <TextBlock>
                                            {billingAddress.current.firstName} {billingAddress.current.lastName}
                                        </TextBlock>
                                        <TextBlock>{billingAddress.current.address1 || ''}</TextBlock>
                                        {billingAddress.current.address2 && (
                                            <TextBlock>{billingAddress.current.address2}</TextBlock>
                                        )}
                                        <TextBlock>
                                            {billingAddress.current.city}, {billingAddress.current.provinceCode} {billingAddress.current.zip}
                                        </TextBlock>
                                        <TextBlock>{billingAddress.current.countryCode}</TextBlock>
                                        {billingAddress.current.phone && (
                                            <TextBlock>{billingAddress.current.phone}</TextBlock>
                                        )}
                                    </BlockStack>
                                ) : (
                                    <TextBlock>No billing address</TextBlock>
                                )}
                            </BlockStack>

                            {/* Shipping Address */}
                            <BlockStack spacing="tight">
                                <Heading level={3}>Shipping Address</Heading>
                                <Divider/>
                                {shippingAddress?.current ? (
                                    <BlockStack spacing="extraTight">
                                        <TextBlock>
                                            {shippingAddress.current.firstName} {shippingAddress.current.lastName}
                                        </TextBlock>
                                        <TextBlock>{shippingAddress.current.address1 || ''}</TextBlock>
                                        {shippingAddress.current.address2 && (
                                            <TextBlock>{shippingAddress.current.address2}</TextBlock>
                                        )}
                                        <TextBlock>
                                            {shippingAddress.current.city}, {shippingAddress.current.provinceCode} {shippingAddress.current.zip}
                                        </TextBlock>
                                        <TextBlock>{shippingAddress.current.countryCode}</TextBlock>
                                        {shippingAddress.current.phone && (
                                            <TextBlock>{shippingAddress.current.phone}</TextBlock>
                                        )}
                                    </BlockStack>
                                ) : (
                                    <TextBlock>No shipping address</TextBlock>
                                )}
                            </BlockStack>
                        </BlockStack>
                    </GridItem>

                    {/* Right Column - Line Items */}
                    <GridItem>
                        <BlockStack spacing="base">
                            <InlineStack spacing="base" blockAlignment="center">
                                <Heading level={3}>Order Items</Heading>
                            </InlineStack>
                            <Divider/>

                            {/* Line Items List */}
                            <BlockStack spacing="base">
                                {lineItems.map((item: any) => (
                                    <BlockStack key={item.id} spacing="tight">
                                        <InlineStack spacing="base" blockAlignment="center">
                                            <BlockStack spacing="extraTight">
                                                <TextBlock>{item.merchandise?.product?.title || item.title}</TextBlock>
                                                {item.merchandise?.title && (
                                                    <TextBlock appearance="subdued" size="small">
                                                        {item.merchandise.title}
                                                    </TextBlock>
                                                )}
                                                <TextBlock size="small">
                                                    Price: {item.price?.amount || item.cost?.totalAmount?.amount} {item.price?.currencyCode || item.cost?.totalAmount?.currencyCode}
                                                </TextBlock>
                                            </BlockStack>
                                            <TextField
                                                label="Quantity"
                                                type="number"
                                                value={quantities[item.id]?.toString() || item.quantity?.toString() || '0'}
                                                onChange={(value) => handleQuantityChange(item.id, value)}
                                            />
                                        </InlineStack>
                                        <Divider/>
                                    </BlockStack>
                                ))}

                                {/* New variants to add */}
                                {selectedVariants.map((item, index) => (
                                    <BlockStack key={`new-${index}`} spacing="tight">
                                        <InlineStack spacing="base" blockAlignment="center">
                                            <BlockStack spacing="extraTight">
                                                <TextBlock>{item.variant.productTitle}</TextBlock>
                                                <TextBlock appearance="subdued" size="small">
                                                    {item.variant.variantTitle}
                                                </TextBlock>
                                                <TextBlock size="small">
                                                    Price: {item.variant.price.amount} {item.variant.price.currencyCode}
                                                </TextBlock>
                                                <Banner status="info">New Item</Banner>
                                            </BlockStack>
                                            <TextBlock>Qty: {item.quantity}</TextBlock>
                                            <Button onPress={() => handleVariantDelete(item.variant.variantId)}>
                                                Remove
                                            </Button>
                                        </InlineStack>
                                        <Divider/>
                                    </BlockStack>
                                ))}
                            </BlockStack>

                            {/* Order Summary */}
                            <BlockStack spacing="tight">
                                <Divider/>
                                {order?.current?.subtotal && (
                                    <InlineStack spacing="between">
                                        <TextBlock>Subtotal:</TextBlock>
                                        <TextBlock>
                                            {order.current.subtotal.amount} {order.current.subtotal.currencyCode}
                                        </TextBlock>
                                    </InlineStack>
                                )}
                                {order?.current?.totalTax && (
                                    <InlineStack spacing="between">
                                        <TextBlock>Tax:</TextBlock>
                                        <TextBlock>
                                            {order.current.totalTax.amount} {order.current.totalTax.currencyCode}
                                        </TextBlock>
                                    </InlineStack>
                                )}
                                {order?.current?.totalPrice && (
                                    <InlineStack spacing="between">
                                        <TextBlock size="large">Total:</TextBlock>
                                        <TextBlock size="large">
                                            {order.current.totalPrice.amount} {order.current.totalPrice.currencyCode}
                                        </TextBlock>
                                    </InlineStack>
                                )}
                            </BlockStack>
                        </BlockStack>
                    </GridItem>
                </Grid>
            </BlockStack>

        </Page>
    );
}
