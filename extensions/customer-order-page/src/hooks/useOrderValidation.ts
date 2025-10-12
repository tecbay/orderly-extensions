import { useState, useEffect } from "react";
import { Settings } from "./useSettings";

interface OrderStatus {
    financialStatus: string | null;
    fulfillmentStatus: string | null;
}

// Helper function to get human-friendly payment status label
function getPaymentStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        'PENDING': 'pending payment',
        'AUTHORIZED': 'authorized payment',
        'PARTIALLY_PAID': 'partially paid',
        'PAID': 'already paid',
        'PARTIALLY_REFUNDED': 'partially refunded',
        'REFUNDED': 'refunded',
        'VOIDED': 'voided',
    };
    return statusMap[status.toUpperCase()] || status.toLowerCase();
}

// Helper function to get human-friendly fulfillment status label
function getFulfillmentStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        'UNFULFILLED': 'not yet fulfilled',
        'PARTIALLY_FULFILLED': 'partially shipped',
        'FULFILLED': 'already fulfilled',
        'RESTOCKED': 'restocked',
        'PENDING_FULFILLMENT': 'pending fulfillment',
        'OPEN': 'open for fulfillment',
        'IN_PROGRESS': 'being fulfilled',
        'ON_HOLD': 'on hold',
        'SCHEDULED': 'scheduled for fulfillment',
    };
    return statusMap[status.toUpperCase()] || status.toLowerCase();
}

export function useOrderValidation(
    settings: Settings | null,
    order: any,
    orderStatus: OrderStatus
) {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    useEffect(() => {
        if (!settings || !order?.current) return;

        const errors: string[] = [];

        // Check if editing is enabled
        if (!settings.enable_order_editing) {
            errors.push('Order editing is currently disabled.');
        }

        // Check time window (edit_time_window is in minutes)
        if (settings.edit_time_window && order.current.createdAt) {
            const orderDate = new Date(order.current.createdAt);
            const now = new Date();
            const minutesPassed = (now.getTime() - orderDate.getTime()) / 1000 / 60;

            if (minutesPassed > settings.edit_time_window) {
                const hoursWindow = Math.floor(settings.edit_time_window / 60);
                const minutesWindow = settings.edit_time_window % 60;
                const windowText = hoursWindow > 0
                    ? `${hoursWindow} hour${hoursWindow > 1 ? 's' : ''}${minutesWindow > 0 ? ` ${minutesWindow} minutes` : ''}`
                    : `${minutesWindow} minutes`;
                errors.push(`This order can no longer be edited. Changes must be made within ${windowText} of placing the order.`);
            }
        }

        // Check financial status
        if (settings.safe_financial_statuses.length > 0 && orderStatus.financialStatus) {
            const financialStatus = orderStatus.financialStatus.toLowerCase();
            const safeStatuses = settings.safe_financial_statuses.map(s => s.toLowerCase());

            if (!safeStatuses.includes(financialStatus)) {
                const friendlyStatus = getPaymentStatusLabel(orderStatus.financialStatus);
                errors.push(`This order cannot be edited because it has ${friendlyStatus}.`);
            }
        }

        // Check fulfillment status
        if (settings.safe_fulfillment_statuses.length > 0 && orderStatus.fulfillmentStatus) {
            const fulfillmentStatus = orderStatus.fulfillmentStatus.toLowerCase();
            const safeStatuses = settings.safe_fulfillment_statuses.map(s => s.toLowerCase());

            if (!safeStatuses.includes(fulfillmentStatus)) {
                const friendlyStatus = getFulfillmentStatusLabel(orderStatus.fulfillmentStatus);
                errors.push(`This order cannot be edited because it has been ${friendlyStatus}.`);
            }
        }

        setValidationErrors(errors);
    }, [settings, order, orderStatus]);

    const canEdit = validationErrors.length === 0;
    const canEditItems = settings?.allowed_edit_types?.includes('items') ?? false;
    const canEditShipping = settings?.allowed_edit_types?.includes('shipping') ?? false;

    return { validationErrors, canEdit, canEditItems, canEditShipping };
}
