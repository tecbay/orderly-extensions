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
    onProductSelect: (product: Product) => void;
    onClose: () => void;
}

export function ProductSearchModal({ onProductSelect, onClose }: ProductSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const { products, isSearching, searchError, debouncedSearch } = useProductSearch(true);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearch(value);
    };

    return (
        <BlockStack spacing="large">
            <BlockStack spacing="base">
                <TextBlock emphasis="bold" size="large">Add Product</TextBlock>
                <TextField
                    label="Search products"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Type to search..."
                />
            </BlockStack>

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
                <BlockStack spacing="base">
                    <TextBlock emphasis="bold" size="medium">
                        {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                    </TextBlock>
                    <BlockStack spacing="base">
                        {products.map((product) => (
                            <BlockStack
                                key={product.id}
                                border="base"
                                padding="base"
                                cornerRadius="base"
                            >
                                <InlineStack spacing="base" blockAlignment="center">
                                    {/* Product Image */}
                                    <BlockStack>
                                        {product.featuredImage?.url ? (
                                            <Image
                                                source={product.featuredImage.url}
                                                alt={product.featuredImage.altText || product.title}
                                                aspectRatio={1}
                                                fit="cover"
                                                width={80}
                                                borderRadius="base"
                                            />
                                        ) : (
                                            <BlockStack
                                                padding="large"
                                                border="base"
                                                cornerRadius="base"
                                                blockAlignment="center"
                                                inlineAlignment="center"
                                            >
                                                <TextBlock size="small">No image</TextBlock>
                                            </BlockStack>
                                        )}
                                    </BlockStack>

                                    {/* Product Info */}
                                    <BlockStack spacing="extraTight" flex={1}>
                                        <TextBlock emphasis="bold" size="medium">
                                            {product.title}
                                        </TextBlock>
                                        <TextBlock size="base" appearance="subdued">
                                            {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}{" "}
                                            {product.priceRange.minVariantPrice.currencyCode}
                                        </TextBlock>
                                        {product.variants?.edges && product.variants.edges.length > 0 && (
                                            <TextBlock size="small" appearance="subdued">
                                                {product.variants.edges.length} variant{product.variants.edges.length !== 1 ? 's' : ''}
                                            </TextBlock>
                                        )}
                                    </BlockStack>

                                    {/* Add Button */}
                                    <Button
                                        onPress={() => onProductSelect(product)}
                                        kind="primary"
                                    >
                                        Add
                                    </Button>
                                </InlineStack>
                            </BlockStack>
                        ))}
                    </BlockStack>
                </BlockStack>
            )}
        </BlockStack>
    );
}