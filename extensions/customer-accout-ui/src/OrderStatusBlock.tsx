import {
    BlockStack,
    reactExtension,
    TextBlock,
    Banner,
    useApi,
    useOrder
} from "@shopify/ui-extensions-react/customer-account";
import {useEffect} from "react";

export default reactExtension(
    "customer-account.order-status.block.render",
    () => <PromotionBanner/>
);

function PromotionBanner() {
    const {i18n} = useApi();
    const order = useOrder();

    useEffect(() => {
        console.log(order);
    }, [order]);

    return (
        <Banner>
            <BlockStack inlineAlignment="center">
                <TextBlock>
                    {i18n.translate("earnPoints")}
                </TextBlock>
            </BlockStack>
        </Banner>
    );
}
