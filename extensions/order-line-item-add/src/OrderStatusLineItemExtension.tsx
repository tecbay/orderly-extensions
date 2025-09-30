import {
    BlockStack,
    reactExtension,
    TextBlock,
    Banner,
    useApi
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
    "customer-account.order-status.cart-line-item.render-after",
    (api) => <PromotionBanner api={api}/>
);

function PromotionBanner({api}) {
    const {lines} = useApi<'customer-account.order-status.cart-line-item.render-after'>();

    console.log('asdfadsfa', lines.current)
    return (
        <Banner>
            <BlockStack inlineAlignment="center">
                {/*{lines.current}*/}
                <TextBlock>
                    asd
                </TextBlock>
            </BlockStack>
        </Banner>
    );
}
