import { useState, useEffect, useRef } from "react";
import { Product } from "../types";
import { SEARCH_PRODUCTS_QUERY } from "../utils/queries";

export function useProductSearch(initialFetch = true) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Fetch initial products on mount
    useEffect(() => {
        if (initialFetch) {
            searchProducts("");
        }
    }, [initialFetch]);

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
                        query: SEARCH_PRODUCTS_QUERY,
                        variables: {
                            query: query.trim() || "*",
                            first: 20
                        }
                    }),
                }
            );

            console.log('Fetch response status:', result.status);
            const response = await result.json();
            console.log('Product search response:', response);

            if (response.errors) {
                console.error('GraphQL errors:', response.errors);
                setSearchError(`Failed to search products: ${response.errors[0]?.message || 'Unknown error'}`);
                return;
            }

            if (response.data?.products?.edges) {
                const products = response.data.products.edges.map((edge: any) => edge.node);
                console.log('Found products:', products.length);
                setProducts(products);
            } else {
                console.log('No products found in response');
                setProducts([]);
            }
        } catch (err) {
            console.error('Error searching products:', err);
            setSearchError(`Failed to search products: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setProducts([]);
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
        products,
        isSearching,
        searchError,
        searchProducts,
        debouncedSearch
    };
}