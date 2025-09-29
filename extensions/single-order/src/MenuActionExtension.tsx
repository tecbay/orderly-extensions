import {Button, reactExtension, useApi} from "@shopify/ui-extensions-react/customer-account";
import {useEffect} from "react";

export default reactExtension(
    "customer-account.order.action.menu-item.render", (api) => {
        console.log('MenuActionItemExtension API:', api);

        return <MenuActionItemExtension orderId={api.orderId} />;
    }
);

function MenuActionItemExtension({ orderId }: { orderId: string }) {
    const { navigation } = useApi<"customer-account.order.action.menu-item.render">();

    useEffect(() => {
        console.log('MenuActionItemExtension orderId:', orderId);
    }, [orderId]);

    const handleEditClick = () => {
        // Extract integer ID from GraphQL ID format (gid://shopify/Order/123456 -> 123456)
        const integerOrderId = orderId.split('/').pop();

        // Navigate to the specific order page using shopify:customer-account protocol
        navigation.navigate(`shopify:customer-account/orders/${integerOrderId}`);
    };

    return <Button onPress={handleEditClick}>Edit</Button>;
}
