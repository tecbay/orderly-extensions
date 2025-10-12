import { useState, useEffect } from "react";
import { ORDER_STATUS_QUERY } from "../utils/queries";

interface OrderStatus {
    financialStatus: string | null;
    fulfillmentStatus: string | null;
    createdAt: string | null;
}

export function useOrderStatus(orderId: string) {
    const [orderStatus, setOrderStatus] = useState<OrderStatus>({
        financialStatus: null,
        fulfillmentStatus: null,
        createdAt: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const orderQuery = {
        query: ORDER_STATUS_QUERY,
        variables: {
            orderId: orderId
        }
    };

    async function fetchOrderStatus() {
        try {
            setIsLoading(true);
            setError(null);

            const result = await fetch(
                "shopify://customer-account/api/2025-07/graphql.json",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderQuery),
                }
            );

            const response = await result.json();

            console.log('Order status response:', JSON.stringify(response, null, 2));

            if (response.errors) {
                console.error('GraphQL errors:', response.errors);
                setError('Failed to load order status');
                return;
            }

            if (response.data?.order) {
                const order = response.data.order;
                setOrderStatus({
                    financialStatus: order.financialStatus || null,
                    fulfillmentStatus: order.fulfillmentStatus || null,
                    createdAt: order.createdAt || null
                });
            } else {
                setError('Order not found');
            }
        } catch (err) {
            console.error('Error fetching order status:', err);
            setError('Failed to load order status');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (orderId) {
            fetchOrderStatus();
        }
    }, [orderId]);

    return {
        orderStatus,
        isLoading,
        error,
        refetch: fetchOrderStatus
    };
}
