import {
    Button,
    reactExtension,
    useApi
} from "@shopify/ui-extensions-react/customer-account";
import {useEffect, useState} from "react";
import {config} from "../../shared/config";

const TARGET = 'customer-account.order.action.menu-item.render';
const API_BASE_URL = config.API_BASE_URL;

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

    // Auto-complete onboarding step 2 on first load
    useEffect(() => {
        const completeOnboardingStep2 = async () => {
            try {
                const token = await sessionToken.get();
                const response = await fetch(`${API_BASE_URL}/onboarding/complete-step`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        step_number: 2,
                    }),
                });

                if (response.ok) {
                    console.log('Onboarding step 2 completed successfully');
                } else {
                    console.error('Failed to complete onboarding step 2:', await response.text());
                }
            } catch (error) {
                console.error('Error completing onboarding step 2:', error);
            }
        };

        // Only run if we have a session token
        if (sessionToken) {
            completeOnboardingStep2();
        }
    }, [sessionToken]);

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
