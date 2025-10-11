import { useState, useEffect } from "react";
import { Settings } from "./useSettings";

export function useOrderValidation(settings: Settings | null, order: any) {
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
                errors.push(`Orders can only be edited within ${windowText} of placement.`);
            }
        }

        // Check financial status
        if (settings.safe_financial_statuses.length > 0 && order.current.financialStatus) {
            const financialStatus = order.current.financialStatus.toLowerCase();
            const safeStatuses = settings.safe_financial_statuses.map(s => s.toLowerCase());

            if (!safeStatuses.includes(financialStatus)) {
                errors.push(`Orders with "${order.current.financialStatus}" financial status cannot be edited.`);
            }
        }

        // Check fulfillment status
        if (settings.safe_fulfillment_statuses.length > 0 && order.current.fulfillmentStatus) {
            const fulfillmentStatus = order.current.fulfillmentStatus.toLowerCase();
            const safeStatuses = settings.safe_fulfillment_statuses.map(s => s.toLowerCase());

            if (!safeStatuses.includes(fulfillmentStatus)) {
                errors.push(`Orders with "${order.current.fulfillmentStatus}" fulfillment status cannot be edited.`);
            }
        }

        setValidationErrors(errors);
    }, [settings, order]);

    const canEdit = validationErrors.length === 0;
    const canEditItems = settings?.allowed_edit_types?.includes('items') ?? false;
    const canEditShipping = settings?.allowed_edit_types?.includes('shipping') ?? false;

    return { validationErrors, canEdit, canEditItems, canEditShipping };
}
