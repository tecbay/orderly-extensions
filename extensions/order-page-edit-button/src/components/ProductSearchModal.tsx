import { useState } from "react";
import {
    BlockStack,
    InlineStack,
    TextBlock,
    TextField,
    Image,
    Button,
    Spinner,
    Banner,
} from "@shopify/ui-extensions-react/customer-account";
import { useProductSearch } from "../hooks/useProductSearch";
import { VariantWithProduct } from "../types";

interface ProductSearchModalProps {
    onVariantSelect: (variant: VariantWithProduct, quantity: number) => void;
    onClose: () => void;
}

export function ProductSearchModal({ onVariantSelect, onClose }: ProductSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({});
    const { variants, isSearching, searchError, debouncedSearch } = useProductSearch(true);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const handleQuantityChange = (variantId: string, delta: number) => {
        setVariantQuantities(prev => {
            const currentQty = prev[variantId] || 0;
            const newQty = Math.max(0, currentQty + delta);
            return {
                ...prev,
                [variantId]: newQty
            };
        });
    };

    const getVariantQuantity = (variantId: string) => {
        return variantQuantities[variantId] || 0;
    };

    return (
        <BlockStack spacing="base">
            <TextField
                label="Search products"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Type to search..."
            />

            {searchError && (
                <Banner status="critical">
                    {searchError}
                </Banner>
            )}

            {isSearching && (
                <BlockStack spacing="tight" blockAlignment="center">
                    <Spinner />
                    <TextBlock>Loading products...</TextBlock>
                </BlockStack>
            )}

            {!isSearching && variants.length === 0 && searchQuery && (
                <Banner status="info">
                    No variants found. Try a different search term.
                </Banner>
            )}

            {!isSearching && variants.length > 0 && (
                <BlockStack spacing="tight">
                    {variants.map((variant) => {
                        const quantity = getVariantQuantity(variant.variantId);
                        return (
                            <BlockStack
                                key={variant.variantId}
                                border="base"
                                padding="base"
                                cornerRadius="base"
                            >
                                <InlineStack spacing="base" blockAlignment="center">
                                    {/* Variant Image */}
                                    {variant.image?.url ? (
                                        <Image
                                            source={variant.image.url}
                                            alt={variant.image.altText || variant.productTitle}
                                            aspectRatio={1}
                                            fit="cover"
                                            width={60}
                                            borderRadius="base"
                                        />
                                    ) : (
                                        <BlockStack
                                            minInlineSize={60}
                                            minBlockSize={60}
                                            border="base"
                                            cornerRadius="base"
                                            blockAlignment="center"
                                            inlineAlignment="center"
                                        >
                                            <TextBlock size="small" appearance="subdued">No image</TextBlock>
                                        </BlockStack>
                                    )}

                                    {/* Variant Info */}
                                    <BlockStack spacing="extraTight" flex={1}>
                                        <TextBlock emphasis="bold">
                                            {variant.productTitle}
                                        </TextBlock>
                                        {variant.variantTitle !== "Default Title" && (
                                            <TextBlock size="small" appearance="subdued">
                                                {variant.variantTitle}
                                            </TextBlock>
                                        )}
                                        <TextBlock size="small" appearance="subdued">
                                            {parseFloat(variant.price.amount).toFixed(2)}{" "}
                                            {variant.price.currencyCode}
                                            {variant.sku && ` • SKU: ${variant.sku}`}
                                        </TextBlock>
                                    </BlockStack>

                                    {/* Quantity Controls */}
                                    <InlineStack spacing="tight" blockAlignment="center">
                                        <Button
                                            onPress={() => handleQuantityChange(variant.variantId, -1)}
                                            disabled={quantity === 0}
                                            kind="secondary"
                                        >
                                            −
                                        </Button>
                                        <TextBlock emphasis="bold" size="medium">{quantity}</TextBlock>
                                        <Button
                                            onPress={() => handleQuantityChange(variant.variantId, 1)}
                                            kind="secondary"
                                        >
                                            +
                                        </Button>
                                    </InlineStack>
                                </InlineStack>
                            </BlockStack>
                        );
                    })}
                </BlockStack>
            )}
        </BlockStack>
    );
}