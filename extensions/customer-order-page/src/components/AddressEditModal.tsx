import {
    BlockStack,
    TextField,
    Button,
    InlineStack,
    Banner
} from "@shopify/ui-extensions-react/customer-account";
import {useState} from "react";

interface Address {
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    provinceCode?: string;
    countryCode?: string;
    zip?: string;
    phone?: string;
    company?: string;
}

interface AddressEditModalProps {
    title: string;
    address: Address | null;
    onSave: (addressData: any) => Promise<void>;
    onClose: () => void;
    isSaving: boolean;
}

export function AddressEditModal({
                                     title,
                                     address,
                                     onSave,
                                     onClose,
                                     isSaving
                                 }: AddressEditModalProps) {
    const [formData, setFormData] = useState({
        first_name: address?.firstName || '',
        last_name: address?.lastName || '',
        address1: address?.address1 || '',
        address2: address?.address2 || '',
        city: address?.city || '',
        province: address?.provinceCode || '',
        country: address?.countryCode || '',
        zip: address?.zip || '',
        phone: address?.phone || '',
        company: address?.company || '',
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = async () => {
        try {
            setError(null);
            await onSave(formData);
            setShowSuccess(true);
            // Call onClose to trigger modal close
            // The parent component should handle the actual modal closing
            if (onClose) {
                onClose();
            }
        } catch (err) {
            setError('Failed to update address. Please try again.');
        }
    };

    return (
        <BlockStack spacing={'base'} >

            {error && (
                <Banner tone="critical">
                    {error}
                </Banner>
            )}

            {/* Name Fields - Side by Side */}
            <InlineStack blockAlignment={'s'}>
                <TextField
                    label="First Name"
                    value={formData.first_name}
                    onChange={(value) => handleChange('first_name', value)}
                />

                <TextField
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(value) => handleChange('last_name', value)}
                />
            </InlineStack>
            <TextField
                label="Company"
                value={formData.company}
                onChange={(value) => handleChange('company', value)}
            />
            <TextField
                label="Address Line 1"
                value={formData.address1}
                onChange={(value) => handleChange('address1', value)}
            />
            <TextField
                label="Address Line 2"
                value={formData.address2}
                onChange={(value) => handleChange('address2', value)}
            />
            {/* City and Province - Side by Side */}
            <InlineStack spacing="base" blockAlignment="start">
                <TextField
                    label="City"
                    value={formData.city}
                    onChange={(value) => handleChange('city', value)}
                />
                <TextField
                    label="Province/State"
                    value={formData.province}
                    onChange={(value) => handleChange('province', value)}
                />
            </InlineStack>

            {/* ZIP and Country - Side by Side */}
            <InlineStack spacing="base" blockAlignment="start">
                <TextField
                    label="Postal/ZIP Code"
                    value={formData.zip}
                    onChange={(value) => handleChange('zip', value)}
                />
                <TextField
                    label="Country"
                    value={formData.country}
                    onChange={(value) => handleChange('country', value)}
                />
            </InlineStack>
            <TextField
                label="Phone"
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
            />
            <InlineStack spacing="base" blockAlignment="center">
                <Button onPress={handleSubmit} loading={isSaving} kind="primary">
                    Update
                </Button>
                <Button onPress={onClose} disabled={isSaving} kind="plain">
                    Cancel
                </Button>
            </InlineStack>
        </BlockStack>
    );
}
