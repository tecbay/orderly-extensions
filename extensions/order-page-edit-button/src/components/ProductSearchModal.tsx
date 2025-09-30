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
        <BlockStack spacing="base">
            <TextBlock emphasis="bold" size="large">Search Products</TextBlock>

            <TextField
                label="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for products..."
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
                    <TextBlock emphasis="bold">Results:</TextBlock>
                    {products.map((product) => (
                        <BlockStack
                            key={product.id}
                            spacing="tight"
                            border="base"
                            padding="base"
                        >
                            <InlineStack spacing="base" blockAlignment="center">
                                {product.featuredImage?.url && (
                                    <Image
                                        source={product.featuredImage.url}
                                        alt={product.featuredImage.altText || product.title}
                                        aspectRatio={1}
                                        fit="cover"
                                        width={60}
                                    />
                                )}

                                <BlockStack spacing="tight" flex={1}>
                                    <TextBlock emphasis="bold">{product.title}</TextBlock>
                                    <TextBlock size="small">
                                        Price: {product.priceRange.minVariantPrice.amount}{" "}
                                        {product.priceRange.minVariantPrice.currencyCode}
                                    </TextBlock>
                                </BlockStack>

                                <Button onPress={() => onProductSelect(product)}>
                                    Add
                                </Button>
                            </InlineStack>
                        </BlockStack>
                    ))}
                </BlockStack>
            )}
        </BlockStack>
    );
}