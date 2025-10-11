import {
    BlockStack,
    Banner
} from "@shopify/ui-extensions-react/customer-account";

interface ValidationBannerProps {
    validationErrors: string[];
    hasChanges: boolean;
    editTimeWindow?: number;
}

export function ValidationBanner({ validationErrors, hasChanges, editTimeWindow }: ValidationBannerProps) {
    if (validationErrors.length > 0) {
        return (
            <BlockStack spacing={'tight'}>
                {validationErrors.map((error, index) => (
                    <Banner key={index} status="critical">
                        {error}
                    </Banner>
                ))}
            </BlockStack>
        );
    }

    const hours = editTimeWindow ? Math.floor(editTimeWindow / 60) : 0;
    const message = hasChanges
        ? 'You have unsaved changes.'
        : `You can edit this order within ${hours} hours of placement.`;

    return (
        <Banner status={hasChanges ? 'warning' : 'info'}>
            {message}
        </Banner>
    );
}
