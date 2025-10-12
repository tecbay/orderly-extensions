import {
    reactExtension,
    Page,
    BlockStack,
    Button,
    Grid,
    GridItem,
    Modal,
    useApi
} from "@shopify/ui-extensions-react/customer-account";
import {useState} from "react";
import {VariantWithProduct} from "../../../extensions/order-edit-button/src/types";
import {ProductSearchModal} from "../../../extensions/order-edit-button/src/components/ProductSearchModal";

// Components
import {AddressCard} from "./components/AddressCard";
import {AddressEditModal} from "./components/AddressEditModal";
import {OrderItemsCard} from "./components/OrderItemsCard";
import {OrderSummaryCard} from "./components/OrderSummaryCard";
import {ValidationBanner} from "./components/ValidationBanner";

// Hooks
import {useSettings} from "./hooks/useSettings";
import {useOrderValidation} from "./hooks/useOrderValidation";
import {useOrderStatus} from "./hooks/useOrderStatus";

const API_BASE_URL = 'https://orderly-be.test/api';

export default reactExtension("customer-account.order.page.render",
    () => <OrderPage/>);

function PrimaryActionButton({
                                 hasChanges,
                                 allQuantitiesZero,
                                 isSaving,
                                 handleSave,
                                 disabled
                             }: {
    hasChanges: boolean;
    allQuantitiesZero: boolean;
    isSaving: boolean;
    handleSave: () => void;
    disabled?: boolean;
}) {
    if (!hasChanges) return null;

    return (
        <Button
            onPress={handleSave}
            kind={"secondary"}
            loading={isSaving}
            disabled={!hasChanges || disabled}
        >
            {allQuantitiesZero ? 'Cancel' : 'Update'}
        </Button>
    );
}

function OrderPage() {
    const api = useApi<'customer-account.order.page.render'>();
    const {order, lines, billingAddress, shippingAddress, cost, sessionToken, ui} = api;

    // State management
    const [selectedVariants, setSelectedVariants] = useState<Array<{ variant: VariantWithProduct; quantity: number }>>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [optimisticShippingAddress, setOptimisticShippingAddress] = useState<any>(null);

    // Custom hooks
    const {settings, isLoadingSettings} = useSettings(sessionToken);
    const {orderStatus, isLoading: isLoadingStatus} = useOrderStatus(order?.current?.id || '');
    const {validationErrors, canEdit, canEditItems, canEditShipping} = useOrderValidation(settings, order, orderStatus);

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

    // Helper functions
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

    const handleNewVariantQuantityChange = (variantId: string, newQuantity: string) => {
        const quantity = Math.max(0, parseInt(newQuantity) || 0);
        setSelectedVariants(prev => prev.map(item =>
            item.variant.variantId === variantId
                ? {...item, quantity}
                : item
        ));
    };

    const handleVariantSelect = (variant: VariantWithProduct, quantity: number) => {
        setSelectedVariants(prev => [...prev, {variant, quantity}]);
    };

    const handleUpdateAddress = async (addressData: any, type: 'shipping' | 'billing') => {
        setIsSavingAddress(true);

        // Optimistically update the UI
        if (type === 'shipping') {
            setOptimisticShippingAddress({
                firstName: addressData.first_name,
                lastName: addressData.last_name,
                address1: addressData.address1,
                address2: addressData.address2,
                city: addressData.city,
                provinceCode: addressData.province,
                countryCode: addressData.country,
                zip: addressData.zip,
                phone: addressData.phone,
                company: addressData.company,
            });
        }

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

            if (!response.ok) {
                // Revert optimistic update on error
                setOptimisticShippingAddress(null);
                throw new Error(`Failed to update ${type} address`);
            }
        } catch (err) {
            // Revert optimistic update on error
            setOptimisticShippingAddress(null);
            console.error(`Error updating ${type} address:`, err);
            throw err;
        } finally {
            setIsSavingAddress(false);
        }
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

    // Loading state
    if (!order || isLoadingSettings || isLoadingStatus) {
        return (
            <Page title="Loading...">
                <BlockStack>Loading order...</BlockStack>
            </Page>
        );
    }

    // Calculate changes
    const hasChanges = lineItems.some((item: any) =>
        quantities[item.id] !== item.quantity
    ) || selectedVariants.length > 0;

    const allQuantitiesZero = lineItems.every((item: any) => {
        const qty = item.id in quantities ? quantities[item.id] : item.quantity;
        return qty === 0;
    }) && selectedVariants.length === 0;

    // Calculate updated totals
    const calculateUpdatedTotals = () => {
        const currencyCode = cost?.subtotalAmount?.current?.currencyCode || 'BDT';

        let newSubtotal = 0;
        lineItems.forEach((item: any) => {
            const itemPrice = parseFloat(item.price?.amount || item.cost?.totalAmount?.amount || 0);
            const itemQuantity = item.id in quantities ? quantities[item.id] : item.quantity;
            newSubtotal += itemPrice * itemQuantity;
        });

        selectedVariants.forEach((item) => {
            const variantPrice = parseFloat(item.variant.price.amount || 0);
            newSubtotal += variantPrice * item.quantity;
        });

        const originalSubtotal = parseFloat(cost?.subtotalAmount?.current?.amount || 0);
        const originalTax = parseFloat(cost?.totalTaxAmount?.current?.amount || 0);
        const taxRate = originalSubtotal > 0 ? originalTax / originalSubtotal : 0;
        const newTax = newSubtotal * taxRate;
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
            secondaryAction={
                <Button
                    to={`shopify:customer-account/orders/${extractIdFromGid(order.current.id)}`}
                    kind="plain"
                >
                    Back to Order
                </Button>
            }
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
                {/* Validation Banner */}
                <ValidationBanner
                    validationErrors={validationErrors}
                    hasChanges={hasChanges}
                    editTimeWindow={settings?.edit_time_window}
                    orderCreatedAt={orderStatus.createdAt}
                />

                {/* Two Column Layout - Responsive */}
                <Grid
                    columns={{
                        default: ['fill'],
                        conditionals: [{
                            conditions: {viewportInlineSize: {min: 'medium'}},
                            value: ['fill', 'fill']
                        }]
                    }}
                    spacing='base'
                    rows='auto'
                >
                    {/* Left Column - Addresses */}
                    <GridItem>
                        <BlockStack
                            spacing={{
                                default: 'none',
                                conditionals: [{
                                    conditions: {viewportInlineSize: {min: 'medium'}},
                                    value: 'base'
                                }]
                            }}
                        >
                            {/* Note: Shopify API does not support updating billing address on existing orders */}
                            <AddressCard
                                title="Billing Address"
                                address={billingAddress?.current || null}
                                canEdit={false}
                                onEdit={() => {
                                }}
                                editModal={<></>}
                            />

                            <AddressCard
                                title="Shipping Address"
                                address={optimisticShippingAddress || shippingAddress?.current || null}
                                canEdit={canEdit && canEditShipping}
                                onEdit={() => {
                                }}
                                editModal={
                                    <Modal
                                        id="edit-shipping-modal"
                                        title="Edit Shipping Address"
                                        padding={true}
                                    >
                                        <AddressEditModal
                                            title="Edit Shipping Address"
                                            address={optimisticShippingAddress || shippingAddress?.current || null}
                                            onSave={(data) => handleUpdateAddress(data, 'shipping')}
                                            onClose={() => {
                                                // Close the modal using Shopify's UI API
                                                if (ui?.overlay?.close) {
                                                    ui.overlay.close('edit-shipping-modal');
                                                }
                                            }}
                                            isSaving={isSavingAddress}
                                        />
                                    </Modal>
                                }
                            />
                        </BlockStack>
                    </GridItem>

                    {/* Right Column - Order Items & Summary */}
                    <GridItem>
                        <BlockStack
                            spacing={{
                                default: 'none',
                                conditionals: [{
                                    conditions: {viewportInlineSize: {min: 'medium'}},
                                    value: 'base'
                                }]
                            }}
                        >
                            <OrderItemsCard
                                lineItems={lineItems}
                                quantities={quantities}
                                selectedVariants={selectedVariants}
                                canEdit={canEdit}
                                canEditItems={canEditItems}
                                onQuantityChange={handleQuantityChange}
                                onRemoveLineItem={(id) => setQuantities(prev => ({...prev, [id]: 0}))}
                                onNewVariantQuantityChange={handleNewVariantQuantityChange}
                                onRemoveVariant={(variantId) => {
                                    setSelectedVariants(prev => prev.filter(v => v.variant.variantId !== variantId));
                                }}
                                addItemsModal={
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
                                            onClose={() => {
                                            }}
                                        />
                                    </Modal>
                                }
                            />

                            <OrderSummaryCard
                                subtotal={updatedTotals.subtotal}
                                tax={updatedTotals.tax}
                                total={updatedTotals.total}
                                financialStatus={orderStatus.financialStatus}
                                fulfillmentStatus={orderStatus.fulfillmentStatus}
                            />
                        </BlockStack>
                    </GridItem>
                </Grid>
            </BlockStack>
        </Page>
    );
}
