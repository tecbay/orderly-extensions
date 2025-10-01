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
    Select,
} from "@shopify/ui-extensions-react/customer-account";
import { useProductSearch } from "../hooks/useProductSearch";
import { VariantWithProduct } from "../types";

interface ProductSearchModalProps {
    onVariantSelect: (variant: VariantWithProduct, quantity: number) => void;
    onVariantDelete: (variantId: string) => void;
    selectedVariants: Array<{ variant: VariantWithProduct; quantity: number }>;
    onClose: () => void;
}

export function ProductSearchModal({ onVariantSelect, onVariantDelete, selectedVariants, onClose }: ProductSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [productVariants, setProductVariants] = useState<Record<string, VariantWithProduct[]>>({});
    const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, string>>({});
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const { variants, isSearching, searchError, debouncedSearch } = useProductSearch(true);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearch(value);
    };

    // Group variants by product
    const groupedProducts = variants.reduce((acc, variant) => {
        if (!acc[variant.productId]) {
            acc[variant.productId] = [];
        }
        acc[variant.productId].push(variant);
        return acc;
    }, {} as Record<string, VariantWithProduct[]>);

    const handleVariantSelect = (productId: string, variantId: string) => {
        setSelectedVariantIds(prev => ({
            ...prev,
            [productId]: variantId
        }));
    };

    const handleQuantityChange = (productId: string, delta: number) => {
        setQuantities(prev => {
            const currentQty = prev[productId] || 1;
            const newQty = Math.max(1, currentQty + delta);
            return {
                ...prev,
                [productId]: newQty
            };
        });
    };

    const handleAddVariant = (productId: string) => {
        const productVariantsList = groupedProducts[productId];
        if (!productVariantsList || productVariantsList.length === 0) return;

        const selectedVariantId = selectedVariantIds[productId] || productVariantsList[0].variantId;
        const variant = productVariantsList.find(v => v.variantId === selectedVariantId);

        if (variant) {
            const quantity = quantities[productId] || 1;
            onVariantSelect(variant, quantity);

            // Reset selection for this product
            setQuantities(prev => {
                const newQty = { ...prev };
                delete newQty[productId];
                return newQty;
            });
        }
    };

    return (
        <BlockStack spacing="base">
            {/* Selected Variants Section */}
            {selectedVariants.length > 0 && (
                <BlockStack spacing="tight">
                    <TextBlock emphasis="bold">Selected Items</TextBlock>
                    {selectedVariants.map(({ variant, quantity }) => (
                        <BlockStack
                            key={variant.variantId}
                            border="base"
                            padding="base"
                            cornerRadius="base"
                        >
                            <InlineStack spacing="base" blockAlignment="center">
                                {variant.image?.url ? (
                                    <Image
                                        source={variant.image.url}
                                        alt={variant.image.altText || variant.productTitle}
                                        aspectRatio={1}
                                        fit="cover"
                                        width={50}
                                        borderRadius="base"
                                    />
                                ) : (
                                    <BlockStack
                                        minInlineSize={50}
                                        minBlockSize={50}
                                        border="base"
                                        cornerRadius="base"
                                        blockAlignment="center"
                                        inlineAlignment="center"
                                    >
                                        <TextBlock size="small" appearance="subdued">No image</TextBlock>
                                    </BlockStack>
                                )}

                                <BlockStack spacing="extraTight" flex={1}>
                                    <TextBlock emphasis="bold">{variant.productTitle}</TextBlock>
                                    {variant.variantTitle !== "Default Title" && (
                                        <TextBlock size="small" appearance="subdued">
                                            {variant.variantTitle}
                                        </TextBlock>
                                    )}
                                    <TextBlock size="small" appearance="subdued">
                                        Qty: {quantity} × {parseFloat(variant.price.amount).toFixed(2)} {variant.price.currencyCode}
                                    </TextBlock>
                                </BlockStack>

                                <Button
                                    onPress={() => onVariantDelete(variant.variantId)}
                                    kind="secondary"
                                >
                                    Delete
                                </Button>
                            </InlineStack>
                        </BlockStack>
                    ))}
                </BlockStack>
            )}

            {/* Search Section */}
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
                    No products found. Try a different search term.
                </Banner>
            )}

            {!isSearching && Object.keys(groupedProducts).length > 0 && (
                <BlockStack spacing="tight">
                    {Object.entries(groupedProducts).map(([productId, productVariants]) => {
                        const firstVariant = productVariants[0];
                        const hasMultipleVariants = productVariants.length > 1;
                        const selectedVariantId = selectedVariantIds[productId] || firstVariant.variantId;
                        const selectedVariant = productVariants.find(v => v.variantId === selectedVariantId) || firstVariant;
                        const quantity = quantities[productId] || 1;

                        return (
                            <BlockStack
                                key={productId}
                                border="base"
                                padding="base"
                                cornerRadius="base"
                                spacing="tight"
                            >
                                <InlineStack spacing="base" blockAlignment="center">
                                    {selectedVariant.image?.url ? (
                                        <Image
                                            source={selectedVariant.image.url}
                                            alt={selectedVariant.image.altText || selectedVariant.productTitle}
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

                                    <BlockStack spacing="extraTight" flex={1}>
                                        <TextBlock emphasis="bold">{firstVariant.productTitle}</TextBlock>
                                        <TextBlock size="small" appearance="subdued">
                                            {parseFloat(selectedVariant.price.amount).toFixed(2)}{" "}
                                            {selectedVariant.price.currencyCode}
                                            {selectedVariant.sku && ` • SKU: ${selectedVariant.sku}`}
                                        </TextBlock>
                                    </BlockStack>
                                </InlineStack>

                                {/* Variant Selection - Only show if multiple variants */}
                                {hasMultipleVariants && (
                                    <Select
                                        label="Variant"
                                        value={selectedVariantId}
                                        onChange={(value) => handleVariantSelect(productId, value)}
                                        options={productVariants.map(v => ({
                                            value: v.variantId,
                                            label: v.variantTitle === "Default Title"
                                                ? v.productTitle
                                                : v.variantTitle
                                        }))}
                                    />
                                )}

                                {/* Quantity Controls */}
                                <InlineStack spacing="base" blockAlignment="center">
                                    <InlineStack spacing="tight" blockAlignment="center">
                                        <Button
                                            onPress={() => handleQuantityChange(productId, -1)}
                                            disabled={quantity === 1}
                                            kind="secondary"
                                        >
                                            −
                                        </Button>
                                        <TextBlock emphasis="bold" size="medium">{quantity}</TextBlock>
                                        <Button
                                            onPress={() => handleQuantityChange(productId, 1)}
                                            kind="secondary"
                                        >
                                            +
                                        </Button>
                                    </InlineStack>

                                    <Button
                                        onPress={() => handleAddVariant(productId)}
                                        kind="primary"
                                    >
                                        Add
                                    </Button>
                                </InlineStack>
                            </BlockStack>
                        );
                    })}
                </BlockStack>
            )}
        </BlockStack>
    );
}