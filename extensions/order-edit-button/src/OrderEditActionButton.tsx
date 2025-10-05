import {
    Button,
    reactExtension,
    useApi
} from "@shopify/ui-extensions-react/customer-account";
import {useEffect} from "react";

const TARGET = 'customer-account.order.action.menu-item.render';
export default reactExtension(TARGET, (api) => <OrderEditActionButton orderId={api.orderId}/>);

function OrderEditActionButton({orderId}: { orderId: string }) {
    const {sessionToken, query, navigation} = useApi<"customer-account.order.action.menu-item.render">();


    useEffect(() => {
        // @ts-ignore
        async function fetchProducts() {
            try {

                const result = await query(
                    `query getProducts($first: Int!) {
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  description
                  handle
                  featuredImage {
                    url
                    altText
                    width
                    height
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                    maxVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        sku
                        availableForSale
                        price {
                          amount
                          currencyCode
                        }
                        compareAtPrice {
                          amount
                          currencyCode
                        }
                        selectedOptions {
                          name
                          value
                        }
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }`,
                    {
                        variables: {
                            first: 10
                        }
                    }
                );

                console.log(result.data, 'result.data')
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
            }
        }

        fetchProducts();
    }, [query]);


    sessionToken.get().then((sessionToken) => {
        console.log(sessionToken)
    })
    useEffect(() => {
        console.log('OrderEditActionButton orderId:', orderId);
    }, [orderId]);

    const {  } = useApi();

    return <Button onPress={() => {
        navigation.navigate('extension:order-full-page-edit/')
    }}>Edit</Button>;
}
