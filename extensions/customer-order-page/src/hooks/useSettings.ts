import { useState, useEffect } from "react";

const API_BASE_URL = 'https://orderly-be.test/api';

export interface Settings {
    enable_order_editing: boolean;
    edit_time_window: number;
    safe_financial_statuses: string[];
    safe_fulfillment_statuses: string[];
    allowed_edit_types: string[];
    who_can_edit: string[];
    notify_on_edit: boolean;
}

export function useSettings(sessionToken: any) {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

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
                setIsLoadingSettings(false);
            }
        }

        fetchSettings();
    }, [sessionToken]);

    return { settings, isLoadingSettings };
}
