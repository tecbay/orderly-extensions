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
import {useState, useEffect} from "react";
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

// Configuration
import {config} from "../../shared/config";

const API_BASE_URL = config.API_BASE_URL;

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
    const {order, lines, billingAddress, shippingAddress, cost, sessionToken, ui, storage} = useApi<'customer-account.order.page.render'>();


    // State management
    const [selectedVariants, setSelectedVariants] = useState<Array<{ variant: VariantWithProduct; quantity: number }>>([]);
    const [tempSelectedVariants, setTempSelectedVariants] = useState<Array<{ variant: VariantWithProduct; quantity: number }>>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [optimisticShippingAddress, setOptimisticShippingAddress] = useState<any>(null);

    // Custom hooks
    const {settings, isLoadingSettings} = useSettings(sessionToken);
    const {orderStatus, isLoading: isLoadingStatus} = useOrderStatus(order?.current?.id || '', sessionToken);
    const {validationErrors, canEdit, canEditItems, canEditShipping} = useOrderValidation(settings, order, orderStatus);

    // Auto-complete onboarding step 1 on first load
    useEffect(() => {

        // @ts-ignore
        const completeOnboardingStep1 = async () => {
            const STORAGE_KEY = 'orderly_onboarding_step_1_completed';
            console.log(STORAGE_KEY)
            // Check if we've already completed this
            const isCompleted = await storage.read(STORAGE_KEY) ?? 'false';

            if (isCompleted === 'true') {
                return;
            }

            try {
                const token = await sessionToken.get();
                const response = await fetch(`${API_BASE_URL}/onboarding/complete-step`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        step_number: 1,
                    }),
                });

                if (response.ok) {
                    // Mark as completed in localStorage
                    await storage.write(STORAGE_KEY, 'true');
                    console.log('Onboarding step 1 completed successfully');
                } else {
                    console.error('Failed to complete onboarding step 1:', await response.text());
                }
            } catch (error) {
                console.error('Error completing onboarding step 1:', error);
            }
        };

        // Only run if we have a session token
        if (sessionToken) {
            completeOnboardingStep1();
        }
    }, [sessionToken]);

    // Get current lines array from the lines object
    const lineItems = lines?.current || [];
    console.log('lines', lineItems);
    // Initialize quantities from lines when line items are loaded
    useEffect(() => {
        if (lineItems.length > 0 && Object.keys(quantities).length === 0) {
            const initialQuantities: Record<string, number> = {};
            lineItems.forEach((item: any) => {
                initialQuantities[item.id] = item.quantity;
            });
            setQuantities(initialQuantities);
        }
    }, [lineItems, quantities]);

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
        setTempSelectedVariants(prev => [...prev, {variant, quantity}]);
    };

    const handleAddItemsClick = () => {
        // Initialize temp state with current selections when opening modal
        setTempSelectedVariants([...selectedVariants]);
    };

    const handleModalDone = () => {
        // Apply temp selections to actual selections
        setSelectedVariants([...tempSelectedVariants]);
        // Close the modal
        if (ui?.overlay?.close) {
            ui.overlay.close('add-product-modal');
        }
    };

    const handleModalCancel = () => {
        // Discard temp selections and reset to current selections
        setTempSelectedVariants([...selectedVariants]);
        // Close the modal
        if (ui?.overlay?.close) {
            ui.overlay.close('add-product-modal');
        }
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
            // Debug: Log the structure of the first line item to understand the data
            if (lineItems.length > 0) {
                console.log('Sample line item structure:', JSON.stringify(lineItems[0], null, 2));
            }

            // Prepare payload for API
            // Backend expects:
            // - update_line_items: array of {id, variant_gid, quantity} for existing items
            // - add_line_items: array of {variant_gid, quantity} for new items

            // Map existing line items to update_line_items format
            // Only include items where quantity has changed
            const updateLineItems = Object.entries(quantities)
                .map(([lineItemId, newQuantity]) => {
                    // Find the original line item to get its variant GID and original quantity
                    const lineItem = lineItems.find((item: any) => item.id === lineItemId);
                    if (!lineItem) return null;

                    // Check if quantity has actually changed
                    const originalQuantity = lineItem.quantity;
                    if (newQuantity === originalQuantity) {
                        return null; // Skip unchanged items
                    }

                    // Extract variant GID from the line item
                    // Shopify line items have variant info in merchandise object
                    const variantGid = lineItem.merchandise?.id || lineItem.variant?.id || lineItem.variantId || '';

                    if (!variantGid) {
                        console.warn('Could not find variant GID for line item:', lineItem);
                        return null;
                    }

                    return {
                        id: lineItemId,
                        variant_gid: variantGid,
                        quantity: newQuantity // Send the new cumulative quantity (e.g., 6, not the diff)
                    };
                })
                .filter(item => item !== null); // Remove any null entries and unchanged items

            // Map newly selected variants to add_line_items format
            const addLineItems = selectedVariants
                .filter(item => item.quantity > 0)
                .map(item => ({
                    variant_gid: item.variant.variantId,
                    quantity: item.quantity
                }));

            console.log('Updating line items:', JSON.stringify(updateLineItems, null, 2));
            console.log('Adding line items:', JSON.stringify(addLineItems, null, 2));

            // Build payload and only include non-empty arrays
            const payload: any = {
                order_gid: order.current.id,
            };

            if (updateLineItems.length > 0) {
                payload.update_line_items = updateLineItems;
            }

            if (addLineItems.length > 0) {
                payload.add_line_items = addLineItems;
            }

            console.log('Final payload:', JSON.stringify(payload, null, 2));

            const token = await sessionToken.get();
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Failed to update order:', errorData);
                throw new Error(`Failed to update order: ${response.statusText}`);
            }

            // Parse response if available
            try {
                const result = await response.json();
                console.log('Order updated successfully:', result);
            } catch (parseErr) {
                // Response might be empty or not JSON
                console.log('Order updated successfully (no JSON response)');
            }

            // Reset UI state after successful update
            // This will hide the update button and validation banner

            // Clear newly selected variants since they've been added
            setSelectedVariants([]);
            setTempSelectedVariants([]);

            // Reset quantities state to empty so it re-initializes from fresh line items
            // This will trigger the useEffect to reload quantities from the updated order
            setQuantities({});

            console.log('Order update complete - UI state reset');

            // TODO: Show success message
            // You can use Shopify's Banner component or show a toast
        } catch (err) {
            console.error('Error saving order:', err);
            // TODO: Show error message to user
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
                                    // Set quantity to 0 instead of removing
                                    setSelectedVariants(prev => prev.map(item =>
                                        item.variant.variantId === variantId
                                            ? {...item, quantity: 0}
                                            : item
                                    ));
                                }}
                                onAddItemsClick={handleAddItemsClick}
                                addItemsModal={
                                    <Modal
                                        id="add-product-modal"
                                        title="Add Items"
                                        padding={true}
                                        primaryAction={
                                            <Button kind={'primary'} onPress={handleModalDone}>
                                                Done ({tempSelectedVariants.length})
                                            </Button>
                                        }
                                        secondaryActions={
                                            <Button kind={'secondary'} onPress={handleModalCancel}>
                                                Cancel
                                            </Button>
                                        }
                                    >
                                        <ProductSearchModal
                                            onVariantSelect={handleVariantSelect}
                                            onVariantDelete={(variantId) => {
                                                setTempSelectedVariants(prev => prev.filter(v => v.variant.variantId !== variantId));
                                            }}
                                            selectedVariants={tempSelectedVariants}
                                            onClose={handleModalCancel}
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
