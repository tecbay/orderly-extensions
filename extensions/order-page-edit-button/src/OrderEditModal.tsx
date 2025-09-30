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

// TypeScript interfaces for Customer Account API
interface LineItem {
    id: string;
    name: string;
    title: string;
    quantity: number;
    variantId?: string;
    variantTitle?: string;
    price?: {
        amount: string;
        currencyCode: string;
    };
    totalPrice?: {
        amount: string;
        currencyCode: string;
    };
    image?: {
        url: string;
        altText?: string;
    };
}

interface OrderData {
    id: string;
    name: string;
    createdAt: string;
    financialStatus?: string;
    fulfillmentStatus: string;
    edited: boolean;
    lineItems: {
        nodes: LineItem[];
    };
    totalPrice: {
        amount: string;
        currencyCode: string;
    };
    subtotal?: {
        amount: string;
        currencyCode: string;
    };
    totalTax?: {
        amount: string;
        currencyCode: string;
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
    // GraphQL query for Customer Account API
    const orderQuery = {
        query: `
        query GetOrder($orderId: ID!) {
          order(id: $orderId) {
            id
            name
            createdAt
            financialStatus
            edited
            totalPrice {
              amount
              currencyCode
            }
            subtotal {
              amount
              currencyCode
            }
            totalTax {
              amount
              currencyCode
            }
            lineItems(first: 50) {
              nodes {
                id
                name
                title
                quantity
                variantId
                variantTitle
                price {
                  amount
                  currencyCode
                }
                totalPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      `,
        variables: {
            orderId: orderId
        }
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

            if (response.errors) {
                console.error('GraphQL errors:', response.errors);
                setError('Failed to load order data. Please ensure protected customer data access is enabled.');
                return;
            }

            if (response.data?.order) {
                const order = response.data.order;
                setOrderData(order);

                // Initialize quantities with current order quantities
                const initialQuantities: Record<string, number> = {};
                order.lineItems.nodes.forEach((item: LineItem) => {
                    initialQuantities[item.id] = item.quantity;
                });
                setQuantities(initialQuantities);
            } else {
                setError('Order not found');
            }
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
                        Order Total: {orderData.totalPrice.amount} {orderData.totalPrice.currencyCode}
                    </TextBlock>

                    {orderData.subtotal && (
                        <TextBlock size="small">
                            Subtotal: {orderData.subtotal.amount} {orderData.subtotal.currencyCode}
                        </TextBlock>
                    )}

                    {orderData.totalTax && (
                        <TextBlock size="small">
                            Tax: {orderData.totalTax.amount} {orderData.totalTax.currencyCode}
                        </TextBlock>
                    )}

                    <TextBlock emphasis="bold">Order Items:</TextBlock>

                    {orderData.lineItems.nodes.map((item) => (
                        <BlockStack key={item.id} spacing="tight" border="base" padding="base">
                            <InlineStack spacing="base" blockAlignment="center">
                                {item.image?.url && (
                                    <Image
                                        source={item.image.url}
                                        alt={item.image.altText || item.name}
                                        aspectRatio={1}
                                        fit="cover"
                                        width={60}
                                    />
                                )}

                                <BlockStack spacing="tight" flex={1}>
                                    <TextBlock emphasis="bold">{item.name}</TextBlock>
                                    {item.variantTitle && (
                                        <TextBlock size="small">{item.variantTitle}</TextBlock>
                                    )}
                                    {item.totalPrice && (
                                        <TextBlock size="small">
                                            Total: {item.totalPrice.amount} {item.totalPrice.currencyCode}
                                        </TextBlock>
                                    )}
                                    {item.price && (
                                        <TextBlock size="small">
                                            Unit Price: {item.price.amount} {item.price.currencyCode}
                                        </TextBlock>
                                    )}
                                </BlockStack>

                                <BlockStack spacing="tight">
                                    <TextBlock size="small">Quantity:</TextBlock>
                                    <TextField
                                        label="Quantity"
                                        value={quantities[item.id]?.toString() || item.quantity.toString()}
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
