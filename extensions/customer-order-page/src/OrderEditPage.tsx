import {
    reactExtension,
    Page,
    BlockStack,
    TextBlock,
    useApi,
    useOrder,
    useNavigation,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension("customer-account.order.page.render", () => <OrderPage />);

function OrderPage() {
    const order = useOrder();
    const navigate = useNavigation();
    const {query} = useApi();

    if (!order) {
        return <TextBlock>Loading order...</TextBlock>;
    }
    console.log("order", order);
    return (
        <Page title={`Order #${order.name}`}>
            <BlockStack spacing="loose">
                <TextBlock>Order Status: {order.processedAt}</TextBlock>
                <TextBlock>Order Status: {order.id}</TextBlock>
                <TextBlock>Order confirmationNumber: {order.confirmationNumber}</TextBlock>

                <TextBlock>Miraj</TextBlock>
            </BlockStack>
        </Page>
    );
}
