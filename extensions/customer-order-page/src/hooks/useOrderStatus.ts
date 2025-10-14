import { useState, useEffect } from "react";
import { config } from "../../../shared/config";

const API_BASE_URL = config.API_BASE_URL;

export interface OrderStatus {
    financialStatus: string | null;
    fulfillmentStatus: string | null;
    createdAt: string | null;
}

export interface MoneyAmount {
    amount: string;
    currencyCode: string;
}

export interface PriceSet {
    presentmentMoney: MoneyAmount;
    shopMoney: MoneyAmount;
}

export interface LineItem {
    id: string;
    quantity: number;
    title: string;
    canRestock: boolean;
    currentQuantity: number;
    fulfillableQuantity: number;
    fulfillmentStatus: string;
    isGiftCard: boolean;
    sku: string | null;
    variantTitle: string | null;
    unfulfilledQuantity: number;
    nonFulfillableQuantity: number;
}

export interface OrderResponse {
    success: boolean;
    order: {
        id: string;
        name: string;
        cancelReason: string | null;
        email: string;
        edited: boolean;
        confirmed: boolean;
        createdAt: string;
        currencyCode: string;
        refundable: boolean;
        totalPrice: string;
        totalRefunded: string;
        unpaid: boolean;
        updatedAt: string;
        lineItems: LineItem[];
        totalPriceSet: PriceSet;
    };
}

export function useOrderStatus(orderId: string, sessionToken: any) {
    const [orderStatus, setOrderStatus] = useState<OrderStatus>({
        financialStatus: null,
        fulfillmentStatus: null,
        createdAt: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Calculate overall order fulfillment status from line items
     */
    function calculateFulfillmentStatus(lineItems: LineItem[]): string {
        if (!lineItems || lineItems.length === 0) {
            return 'unfulfilled';
        }

        const statuses = lineItems.map(item => item.fulfillmentStatus.toLowerCase());
        const allFulfilled = statuses.every(status => status === 'fulfilled');
        const noneFulfilled = statuses.every(status => status === 'unfulfilled');

        if (allFulfilled) {
            return 'fulfilled';
        } else if (noneFulfilled) {
            return 'unfulfilled';
        } else {
            return 'partial';
        }
    }

    async function fetchOrderStatus() {
        try {
            setIsLoading(true);
            setError(null);

            const token = await sessionToken.get();
            const result = await fetch(
                `${API_BASE_URL}/orders?order_gid=${encodeURIComponent(orderId)}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                }
            );

            if (!result.ok) {
                const errorData = await result.text();
                console.error('Failed to fetch order status:', errorData);
                throw new Error(`Failed to fetch order status: ${result.statusText}`);
            }

            const response: OrderResponse = await result.json();

            console.log('Order status response:', JSON.stringify(response, null, 2));

            if (response.success && response.order) {
                const order = response.order;
                setOrderStatus({
                    financialStatus: null, // Backend doesn't provide this yet
                    fulfillmentStatus: calculateFulfillmentStatus(order.lineItems),
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
        if (orderId && sessionToken) {
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
