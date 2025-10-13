import {
    BlockStack,
    Banner,
    Text
} from "@shopify/ui-extensions-react/customer-account";
import { useState, useEffect } from "react";

interface ValidationBannerProps {
    validationErrors: string[];
    hasChanges: boolean;
    editTimeWindow?: number;
    orderCreatedAt?: string | null;
    onTimeExpired?: () => void;
}

function formatTimeRemaining(totalSeconds: number): string {
    if (totalSeconds <= 0) return '0 seconds';

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const parts: string[] = [];

    if (days > 0) {
        parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }
    if (seconds > 0 || parts.length === 0) {
        parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
    }

    return parts.join(' ');
}

export function ValidationBanner({ validationErrors, hasChanges, editTimeWindow, orderCreatedAt }: ValidationBannerProps) {
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (!editTimeWindow || !orderCreatedAt) {
            setTimeRemaining(null);
            return;
        }

        const calculateTimeRemaining = () => {
            const orderDate = new Date(orderCreatedAt);
            const now = new Date();
            const secondsPassed = (now.getTime() - orderDate.getTime()) / 1000;
            const totalAllowedSeconds = editTimeWindow * 60; // Convert minutes to seconds
            const remainingSeconds = totalAllowedSeconds - secondsPassed;
            setTimeRemaining(remainingSeconds);
        };

        // Calculate immediately
        calculateTimeRemaining();

        // Update every second for live countdown
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [editTimeWindow, orderCreatedAt]);

    if (validationErrors.length > 0) {
        return (
            <BlockStack spacing={'tight'}>
                {validationErrors.map((error, index) => {
                    // Split error message by newlines and render each line
                    const lines = error.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                    return (
                        <Banner key={index} status="critical">
                            <BlockStack spacing="extraTight">
                                {lines.map((line, lineIndex) => (
                                    <Text key={lineIndex}>{line}</Text>
                                ))}
                            </BlockStack>
                        </Banner>
                    );
                })}
            </BlockStack>
        );
    }

    let message = 'You have unsaved changes.';
    let status: 'warning' | 'info' = hasChanges ? 'warning' : 'info';

    if (!hasChanges && timeRemaining !== null) {
        if (timeRemaining > 0) {
            message = `You can edit this order for ${formatTimeRemaining(timeRemaining)} more.`;
            // Warning if less than 30 minutes (1800 seconds) remaining
            if (timeRemaining < 1800) {
                status = 'warning';
            }
        } else {
            message = 'Edit time has expired.';
            status = 'critical';
        }
    }

    return (
        <Banner status={status}>
            {message}
        </Banner>
    );
}
