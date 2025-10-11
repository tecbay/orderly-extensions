import {
    Button,
    reactExtension,
    useApi
} from "@shopify/ui-extensions-react/customer-account";
import {useEffect, useState} from "react";

const TARGET = 'customer-account.order.action.menu-item.render';
const API_BASE_URL = 'https://orderly-be.test/api';

export default reactExtension(TARGET, (api) => <OrderEditActionButton orderId={api.orderId}/>);

interface Settings {
    enable_order_editing: boolean;
    edit_time_window: number;
    safe_financial_statuses: string[];
    safe_fulfillment_statuses: string[];
    allowed_edit_types: string[];
    who_can_edit: string[];
    notify_on_edit: boolean;
}

function OrderEditActionButton({orderId}: { orderId: string }) {
    const {sessionToken} = useApi<"customer-account.order.action.menu-item.render">();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Extract numeric ID from GID
    const extractIdFromGid = (gid: string) => {
        const parts = gid.split('/');
        return parts[parts.length - 1];
    };

    useEffect(() => {
        async function fetchSettings() {
            try {
                const token = await sessionToken.get();

                const response = await fetch(`${API_BASE_URL}/settings`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setSettings(data.settings);
                } else {
                    console.error('Failed to fetch settings:', response.statusText);
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSettings();
    }, [sessionToken]);

    // Don't render anything while loading or if order editing is disabled
    if (isLoading || !settings?.enable_order_editing) {
        return null;
    }

    return (
        <Button to={`extension:order-full-page-edit/customer-account.order.page.render/${extractIdFromGid(orderId)}`}>
            Edit Order
        </Button>
    );
}
