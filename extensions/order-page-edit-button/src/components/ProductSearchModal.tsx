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
import { Product } from "../types";

interface ProductSearchModalProps {
    onProductSelect: (product: Product, quantity: number) => void;
    onClose: () => void;
}

export function ProductSearchModal({ onProductSelect, onClose }: ProductSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
    const { products, isSearching, searchError, debouncedSearch } = useProductSearch(true);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const handleQuantityChange = (productId: string, delta: number) => {
        setProductQuantities(prev => {
            const currentQty = prev[productId] || 0;
            const newQty = Math.max(0, currentQty + delta);
            return {
                ...prev,
                [productId]: newQty
            };
        });
    };

    const getProductQuantity = (productId: string) => {
        return productQuantities[productId] || 0;
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

            {!isSearching && products.length === 0 && searchQuery && (
                <Banner status="info">
                    No products found. Try a different search term.
                </Banner>
            )}

            {!isSearching && products.length > 0 && (
                <BlockStack spacing="tight">
                    {products.map((product) => {
                        const quantity = getProductQuantity(product.id);
                        return (
                            <BlockStack
                                key={product.id}
                                border="base"
                                padding="tight"
                                cornerRadius="base"
                            >
                                <InlineStack spacing="tight" blockAlignment="center">
                                    {/* Product Image */}
                                    {product.featuredImage?.url ? (
                                        <Image
                                            source={product.featuredImage.url}
                                            alt={product.featuredImage.altText || product.title}
                                            aspectRatio={1}
                                            fit="cover"
                                            width={60}
                                            borderRadius="base"
                                        />
                                    ) : (
                                        <BlockStack
                                            padding="base"
                                            border="base"
                                            cornerRadius="base"
                                            blockAlignment="center"
                                            inlineAlignment="center"
                                        >
                                            <TextBlock size="small">No image</TextBlock>
                                        </BlockStack>
                                    )}

                                    {/* Product Info */}
                                    <BlockStack spacing="none" flex={1}>
                                        <TextBlock emphasis="bold">
                                            {product.title}
                                        </TextBlock>
                                        <TextBlock size="small" appearance="subdued">
                                            {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}{" "}
                                            {product.priceRange.minVariantPrice.currencyCode}
                                        </TextBlock>
                                    </BlockStack>

                                    {/* Quantity Controls */}
                                    <InlineStack spacing="extraTight" blockAlignment="center">
                                        <Button
                                            onPress={() => handleQuantityChange(product.id, -1)}
                                            disabled={quantity === 0}
                                        >
                                            -
                                        </Button>
                                        <BlockStack minInlineSize={40} blockAlignment="center" inlineAlignment="center">
                                            <TextBlock emphasis="bold">{quantity}</TextBlock>
                                        </BlockStack>
                                        <Button
                                            onPress={() => handleQuantityChange(product.id, 1)}
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