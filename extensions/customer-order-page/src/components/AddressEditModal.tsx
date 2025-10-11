import {
    BlockStack,
    TextField,
    Button
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";

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
    onSave: (addressData: any) => void;
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

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <BlockStack spacing="base">
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
            <TextField
                label="Phone"
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
            />
            <BlockStack spacing="tight">
                <Button onPress={handleSubmit} loading={isSaving} kind="primary">
                    Save
                </Button>
                <Button onPress={onClose} disabled={isSaving} kind="plain">
                    Cancel
                </Button>
            </BlockStack>
        </BlockStack>
    );
}
