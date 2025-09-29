import {
    Button,
    CustomerAccountAction,
    reactExtension,
    useApi,
    Form,
    Select
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";

export default reactExtension(
    "customer-account.order.action.render",
    () => <OrderEditModal />
);

function OrderEditModal() {
    const { close } = useApi<"customer-account.order.action.render">();
    const [currentProblem, setCurrentProblem] = useState("1");
    const [isLoading, setIsLoading] = useState(false);

    function onSubmit() {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            close();
        }, 750);
    }

    return (
        <CustomerAccountAction
            title="Edit Order"
            primaryAction={
                <Button loading={isLoading} onPress={onSubmit}>
                    Save Changes
                </Button>
            }
            secondaryAction={
                <Button onPress={close}>
                    Cancel
                </Button>
            }
        >
            <Form onSubmit={onSubmit}>
                <Select
                    label="Edit action"
                    options={[
                        { value: "1", label: "Update shipping address" },
                        { value: "2", label: "Change delivery instructions" },
                        { value: "3", label: "Request order modification" },
                        { value: "4", label: "Add special notes" },
                        { value: "5", label: "Contact support" }
                    ]}
                    value={currentProblem}
                    onChange={setCurrentProblem}
                />
            </Form>
        </CustomerAccountAction>
    );
}
