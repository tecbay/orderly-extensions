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
    () => <MenuActionModalExtension />
);

function MenuActionModalExtension() {
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
            title="Report a problem"
            primaryAction={
                <Button loading={isLoading} onPress={onSubmit}>
                    Report
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
                    label="Select a problem"
                    options={[
                        { value: "1", label: "Package item is damaged" },
                        { value: "2", label: "Missing items" },
                        { value: "3", label: "Wrong item was sent" },
                        { value: "4", label: "Item arrived too late" },
                        { value: "5", label: "Never received item" }
                    ]}
                    value={currentProblem}
                    onChange={setCurrentProblem}
                />
            </Form>
        </CustomerAccountAction>
    );
}
