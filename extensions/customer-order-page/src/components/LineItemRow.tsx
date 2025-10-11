import {
    BlockStack,
    Grid,
    GridItem,
    TextBlock,
    TextField,
    Button,
    Icon,
    Divider,
    InlineStack,
    Badge
} from "@shopify/ui-extensions-react/customer-account";

interface LineItemRowProps {
    item: any;
    quantity: number;
    onQuantityChange: (value: string) => void;
    onRemove: () => void;
    disabled: boolean;
    isNew?: boolean;
}

export function LineItemRow({
    item,
    quantity,
    onQuantityChange,
    onRemove,
    disabled,
    isNew = false
}: LineItemRowProps) {
    const getItemTitle = () => {
        if (isNew) {
            return item.variant?.productTitle || item.productTitle;
        }
        return item.merchandise?.title;
    };

    const getItemPrice = () => {
        if (isNew) {
            return {
                amount: item.variant?.price?.amount || item.price?.amount,
                currency: item.variant?.price?.currencyCode || item.price?.currencyCode
            };
        }
        return {
            amount: item.price?.amount || item.cost?.totalAmount?.amount,
            currency: item.price?.currencyCode || item.cost?.totalAmount?.currencyCode
        };
    };

    const price = getItemPrice();

    return (
        <BlockStack spacing="tight">
            <Grid
                columns={{
                    default: ['fill'],
                    conditionals: [{
                        conditions: { viewportInlineSize: { min: 'small' } },
                        value: ['fill', 'auto', 'auto']
                    }]
                }}
                spacing="base"
                blockAlignment="center"
            >
                <GridItem>
                    <BlockStack spacing="extraTight">
                        {isNew && (
                            <InlineStack spacing={'base'} blockAlignment={'center'} inlineAlignment={'start'}>
                                <TextBlock appearance="subdued" size="small">
                                    {getItemTitle()}
                                </TextBlock>
                                <Badge size={'small'} tone={'success'}>New</Badge>
                            </InlineStack>
                        )}
                        {!isNew && getItemTitle() && (
                            <TextBlock appearance="subdued" size="small">
                                {getItemTitle()}
                            </TextBlock>
                        )}
                        {isNew && item.variant?.variantTitle && (
                            <TextBlock appearance="subdued" size="small">
                                {item.variant.variantTitle}
                            </TextBlock>
                        )}
                        <TextBlock size="small" appearance="subdued">
                            {price.amount} {price.currency}
                        </TextBlock>
                    </BlockStack>
                </GridItem>
                <GridItem>
                    <TextField
                        label="Qty"
                        type="number"
                        value={quantity.toString()}
                        onChange={onQuantityChange}
                        disabled={disabled}
                    />
                </GridItem>
                <GridItem>
                    <Button
                        kind="plain"
                        accessibilityLabel="Remove item"
                        disabled={disabled}
                        onPress={onRemove}
                    >
                        <Icon source="delete"/>
                    </Button>
                </GridItem>
            </Grid>
            <Divider/>
        </BlockStack>
    );
}
