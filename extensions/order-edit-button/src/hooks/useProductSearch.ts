import { useState, useEffect, useRef } from "react";
import { VariantWithProduct } from "../types";
import { SEARCH_VARIANTS_QUERY } from "../utils/queries";

export function useProductSearch(initialFetch = true) {
    const [variants, setVariants] = useState<VariantWithProduct[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    // @ts-ignore
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Fetch initial products on mount
    useEffect(() => {
        if (initialFetch) {
            searchProducts("");
        }
    }, [initialFetch]);

    // @ts-ignore
    async function searchProducts(query: string) {
        console.log('Searching for products with query:', query || '(all products)');

        try {
            setIsSearching(true);
            setSearchError(null);

            const result = await fetch(
                "shopify://storefront/api/2024-10/graphql.json",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: SEARCH_VARIANTS_QUERY,
                        variables: {
                            query: query.trim() || "*",
                            first: 20
                        }
                    }),
                }
            );

            console.log('Fetch response status:', result.status);
            const response = await result.json();
            console.log('Variant search response:', response);

            if (response.errors) {
                console.error('GraphQL errors:', response.errors);
                setSearchError(`Failed to search products: ${response.errors[0]?.message || 'Unknown error'}`);
                return;
            }

            if (response.data?.predictiveSearch?.products) {
                // Flatten variants from all products
                // Each variant now contains its own product reference
                const allVariants: VariantWithProduct[] = [];
                response.data.predictiveSearch.products.forEach((product: any) => {
                    product.variants.edges.forEach((variantEdge: any) => {
                        const variant = variantEdge.node;
                        // Use variant's own product reference if available, fallback to parent
                        const variantProduct = variant.product || product;
                        allVariants.push({
                            variantId: variant.id,
                            variantTitle: variant.title,
                            productId: variantProduct.id,
                            productTitle: variantProduct.title,
                            price: variant.price,
                            availableForSale: variant.availableForSale,
                            image: variant.image || product.featuredImage,
                            sku: variant.sku
                        });
                    });
                });
                console.log('Found variants:', allVariants.length);
                setVariants(allVariants);
            } else {
                console.log('No products/variants found in response');
                setVariants([]);
            }
        } catch (err) {
            console.error('Error searching products:', err);
            setSearchError(`Failed to search products: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setVariants([]);
        } finally {
            setIsSearching(false);
        }
    }

    function debouncedSearch(query: string, delay: number = 500) {
        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
            searchProducts(query);
        }, delay);
    }

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return {
        variants,
        isSearching,
        searchError,
        searchProducts,
        debouncedSearch
    };
}
