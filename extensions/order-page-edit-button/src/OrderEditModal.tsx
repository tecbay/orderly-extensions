import {
    Button,
    CustomerAccountAction,
    reactExtension,
    useApi,
    Form,
    BlockStack,
    TextField,
    InlineStack,
    TextBlock,
    Image,
    Banner,
    Spinner
} from "@shopify/ui-extensions-react/customer-account";
import {useState, useEffect} from "react";

// TypeScript interfaces for our data
interface LineItem {
    id: string;
    title: string;
    quantity: number;
    variant?: {
        id: string;
        title: string;
        image?: {
            url: string;
        };
    };
    currentTotalPrice: {
        amount: string;
        currencyCode: string;
    };
}

interface OrderData {
    id: string;
    name: string;
    lineItems: {
        nodes: LineItem[];
    };
    totalPriceSet: {
        presentmentMoney: {
            amount: string;
            currencyCode: string;
        };
    };
}

export default reactExtension(
    "customer-account.order.action.render",
    (api) => <OrderEditModal orderId={api.orderId}/>
);

function OrderEditModal({orderId}: { orderId: string }) {
    const {close, query} = useApi<"customer-account.order.action.render">();
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // GraphQL query to fetch complete order details
    const orderQuery = {
        query: `
        query {
          order(id: "${orderId}") {
            name
            createdAt,
            cancelReason,
            confirmationNumber,
            edited,
            fulfillmentStatus
          }
        }
      `,
    };

    // @ts-ignore
    async function fetchOrderData() {
        try {
            setIsLoading(true);
            setError(null);

            const result = await fetch(
                "shopify://customer-account/api/2024-10/graphql.json",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderQuery),
                }
            );

            const response = await result.json();

            console.log(response);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to load order data. Please ensure protected customer data access is enabled.');
        } finally {
            setIsLoading(false);
        }
    }

    // Fetch order data when component mounts
    useEffect(() => {
        if (orderId) {
            fetchOrderData();
        }
    }, [orderId, query]);

    // Handle quantity changes
    const handleQuantityChange = (lineItemId: string, newQuantity: string) => {
        const quantity = parseInt(newQuantity) || 0;
        setQuantities(prev => ({
            ...prev,
            [lineItemId]: Math.max(0, quantity) // Ensure non-negative
        }));
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
            setError('Failed to update order');
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
                        Order Total: {orderData.totalPriceSet.presentmentMoney.amount} {orderData.totalPriceSet.presentmentMoney.currencyCode}
                    </TextBlock>

                    <TextBlock emphasis="bold">Order Items:</TextBlock>

                    {orderData.lineItems.nodes.map((item) => (
                        <BlockStack key={item.id} spacing="tight" border="base" padding="base">
                            <InlineStack spacing="base" blockAlignment="center">
                                {item.variant?.image?.url && (
                                    <Image
                                        source={item.variant.image.url}
                                        alt={item.title}
                                        aspectRatio={1}
                                        fit="cover"
                                        width={60}
                                    />
                                )}

                                <BlockStack spacing="tight" flex={1}>
                                    <TextBlock emphasis="bold">{item.title}</TextBlock>
                                    {item.variant?.title && (
                                        <TextBlock size="small">{item.variant.title}</TextBlock>
                                    )}
                                    <TextBlock size="small">
                                        Price: {item.currentTotalPrice.amount} {item.currentTotalPrice.currencyCode}
                                    </TextBlock>
                                </BlockStack>

                                <BlockStack spacing="tight">
                                    <TextBlock size="small">Quantity:</TextBlock>
                                    <TextField
                                        label="Quantity"
                                        value={quantities[item.id]?.toString() || '0'}
                                        onChange={(value) => handleQuantityChange(item.id, value)}
                                        type="number"
                                        min={0}
                                    />
                                </BlockStack>
                            </InlineStack>
                        </BlockStack>
                    ))}

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
