import {
    Card,
    BlockStack,
    InlineStack,
    Heading,
    Divider,
    TextBlock,
    Button,
    Icon,
    Modal
} from "@shopify/ui-extensions-react/customer-account";

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

interface AddressCardProps {
    title: string;
    address: Address | null;
    canEdit: boolean;
    onEdit: () => void;
    editModal: React.ReactNode;
}

export function AddressCard({ title, address, canEdit, onEdit, editModal }: AddressCardProps) {
    return (
        <Card padding={'100'}>
            <BlockStack spacing="base">
                <InlineStack spacing="base" blockAlignment="center" inlineAlignment="space-between">
                    <Heading level={3}>{title}</Heading>
                    {canEdit && (
                        <Button
                            kind="plain"
                            accessibilityLabel={`Edit ${title.toLowerCase()}`}
                            overlay={editModal}
                        >
                            <Icon source="edit"/>
                        </Button>
                    )}
                </InlineStack>
                <Divider/>
                {address ? (
                    <BlockStack spacing="extraTight">
                        <TextBlock emphasis="bold">
                            {address.firstName} {address.lastName}
                        </TextBlock>
                        {address.company && (
                            <TextBlock>{address.company}</TextBlock>
                        )}
                        <TextBlock>{address.address1 || ''}</TextBlock>
                        {address.address2 && (
                            <TextBlock>{address.address2}</TextBlock>
                        )}
                        <TextBlock>
                            {address.city}, {address.provinceCode} {address.zip}
                        </TextBlock>
                        <TextBlock>{address.countryCode}</TextBlock>
                        {address.phone && (
                            <TextBlock appearance="subdued">{address.phone}</TextBlock>
                        )}
                    </BlockStack>
                ) : (
                    <TextBlock appearance="subdued">No {title.toLowerCase()}</TextBlock>
                )}
            </BlockStack>
        </Card>
    );
}
