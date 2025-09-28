import {
    reactExtension,
    BlockStack,
    Button,
    Modal,
    Text,
    useSessionToken
} from "@shopify/ui-extensions-react/checkout";
import {useState} from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (<Extension/>));

function Extension() {
    const sessionToken = useSessionToken();
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleCancelOrder = async () => {
        try {
            const token = await sessionToken.get();
            if (!token) {
                console.error("Failed to get session token");
                return;
            }

            // Replace with actual order ID
            const orderId = "newly_created_shopify_order_id";
            const apiUrl = `https://orderly-be.test/api/orders/${orderId}`;

            console.log("🗑️ Cancelling order:", orderId);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log("✅ Order cancelled successfully");
            } else {
                console.error("❌ Failed to cancel order:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("❌ Error cancelling order:", error);
        } finally {
            setShowCancelModal(false);
        }
    };

    const handleEditOrder = () => {
        console.log("✏️ Edit order button clicked");
    };

    return (
        <BlockStack spacing="base">
            <Button
                kind="secondary"
                onPress={() => setShowCancelModal(true)}
            >
                Cancel Order
            </Button>

            <Button
                kind="primary"
                onPress={handleEditOrder}
            >
                Edit Order
            </Button>

            {showCancelModal && (
                <Modal
                    title="Cancel Order"
                    onClose={() => setShowCancelModal(false)}
                    primaryAction={{
                        content: "Yes, Cancel Order",
                        onAction: handleCancelOrder
                    }}
                    secondaryAction={{
                        content: "Keep Order",
                        onAction: () => setShowCancelModal(false)
                    }}
                >
                    <Text>Are you sure you want to cancel this order? This action cannot be undone.</Text>
                </Modal>
            )}
        </BlockStack>
    );
}
