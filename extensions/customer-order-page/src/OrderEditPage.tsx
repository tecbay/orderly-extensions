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
import {useState, useEffect} from "react";
import {VariantWithProduct} from "../../../extensions/order-edit-button/src/types";
import {ProductSearchModal} from "../../../extensions/order-edit-button/src/components/ProductSearchModal";

const API_BASE_URL = 'https://orderly-be.test/api';

interface Settings {
    enable_order_editing: boolean;
    edit_time_window: number;
    safe_financial_statuses: string[];
    safe_fulfillment_statuses: string[];
    allowed_edit_types: string[];
    who_can_edit: string[];
    notify_on_edit: boolean;
}

export default reactExtension("customer-account.order.page.render",
    (api) => <OrderPage api={api}/>);

interface Address {
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    provinceCode?: string;
    countryCode?: string;
    zip?: string;
    phone?: string;
    company?: string;
}

function AddressEditModal({
    title,
    address,
    onSave,
    onClose,
    isSaving
}: {
    title: string;
    address: Address | null;
    onSave: (addressData: any) => void;
    onClose: () => void;
    isSaving: boolean;
}) {
    const [formData, setFormData] = useState({
        first_name: address?.firstName || '',
        last_name: address?.lastName || '',
        address1: address?.address1 || '',
        address2: address?.address2 || '',
        city: address?.city || '',
        province: address?.provinceCode || '',
        country: address?.countryCode || '',
        zip: address?.zip || '',
        phone: address?.phone || '',
        company: address?.company || '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <BlockStack spacing="base">
            <TextField
                label="First Name"
                value={formData.first_name}
                onChange={(value) => handleChange('first_name', value)}
            />
            <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={(value) => handleChange('last_name', value)}
            />
            <TextField
                label="Company"
                value={formData.company}
                onChange={(value) => handleChange('company', value)}
            />
            <TextField
                label="Address Line 1"
                value={formData.address1}
                onChange={(value) => handleChange('address1', value)}
            />
            <TextField
                label="Address Line 2"
                value={formData.address2}
                onChange={(value) => handleChange('address2', value)}
            />
            <Grid columns={['fill', 'fill']} spacing="base">
                <GridItem>
                    <TextField
                        label="City"
                        value={formData.city}
                        onChange={(value) => handleChange('city', value)}
                    />
                </GridItem>
                <GridItem>
                    <TextField
                        label="Province/State"
                        value={formData.province}
                        onChange={(value) => handleChange('province', value)}
                    />
                </GridItem>
            </Grid>
            <Grid columns={['fill', 'fill']} spacing="base">
                <GridItem>
                    <TextField
                        label="Postal/ZIP Code"
                        value={formData.zip}
                        onChange={(value) => handleChange('zip', value)}
                    />
                </GridItem>
                <GridItem>
                    <TextField
                        label="Country"
                        value={formData.country}
                        onChange={(value) => handleChange('country', value)}
                    />
                </GridItem>
            </Grid>
            <TextField
                label="Phone"
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
            />
            <InlineStack spacing="base">
                <Button onPress={handleSubmit} loading={isSaving} kind="primary">
                    Save
                </Button>
                <Button onPress={onClose} disabled={isSaving} kind="plain">
                    Cancel
                </Button>
            </InlineStack>
        </BlockStack>
    );
}

function PrimaryActionButton({hasChanges, allQuantitiesZero, isSaving, handleSave, disabled}: {
    hasChanges: boolean;
    allQuantitiesZero: boolean;
    isSaving: boolean;
    handleSave: () => void;
    disabled?: boolean;
}) {
    if (!hasChanges) return null;

    return (
        <>
            {/*<Button appearance={'critical'} kind={'plain'}>*/}
            {/*    Discard*/}
            {/*</Button>*/}
            <Button
                onPress={handleSave}
                kind={"secondary"}
                loading={isSaving}
                disabled={!hasChanges || disabled}
            >
                {allQuantitiesZero ? 'Cancel' : 'Update'}
            </Button>
        </>
    );
}

function OrderPage({api}) {
    const {order, lines, billingAddress, shippingAddress, buyerIdentity, cost, sessionToken} = api;
    console.log('order', order);
    console.log('lines', lines);
    console.log('billingAddress', billingAddress);
    console.log('shippingAddress', shippingAddress);
    console.log('cost', cost);

    const [showProductSearch, setShowProductSearch] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState<Array<{ variant: VariantWithProduct; quantity: number }>>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);

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

    // Fetch settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                const token = await sessionToken.get();

                const response = await fetch(`${API_BASE_URL}/settings`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSettings(data.settings);
                } else {
                    console.error('Failed to fetch settings:', response.statusText);
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            } finally {
                setIsLoadingSettings(false);
            }
        }

        fetchSettings();
    }, [sessionToken]);

    // Validate order against settings
    useEffect(() => {
        if (!settings || !order?.current) return;

        const errors: string[] = [];

        // Check if editing is enabled
        if (!settings.enable_order_editing) {
            errors.push('Order editing is currently disabled.');
        }

        // Check time window (edit_time_window is in minutes)
        if (settings.edit_time_window && order.current.createdAt) {
            const orderDate = new Date(order.current.createdAt);
            const now = new Date();
            const minutesPassed = (now.getTime() - orderDate.getTime()) / 1000 / 60;

            if (minutesPassed > settings.edit_time_window) {
                const hoursWindow = Math.floor(settings.edit_time_window / 60);
                const minutesWindow = settings.edit_time_window % 60;
                const windowText = hoursWindow > 0
                    ? `${hoursWindow} hour${hoursWindow > 1 ? 's' : ''}${minutesWindow > 0 ? ` ${minutesWindow} minutes` : ''}`
                    : `${minutesWindow} minutes`;
                errors.push(`Orders can only be edited within ${windowText} of placement.`);
            }
        }

        // Check financial status
        if (settings.safe_financial_statuses.length > 0 && order.current.financialStatus) {
            const financialStatus = order.current.financialStatus.toLowerCase();
            const safeStatuses = settings.safe_financial_statuses.map(s => s.toLowerCase());

            if (!safeStatuses.includes(financialStatus)) {
                errors.push(`Orders with "${order.current.financialStatus}" financial status cannot be edited.`);
            }
        }

        // Check fulfillment status
        if (settings.safe_fulfillment_statuses.length > 0 && order.current.fulfillmentStatus) {
            const fulfillmentStatus = order.current.fulfillmentStatus.toLowerCase();
            const safeStatuses = settings.safe_fulfillment_statuses.map(s => s.toLowerCase());

            if (!safeStatuses.includes(fulfillmentStatus)) {
                errors.push(`Orders with "${order.current.fulfillmentStatus}" fulfillment status cannot be edited.`);
            }
        }

        setValidationErrors(errors);
    }, [settings, order]);

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

    const handleUpdateAddress = async (addressData: any, type: 'shipping' | 'billing') => {
        setIsSavingAddress(true);
        try {
            const token = await sessionToken.get();
            const endpoint = type === 'shipping'
                ? `${API_BASE_URL}/orders/shipping-address`
                : `${API_BASE_URL}/orders/billing-address`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_gid: order.current.id,
                    ...addressData,
                }),
            });

            if (response.ok) {
                console.log(`${type} address updated successfully`);
                // Close modal
                if (type === 'shipping') {
                    setShowShippingModal(false);
                } else {
                    setShowBillingModal(false);
                }
                // Optionally refresh the page or show success message
            } else {
                console.error(`Failed to update ${type} address:`, response.statusText);
            }
        } catch (err) {
            console.error(`Error updating ${type} address:`, err);
        } finally {
            setIsSavingAddress(false);
        }
    };

    if (!order || isLoadingSettings) {
        return (
            <Page title="Loading...">
                <TextBlock>Loading order...</TextBlock>
            </Page>
        );
    }

    // Determine if editing is allowed
    const canEdit = validationErrors.length === 0;
    const canEditItems = settings?.allowed_edit_types?.includes('items') ?? false;
    const canEditShipping = settings?.allowed_edit_types?.includes('shipping') ?? false;

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
                    disabled={!canEdit}
                />
            }
        >


            <BlockStack spacing={'base'}>
                {validationErrors.length > 0 ? (
                    <BlockStack spacing={'tight'}>
                        {validationErrors.map((error, index) => (
                            <Banner key={index} status="critical">
                                {error}
                            </Banner>
                        ))}
                    </BlockStack>
                ) : (
                    <Banner status={hasChanges ? 'warning' : 'info'}>
                        {hasChanges ? 'You have unsaved changes.' : `You can edit this order within ${settings?.edit_time_window ? Math.floor(settings.edit_time_window / 60) : 0} hours of placement.`}
                    </Banner>
                )}

                {/* Two Column Layout */}
                <Grid columns={['fill', 'fill']} spacing={'base'}>
                    {/* Left Column - Addresses */}
                    <GridItem>
                        <BlockStack spacing={'base'}>
                            {/* Billing Address */}
                            <Card padding={'100'}>
                                <BlockStack spacing="base">
                                    <InlineStack spacing="base" blockAlignment="center" inlineAlignment="space-between">
                                        <Heading level={3}>Billing Address</Heading>
                                        {canEdit && canEditShipping && (
                                            <Button
                                                kind="plain"
                                                accessibilityLabel="Edit billing address"
                                                overlay={
                                                    <Modal
                                                        id="edit-billing-modal"
                                                        title="Edit Billing Address"
                                                        padding={true}
                                                    >
                                                        <AddressEditModal
                                                            title="Edit Billing Address"
                                                            address={billingAddress?.current || null}
                                                            onSave={(data) => handleUpdateAddress(data, 'billing')}
                                                            onClose={() => setShowBillingModal(false)}
                                                            isSaving={isSavingAddress}
                                                        />
                                                    </Modal>
                                                }
                                            >
                                                <Icon source="edit"/>
                                            </Button>
                                        )}
                                    </InlineStack>
                                    <Divider/>
                                    {billingAddress?.current ? (
                                        <BlockStack spacing="extraTight">
                                            <TextBlock emphasis="bold">
                                                {billingAddress.current.firstName} {billingAddress.current.lastName}
                                            </TextBlock>
                                            {billingAddress.current.company && (
                                                <TextBlock>{billingAddress.current.company}</TextBlock>
                                            )}
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
                                    <InlineStack spacing="base" blockAlignment="center" inlineAlignment="space-between">
                                        <Heading level={3}>Shipping Address</Heading>
                                        {canEdit && canEditShipping && (
                                            <Button
                                                kind="plain"
                                                accessibilityLabel="Edit shipping address"
                                                overlay={
                                                    <Modal
                                                        id="edit-shipping-modal"
                                                        title="Edit Shipping Address"
                                                        padding={true}
                                                    >
                                                        <AddressEditModal
                                                            title="Edit Shipping Address"
                                                            address={shippingAddress?.current || null}
                                                            onSave={(data) => handleUpdateAddress(data, 'shipping')}
                                                            onClose={() => setShowShippingModal(false)}
                                                            isSaving={isSavingAddress}
                                                        />
                                                    </Modal>
                                                }
                                            >
                                                <Icon source="edit"/>
                                            </Button>
                                        )}
                                    </InlineStack>
                                    <Divider/>
                                    {shippingAddress?.current ? (
                                        <BlockStack spacing="extraTight">
                                            <TextBlock emphasis="bold">
                                                {shippingAddress.current.firstName} {shippingAddress.current.lastName}
                                            </TextBlock>
                                            {shippingAddress.current.company && (
                                                <TextBlock>{shippingAddress.current.company}</TextBlock>
                                            )}
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
                                                            disabled={!canEdit || !canEditItems}
                                                        />
                                                    </GridItem>
                                                    <GridItem>
                                                        <Button
                                                            kind="plain"
                                                            accessibilityLabel="Remove item"
                                                            disabled={!canEdit || !canEditItems}
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
                                                            disabled={!canEdit || !canEditItems}
                                                        />
                                                    </GridItem>
                                                    <GridItem>
                                                        <Button
                                                            kind="plain"
                                                            accessibilityLabel="Remove item"
                                                            disabled={!canEdit || !canEditItems}
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

                                    {/* Add Items Button - only show if items editing is allowed */}
                                    {canEdit && canEditItems && (
                                        <Button
                                            kind={'primary'}
                                            appearance={'monochrome'}
                                            overlay={
                                                <Modal
                                                    id="add-product-modal"
                                                    title="Add Items"
                                                    padding={true}
                                                    primaryAction={
                                                        <Button kind={'plain'}>
                                                            Done ({selectedVariants.length})
                                                        </Button>
                                                    }

                                                >
                                                    <ProductSearchModal
                                                        onVariantSelect={handleVariantSelect}
                                                        onVariantDelete={(variantId) => {
                                                            setSelectedVariants(prev => prev.filter(v => v.variant.variantId !== variantId));
                                                        }}
                                                        selectedVariants={selectedVariants}
                                                        onClose={() => setShowProductSearch(false)}
                                                    />
                                                </Modal>
                                            }
                                        >
                                            Add items
                                        </Button>
                                    )}
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
