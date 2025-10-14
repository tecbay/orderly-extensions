import { useState } from "react";
import {
    BlockStack,
    InlineStack,
    TextBlock,
    TextField,
    Checkbox,
    Spinner,
    Banner,
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

    // Track which variants are currently selected
    const selectedVariantIds = new Set(selectedVariants.map(sv => sv.variant.variantId));

    // Check if a variant is selected
    const isVariantSelected = (variantId: string) => selectedVariantIds.has(variantId);

    // Check if any variant of a product is selected (UI hack - keeps parent checked if any variant is selected)
    const isProductSelected = (productId: string) => {
        const productVariantsList = groupedProducts[productId];
        if (!productVariantsList || productVariantsList.length === 0) return false;
        return productVariantsList.some(v => isVariantSelected(v.variantId));
    };

    // Check if all variants of a product are selected
    const isProductFullySelected = (productId: string) => {
        const productVariantsList = groupedProducts[productId];
        if (!productVariantsList || productVariantsList.length === 0) return false;
        return productVariantsList.every(v => isVariantSelected(v.variantId));
    };

    // Toggle a single variant
    const handleVariantToggle = (variant: VariantWithProduct) => {
        if (isVariantSelected(variant.variantId)) {
            onVariantDelete(variant.variantId);
        } else {
            onVariantSelect(variant, 1);
        }
    };

    // Toggle all variants of a product
    const handleProductToggle = (productId: string) => {
        const productVariantsList = groupedProducts[productId];
        if (!productVariantsList || productVariantsList.length === 0) return;

        const isAnySelected = isProductSelected(productId);

        if (isAnySelected) {
            // Uncheck all variants
            productVariantsList.forEach(variant => {
                if (isVariantSelected(variant.variantId)) {
                    onVariantDelete(variant.variantId);
                }
            });
        } else {
            // Check all variants
            productVariantsList.forEach(variant => {
                if (!isVariantSelected(variant.variantId)) {
                    onVariantSelect(variant, 1);
                }
            });
        }
    };

    return (
        <BlockStack spacing="base">
            {/* Search Section */}
            <TextField
                label="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
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
                        const isSelected = isProductSelected(productId);

                        return (
                            <BlockStack
                                key={productId}
                                border="base"
                                padding="base"
                                cornerRadius="base"
                                spacing="tight"
                            >
                                {/* Product Row */}
                                <InlineStack spacing="base" blockAlignment="center">
                                    <Checkbox
                                        checked={isSelected}
                                        onChange={() => handleProductToggle(productId)}
                                    />
                                    <BlockStack spacing="extraTight">
                                        <TextBlock emphasis="bold">{firstVariant.productTitle}</TextBlock>
                                        <TextBlock size="small" appearance="subdued">
                                            {hasMultipleVariants ? `${productVariants.length} variants` : 'Single variant'}
                                            {' • '}
                                            {parseFloat(firstVariant.price.amount).toFixed(2)}{" "}
                                            {firstVariant.price.currencyCode}
                                        </TextBlock>
                                    </BlockStack>
                                </InlineStack>

                                {/* Variants List - Always show for multiple variants */}
                                {hasMultipleVariants && (
                                    <BlockStack spacing="tight" inlineAlignment="start">
                                        {productVariants.map((variant) => (
                                            <InlineStack
                                                key={variant.variantId}
                                                spacing="base"
                                                blockAlignment="center"
                                                inlineAlignment="start"
                                            >
                                                <TextBlock>    </TextBlock>
                                                <Checkbox
                                                    checked={isVariantSelected(variant.variantId)}
                                                    onChange={() => handleVariantToggle(variant)}
                                                />
                                                <BlockStack spacing="extraTight">
                                                    <TextBlock>
                                                        {variant.variantTitle === "Default Title"
                                                            ? variant.productTitle
                                                            : variant.variantTitle}
                                                    </TextBlock>
                                                    <TextBlock size="small" appearance="subdued">
                                                        {parseFloat(variant.price.amount).toFixed(2)}{" "}
                                                        {variant.price.currencyCode}
                                                        {variant.sku && ` • SKU: ${variant.sku}`}
                                                    </TextBlock>
                                                </BlockStack>
                                            </InlineStack>
                                        ))}
                                    </BlockStack>
                                )}

                                {/* For single variant products, show variant details */}
                                {!hasMultipleVariants && firstVariant.sku && (
                                    <TextBlock size="small" appearance="subdued">
                                        SKU: {firstVariant.sku}
                                    </TextBlock>
                                )}
                            </BlockStack>
                        );
                    })}
                </BlockStack>
            )}
        </BlockStack>
    );
}
