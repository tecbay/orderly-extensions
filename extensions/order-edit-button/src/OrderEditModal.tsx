import {
    Button,
    CustomerAccountAction,
    reactExtension,
    useApi,
    Form,
    BlockStack,
    TextBlock,
    Banner,
    Spinner,
    useNavigation
} from "@shopify/ui-extensions-react/customer-account";
import {useState} from "react";
import {OrderData, VariantWithProduct} from "./types";
import {useOrderData} from "./hooks/useOrderData";
import {OrderItemsList} from "./components/OrderItemsList";
import {ProductSearchModal} from "./components/ProductSearchModal";

export default reactExtension(
    "customer-account.order.action.render",
    (api) => <OrderEditModal orderId={api.orderId}/>
);


function OrderEditModal({orderId}: { orderId: string }) {
    const {navigate} = useNavigation()

    // Extract numeric ID from GID for URL
    const extractIdFromGid = (gid: string) => {
        const parts = gid.split('/');
        return parts[parts.length - 1];
    };

    const numericOrderId = extractIdFromGid(orderId);
    // Using customer-account.page.render (non-order-specific) so we can navigate to it
    // We'll pass the orderId as a query parameter
    const extensionUrl = `extension:order-full-page-edit/`;

    function gotoOrder() {
        console.log("Navigating to:", extensionUrl);
        navigate(extensionUrl);
    }

    return (
        <CustomerAccountAction
            title="Confirm Edit Order"
            primaryAction={
                <Button onPress={gotoOrder}>
                    Proceed to Edit
                </Button>
            }
        >
            <BlockStack spacing="base">
                <TextBlock>
                    You are about to edit order. Click "Proceed to Edit" to continue to the full editing page.
                </TextBlock>
                <Button to={extensionUrl}>Aasdf</Button>
            </BlockStack>
        </CustomerAccountAction>
    );
}

// function OrderEditModal({orderId}: { orderId: string }) {
//     const {close} = useApi<"customer-account.order.action.render">();
//     const {
//         orderData,
//         quantities,
//         setQuantities,
//         isLoading,
//         error
//     } = useOrderData(orderId);
//
//     const [isSaving, setIsSaving] = useState(false);
//     const [showProductSearch, setShowProductSearch] = useState(false);
//     const [selectedVariants, setSelectedVariants] = useState<Array<{ variant: VariantWithProduct; quantity: number }>>([]);
//
//     // Handle quantity changes
//     const handleQuantityChange = (lineItemId: string, newQuantity: string) => {
//         const quantity = parseInt(newQuantity) || 0;
//         setQuantities(prev => ({
//             ...prev,
//             [lineItemId]: Math.max(0, quantity) // Ensure non-negative
//         }));
//     };
//
//     // Handle variant selection from search
//     const handleVariantSelect = (variant: VariantWithProduct, quantity: number) => {
//         console.log('Variant selected:', {
//             variantId: variant.variantId,
//             variantTitle: variant.variantTitle,
//             productTitle: variant.productTitle,
//             price: variant.price,
//             sku: variant.sku,
//             quantity: quantity
//         });
//
//         // Add variant to selected list
//         setSelectedVariants(prev => [...prev, { variant, quantity }]);
//     };
//
//     // Handle variant deletion
//     const handleVariantDelete = (variantId: string) => {
//         setSelectedVariants(prev => prev.filter(item => item.variant.variantId !== variantId));
//     };
//
//     // Handle form submission
//     async function onSubmit() {
//         setIsSaving(true);
//         try {
//             // Here you would typically make an API call to update the order
//             // For now, we'll simulate the process
//             console.log('Updating order with new quantities:', quantities);
//
//             // Simulate API call
//             // @ts-ignore
//             await new Promise(resolve => setTimeout(resolve, 1500));
//
//             close();
//         } catch (err) {
//             console.error('Error updating order:', err);
//         } finally {
//             setIsSaving(false);
//         }
//     }
//
//     // Check if any quantities have changed
//     const hasChanges = orderData?.lineItems.nodes.some(item =>
//         quantities[item.id] !== item.quantity
//     ) ?? false;
//
//     if (isLoading) {
//         return (
//             <CustomerAccountAction title="Loading Order Details...">
//                 <BlockStack spacing="base">
//                     <Spinner/>
//                     <TextBlock>Loading order information...</TextBlock>
//                 </BlockStack>
//             </CustomerAccountAction>
//         );
//     }
//
//     if (error || !orderData) {
//         return (
//             <CustomerAccountAction
//                 title="Error"
//                 secondaryAction={
//                     <Button onPress={close}>
//                         Close
//                     </Button>
//                 }
//             >
//                 <Banner status="critical">
//                     {error || 'Failed to load order details'}
//                 </Banner>
//             </CustomerAccountAction>
//         );
//     }
//
//     // Show product search modal if active
//     if (showProductSearch) {
//         return (
//             <CustomerAccountAction
//                 title="Add Product"
//                 primaryAction={
//                     <Button
//                         onPress={() => setShowProductSearch(false)}
//                         disabled={selectedVariants.length === 0}
//                     >
//                         Done ({selectedVariants.length})
//                     </Button>
//                 }
//                 secondaryAction={
//                     <Button onPress={() => setShowProductSearch(false)}>
//                         Back
//                     </Button>
//                 }
//             >
//                 <ProductSearchModal
//                     onVariantSelect={handleVariantSelect}
//                     onVariantDelete={handleVariantDelete}
//                     selectedVariants={selectedVariants}
//                     onClose={() => setShowProductSearch(false)}
//                 />
//             </CustomerAccountAction>
//         );
//     }
//
//     return (
//         <CustomerAccountAction
//             title={`Edit Order ${orderData.name}`}
//             primaryAction={
//                 <Button
//                     loading={isSaving}
//                     onPress={onSubmit}
//                     disabled={!hasChanges}
//                 >
//                     {isSaving ? 'Saving...' : 'Save Changes'}
//                 </Button>
//             }
//             secondaryAction={
//                 <Button onPress={close}>
//                     Cancel
//                 </Button>
//             }
//         >
//             <Form onSubmit={onSubmit}>
//                 <BlockStack spacing="base">
//                     <TextBlock size="large">
//                         Order Total: {orderData.totalPrice.amount} {orderData.totalPrice.currencyCode}
//                     </TextBlock>
//
//                     {orderData.subtotal && (
//                         <TextBlock size="small">
//                             Subtotal: {orderData.subtotal.amount} {orderData.subtotal.currencyCode}
//                         </TextBlock>
//                     )}
//
//                     {orderData.totalTax && (
//                         <TextBlock size="small">
//                             Tax: {orderData.totalTax.amount} {orderData.totalTax.currencyCode}
//                         </TextBlock>
//                     )}
//
//                     <OrderItemsList
//                         items={orderData.lineItems.nodes}
//                         quantities={quantities}
//                         onQuantityChange={handleQuantityChange}
//                     />
//
//                     <Button onPress={() => setShowProductSearch(true)}>
//                         Add Product
//                     </Button>
//
//                     {hasChanges && (
//                         <Banner status="info">
//                             You have unsaved changes. Click "Save Changes" to update the order.
//                         </Banner>
//                     )}
//                 </BlockStack>
//             </Form>
//         </CustomerAccountAction>
//     );
// }
