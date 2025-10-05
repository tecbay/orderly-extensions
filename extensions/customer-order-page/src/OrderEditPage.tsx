import {
    reactExtension,
    Page,
    BlockStack,
    TextBlock,
    InlineStack,
    Button,
    Grid,
    GridItem,
    Heading,
    Divider,
    Banner,
    TextField,
    Modal,
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

    // @ts-ignore
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

    const hasChanges = lineItems.some((item: any) =>
        quantities[item.id] !== item.quantity
    ) || selectedVariants.length > 0;

    return (
        <Page
            subtitle="Edit order"
            title={`Order ${order.current.name}`}
            primaryAction={
                <Button
                    overlay={
                        <Modal
                            id="add-product-modal"
                            padding={false}
                            title="Add Items"
                            primaryAction={
                                <Button kind="primary">
                                    Done ({selectedVariants.length})
                                </Button>
                            }
                        >
                            <BlockStack spacing="none">
                                <BlockStack spacing="base" padding="base" border="base">
                                    <ProductSearchModal
                                        onVariantSelect={handleVariantSelect}
                                        onVariantDelete={handleVariantDelete}
                                        selectedVariants={selectedVariants}
                                        onClose={() => setShowProductSearch(false)}
                                    />
                                </BlockStack>
                            </BlockStack>
                        </Modal>
                    }
                >
                    Add items
                </Button>
            }
            secondaryAction={
                <Button
                    onPress={handleSave}
                    kind={hasChanges ? "primary" : "secondary"}
                    loading={isSaving}
                    disabled={!hasChanges}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            }
        >
            <BlockStack spacing={'base'}>
                {hasChanges && (
                    <Banner status="info">
                        You have unsaved changes.
                    </Banner>
                )}

                {/* Two Column Layout */}
                <Grid columns={['fill', 'fill']} spacing={'base'}>
                    {/* Left Column - Addresses */}
                    <GridItem>
                        <BlockStack spacing={'base'}>
                            {/* Billing Address */}
                            <BlockStack spacing="base" border="base" padding="base">
                                <Heading level={3}>Billing Address</Heading>
                                <Divider/>
                                {billingAddress?.current ? (
                                    <BlockStack spacing="extraTight">
                                        <TextBlock emphasis="bold">
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
                                            <TextBlock appearance="subdued">{billingAddress.current.phone}</TextBlock>
                                        )}
                                    </BlockStack>
                                ) : (
                                    <TextBlock appearance="subdued">No billing address</TextBlock>
                                )}
                            </BlockStack>

                            {/* Shipping Address */}
                            <BlockStack spacing="base" border="base" padding="base">
                                <Heading level={3}>Shipping Address</Heading>
                                <Divider/>
                                {shippingAddress?.current ? (
                                    <BlockStack spacing="extraTight">
                                        <TextBlock emphasis="bold">
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
                                            <TextBlock appearance="subdued">{shippingAddress.current.phone}</TextBlock>
                                        )}
                                    </BlockStack>
                                ) : (
                                    <TextBlock appearance="subdued">No shipping address</TextBlock>
                                )}
                            </BlockStack>
                        </BlockStack>
                    </GridItem>

                    {/* Right Column - Line Items */}
                    <GridItem>
                        <BlockStack spacing={'extraTight'} border="base" padding="base">
                            <Heading level={3}>Order Items</Heading>
                            <Divider/>

                                {/* Line Items List */}
                                <BlockStack spacing="base">
                                    {lineItems.map((item: any) => (
                                        <BlockStack key={item.id} spacing="tight">
                                            <Grid columns={['fill', 'auto']} spacing="base">
                                                <GridItem>
                                                    <BlockStack spacing="extraTight">
                                                        <TextBlock emphasis="bold">
                                                            {item.merchandise?.product?.title || item.title}
                                                        </TextBlock>
                                                        {item.merchandise?.title && (
                                                            <TextBlock appearance="subdued" size="small">
                                                                {item.merchandise.title}
                                                            </TextBlock>
                                                        )}
                                                        <TextBlock size="small" appearance="subdued">
                                                            {item.price?.amount || item.cost?.totalAmount?.amount} {item.price?.currencyCode || item.cost?.totalAmount?.currencyCode}
                                                        </TextBlock>
                                                    </BlockStack>
                                                </GridItem>
                                                <GridItem>
                                                    <TextField
                                                        label="Qty"
                                                        type="number"
                                                        value={quantities[item.id]?.toString() || item.quantity?.toString() || '0'}
                                                        onChange={(value) => handleQuantityChange(item.id, value)}
                                                    />
                                                </GridItem>
                                            </Grid>
                                            <Divider/>
                                        </BlockStack>
                                    ))}

                                    {/* New variants to add */}
                                    {selectedVariants.map((item, index) => (
                                        <BlockStack key={`new-${index}`} spacing="tight">
                                            <Grid columns={['fill', 'auto', 'auto']} spacing="base">
                                                <GridItem>
                                                    <BlockStack spacing="extraTight">
                                                        <TextBlock emphasis="bold">{item.variant.productTitle}</TextBlock>
                                                        <TextBlock appearance="subdued" size="small">
                                                            {item.variant.variantTitle}
                                                        </TextBlock>
                                                        <TextBlock size="small" appearance="subdued">
                                                            {item.variant.price.amount} {item.variant.price.currencyCode}
                                                        </TextBlock>
                                                        <Banner status="success">New</Banner>
                                                    </BlockStack>
                                                </GridItem>
                                                <GridItem>
                                                    <TextBlock>Qty: {item.quantity}</TextBlock>
                                                </GridItem>
                                                <GridItem>
                                                    <Button
                                                        kind="plain"
                                                        onPress={() => handleVariantDelete(item.variant.variantId)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </GridItem>
                                            </Grid>
                                            <Divider/>
                                        </BlockStack>
                                    ))}
                                </BlockStack>

                                {/* Order Summary */}
                                <BlockStack spacing="base" border="base" padding="base">
                                    {order?.current?.subtotal && (
                                        <InlineStack spacing="between">
                                            <TextBlock>Subtotal</TextBlock>
                                            <TextBlock>
                                                {order.current.subtotal.amount} {order.current.subtotal.currencyCode}
                                            </TextBlock>
                                        </InlineStack>
                                    )}
                                    {order?.current?.totalTax && (
                                        <InlineStack spacing={'base'}>
                                            <TextBlock>Tax</TextBlock>
                                            <TextBlock>
                                                {order.current.totalTax.amount} {order.current.totalTax.currencyCode}
                                            </TextBlock>
                                        </InlineStack>
                                    )}
                                    <Divider/>
                                    {order?.current?.totalPrice && (
                                        <InlineStack spacing={'base'}>
                                            <TextBlock emphasis="bold" size="large">Total</TextBlock>
                                            <TextBlock emphasis="bold" size="large">
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
