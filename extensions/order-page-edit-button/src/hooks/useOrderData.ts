import { useState, useEffect } from "react";
import { OrderData } from "../types";
import { ORDER_QUERY } from "../utils/queries";

export function useOrderData(orderId: string) {
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const orderQuery = {
        query: ORDER_QUERY,
        variables: {
            orderId: orderId
        }
    };

    async function fetchOrderData() {
        try {
            setIsLoading(true);
            setError(null);

            const result = await fetch(
                "shopify://customer-account/api/2024-10/graphql.json",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderQuery),
                }
            );

            const response = await result.json();

            if (response.errors) {
                console.error('GraphQL errors:', response.errors);
                setError('Failed to load order data. Please ensure protected customer data access is enabled.');
                return;
            }

            if (response.data?.order) {
                const order = response.data.order;
                setOrderData(order);

                // Initialize quantities with current order quantities
                const initialQuantities: Record<string, number> = {};
                order.lineItems.nodes.forEach((item: any) => {
                    initialQuantities[item.id] = item.quantity;
                });
                setQuantities(initialQuantities);
            } else {
                setError('Order not found');
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to load order data. Please ensure protected customer data access is enabled.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (orderId) {
            fetchOrderData();
        }
    }, [orderId]);

    return {
        orderData,
        quantities,
        setQuantities,
        isLoading,
        error,
        refetch: fetchOrderData
    };
}