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
    Card
} from "@shopify/ui-extensions-react/customer-account";
import {useState} from "react";
import {VariantWithProduct} from "../../../extensions/order-edit-button/src/types";
import {ProductSearchModal} from "../../../extensions/order-edit-button/src/components/ProductSearchModal";

export default reactExtension("customer-account.order.page.render",
    (api) => <OrderPage api={api}/>);

function OrderPage({api}) {
    const {order, lines, billingAddress, shippingAddress, buyerIdentity, cost} = api;
    console.log('order', order);
    console.log('lines', lines);
    console.log('billingAddress', billingAddress);
    console.log('shippingAddress', shippingAddress);
    console.log('cost', cost);

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

    // Calculate updated totals based on current quantities
    const calculateUpdatedTotals = () => {
        const currencyCode = cost?.subtotalAmount?.current?.currencyCode || 'BDT';

        // Calculate subtotal from existing items with updated quantities
        let newSubtotal = 0;
        lineItems.forEach((item: any) => {
            const itemPrice = parseFloat(item.price?.amount || item.cost?.totalAmount?.amount || 0);
            const itemQuantity = quantities[item.id] || item.quantity || 0;
            newSubtotal += itemPrice * itemQuantity;
        });

        // Add new variants to subtotal
        selectedVariants.forEach((item) => {
            const variantPrice = parseFloat(item.variant.price.amount || 0);
            newSubtotal += variantPrice * item.quantity;
        });

        // Calculate tax proportionally based on original tax rate
        const originalSubtotal = parseFloat(cost?.subtotalAmount?.current?.amount || 0);
        const originalTax = parseFloat(cost?.totalTaxAmount?.current?.amount || 0);
        const taxRate = originalSubtotal > 0 ? originalTax / originalSubtotal : 0;
        const newTax = newSubtotal * taxRate;

        // Calculate total
        const newTotal = newSubtotal + newTax;

        return {
            subtotal: {amount: newSubtotal.toFixed(2), currencyCode},
            tax: {amount: newTax.toFixed(2), currencyCode},
            total: {amount: newTotal.toFixed(2), currencyCode}
        };
    };

    const updatedTotals = calculateUpdatedTotals();

    return (
        <Page
            subtitle="Edit order"
            title={`Order ${order.current.name}`}
            primaryAction={
                hasChanges && <Button
                    onPress={handleSave}
                    kind={hasChanges ? "primary" : "secondary"}
                    loading={isSaving}
                    disabled={!hasChanges}
                >
                    {isSaving ? 'Updating...' : 'Update'}
                </Button>
            }
        >
            {/*<BlockStack minBlockSize={hasChanges ? undefined : 0}>*/}
            {/*    {hasChanges && (*/}
            <Banner status={hasChanges ? 'warning' : 'info'}>
                {hasChanges ? 'You have unsaved changes.' : 'You can update you until 12:12 pm'}
            </Banner>
            {/*)}*/}
            {/*</BlockStack>*/}

            <BlockStack spacing={'base'}>
                {/* Banner container - always present to prevent layout jump */}


                {/* Two Column Layout */}
                <Grid columns={['fill', 'fill']} spacing={'base'}>
                    {/* Left Column - Addresses */}
                    <GridItem>
                        <BlockStack spacing={'base'}>
                            {/* Billing Address */}
                            <Card padding={'100'}>
                                <BlockStack spacing="base">
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
                            </Card>

                            {/* Shipping Address */}
                            <Card padding={'100'}>
                                <BlockStack spacing="base">
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
                            </Card>
                        </BlockStack>
                    </GridItem>

                    {/* Right Column - Line Items */}
                    <GridItem>
                        <BlockStack spacing={'base'}>
                            <Card padding={'100'}>
                                <BlockStack spacing="base">
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

                                    {/* Add Items Button */}
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
                                </BlockStack>
                            </Card>

                            {/* Order Summary */}
                            <Card padding={'100'}>
                                <BlockStack spacing="base">
                                    <Heading level={3}>Order Summary</Heading>
                                    <Divider/>
                                    <BlockStack spacing="tight">
                                        <Grid columns={['fill', 'auto']} spacing="base">
                                            <GridItem>
                                                <TextBlock>Subtotal</TextBlock>
                                            </GridItem>
                                            <GridItem>
                                                <TextBlock>
                                                    {updatedTotals.subtotal.amount} {updatedTotals.subtotal.currencyCode}
                                                </TextBlock>
                                            </GridItem>
                                        </Grid>
                                        <Grid columns={['fill', 'auto']} spacing="base">
                                            <GridItem>
                                                <TextBlock>Tax</TextBlock>
                                            </GridItem>
                                            <GridItem>
                                                <TextBlock>
                                                    {updatedTotals.tax.amount} {updatedTotals.tax.currencyCode}
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
                                                {updatedTotals.total.amount} {updatedTotals.total.currencyCode}
                                            </TextBlock>
                                        </GridItem>
                                    </Grid>
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </GridItem>
                </Grid>
            </BlockStack>
        </Page>
    );
}
