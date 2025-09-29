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

    // For modal to work, the button should NOT have onPress - Shopify automatically opens the modal
    return <Button>Edit</Button>;
}
