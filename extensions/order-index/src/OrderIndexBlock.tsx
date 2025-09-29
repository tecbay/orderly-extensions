import {
  BlockStack,
  reactExtension,
  TextBlock,
  Banner,
  useApi
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order-index.block.render",
  () => <OrderIndexBanner />
);

function OrderIndexBanner() {
  const { i18n } = useApi();

  return (
    <Banner>
      <BlockStack inlineAlignment="center" >
        <TextBlock>
          Welcome to your order history! {i18n.translate("earnPoints")}
        </TextBlock>
      </BlockStack>
    </Banner>
  );
}