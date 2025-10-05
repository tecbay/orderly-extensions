import {
    reactExtension,
    Page,
    BlockStack,
    TextBlock,
    useApi,
    useOrder,
    useNavigation,

} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension("customer-account.order.page.render",
    (api) => <OrderPage api={api}/>);

function OrderPage({api}) {
    console.log('shopify.extension', shopify.extension)

    const order = useOrder();
    const navigate = useNavigation();
    const {query} = useApi();

    if (!order) {
        return <TextBlock>Loading order...</TextBlock>;
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
