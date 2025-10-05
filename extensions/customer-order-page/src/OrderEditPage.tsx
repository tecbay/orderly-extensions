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
    Card,
    Link,
    Badge,
    Icon, ScrollView
} from "@shopify/ui-extensions-react/customer-account";
import {useState} from "react";
import {VariantWithProduct} from "../../../extensions/order-edit-button/src/types";
import {ProductSearchModal} from "../../../extensions/order-edit-button/src/components/ProductSearchModal";

export default reactExtension("customer-account.order.page.render",
    (api) => <OrderPage api={api}/>);

function PrimaryActionButton({hasChanges, allQuantitiesZero, isSaving, handleSave}: {
    hasChanges: boolean;
    allQuantitiesZero: boolean;
    isSaving: boolean;
    handleSave: () => void;
}) {
    if (!hasChanges) return null;

    return (
        <>
            <Button appearance={'critical'} kind={'plain'}>
                Discard
            </Button>
            <Button
                onPress={handleSave}
                kind={"secondary"}
                loading={isSaving}
                disabled={!hasChanges}
            >
                {allQuantitiesZero ? 'Cancel' : 'Update'}
            </Button>
        </>
    );
}

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
    const extractIdFromGid = (gid: string) => {
        const parts = gid.split('/');
        return parts[parts.length - 1];
    };

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

    const handleNewVariantQuantityChange = (variantId: string, newQuantity: string) => {
        const quantity = Math.max(0, parseInt(newQuantity) || 0);
        setSelectedVariants(prev => prev.map(item =>
            item.variant.variantId === variantId
                ? {...item, quantity}
                : item
        ));
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

    // Check if all quantities are 0 (order cancellation)
    const allQuantitiesZero = lineItems.every((item: any) => {
        const qty = item.id in quantities ? quantities[item.id] : item.quantity;
        return qty === 0;
    }) && selectedVariants.length === 0;

    // Calculate updated totals based on current quantities
    const calculateUpdatedTotals = () => {
        const currencyCode = cost?.subtotalAmount?.current?.currencyCode || 'BDT';

        // Calculate subtotal from existing items with updated quantities
        let newSubtotal = 0;
        lineItems.forEach((item: any) => {
            const itemPrice = parseFloat(item.price?.amount || item.cost?.totalAmount?.amount || 0);
            // Use updated quantity if it exists in state, otherwise use original
            const itemQuantity = item.id in quantities ? quantities[item.id] : item.quantity;
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
            secondaryAction={<Button
                to={`shopify:customer-account/orders/${extractIdFromGid(order.current.id)}`}
            >
                {(allQuantitiesZero ? 'Cancel' : 'Update')}
            </Button>}
            primaryAction={
                <PrimaryActionButton
                    hasChanges={hasChanges}
                    allQuantitiesZero={allQuantitiesZero}
                    isSaving={isSaving}
                    handleSave={handleSave}
                />
            }
        >


            <BlockStack spacing={'base'}>
                <Banner status={hasChanges ? 'warning' : 'info'}>
                    {hasChanges ? 'You have unsaved changes.' : 'You can update you until 12:12 pm'}
                </Banner>

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
                                                <Grid columns={['fill', 'auto', 'auto']} spacing="base" blockAlignment="center">
                                                    <GridItem>
                                                        <BlockStack spacing="extraTight">
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
                                                    <GridItem>
                                                        <Button
                                                            kind="plain"
                                                            accessibilityLabel="Remove item"
                                                            onPress={() => {
                                                                setQuantities(prev => ({
                                                                    ...prev,
                                                                    [item.id]: 0
                                                                }));
                                                            }}
                                                        >
                                                            <Icon source="delete"/>
                                                        </Button>
                                                    </GridItem>
                                                </Grid>
                                            </BlockStack>
                                        ))}

                                        {/* New variants to add */}
                                        {selectedVariants.map((item, index) => (
                                            <BlockStack key={`new-${index}`} spacing="tight">
                                                <Grid columns={['fill', 'auto', 'auto']} spacing="base" blockAlignment="center">
                                                    <GridItem>
                                                        <BlockStack spacing="extraTight">
                                                            <InlineStack spacing={'base'} blockAlignment={'center'} inlineAlignment={'start'}>
                                                                <TextBlock appearance="subdued" size="small">
                                                                    {item.variant.productTitle}
                                                                </TextBlock>
                                                                <Badge size={'small'} tone={'success'}>New</Badge>
                                                            </InlineStack>
                                                            <TextBlock appearance="subdued" size="small">
                                                                {item.variant.variantTitle}
                                                            </TextBlock>
                                                            <TextBlock size="small" appearance="subdued">
                                                                {item.variant.price.amount} {item.variant.price.currencyCode}
                                                            </TextBlock>
                                                        </BlockStack>
                                                    </GridItem>
                                                    <GridItem>
                                                        <TextField
                                                            label="Qty"
                                                            type="number"
                                                            value={item.quantity.toString()}
                                                            onChange={(value) => handleNewVariantQuantityChange(item.variant.variantId, value)}
                                                        />
                                                    </GridItem>
                                                    <GridItem>
                                                        <Button
                                                            kind="plain"
                                                            accessibilityLabel="Remove item"
                                                            onPress={() => {
                                                                setSelectedVariants(prev => prev.filter(v => v.variant.variantId !== item.variant.variantId));
                                                            }}
                                                        >
                                                            <Icon source="delete"/>
                                                        </Button>
                                                    </GridItem>
                                                </Grid>
                                                <Divider/>
                                            </BlockStack>
                                        ))}
                                    </BlockStack>

                                    {/* Add Items Button */}
                                    <Button
                                        kind={'primary'}
                                        appearance={'monochrome'}
                                        overlay={
                                            <Modal
                                                id="add-product-modal"
                                                title="Add Items"
                                                padding={true}
                                                primaryAction={
                                                    <Button kind="primary">
                                                        Done ({selectedVariants.length})
                                                    </Button>
                                                }
                                            >
                                                <ScrollView>
                                                    <ProductSearchModal
                                                        onVariantSelect={handleVariantSelect}
                                                        onVariantDelete={(variantId) => {
                                                            setSelectedVariants(prev => prev.filter(v => v.variant.variantId !== variantId));
                                                        }}
                                                        selectedVariants={selectedVariants}
                                                        onClose={() => setShowProductSearch(false)}
                                                    />
                                                </ScrollView>


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
