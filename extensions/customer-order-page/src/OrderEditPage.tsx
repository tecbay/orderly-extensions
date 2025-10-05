import {
    reactExtension,
    Page,
    BlockStack,
    TextBlock,
    useOrder,

} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension("customer-account.order.page.render",
    (api) => <OrderPage />);

function OrderPage() {
    const order = useOrder();

    if (!order) {
        return (
            <Page title="Loading...">
                <TextBlock>Loading order...</TextBlock>
            </Page>
        );
    }

    console.log("Order data:", order);

    return (
        <Page title={`Edit Order #${order.name}`}>
            <BlockStack spacing="loose">
                <TextBlock>Order ID: {order.id}</TextBlock>
                <TextBlock>Order Number: {order.name}</TextBlock>
                <TextBlock>Confirmation Number: {order.confirmationNumber}</TextBlock>
                <TextBlock>You can now build your order editing UI here!</TextBlock>
            </BlockStack>
        </Page>
    );
}
