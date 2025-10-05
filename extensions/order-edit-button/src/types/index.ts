// TypeScript interfaces for Customer Account API
export interface LineItem {
    id: string;
    name: string;
    title: string;
    quantity: number;
    variantId?: string;
    variantTitle?: string;
    price?: {
        amount: string;
        currencyCode: string;
    };
    totalPrice?: {
        amount: string;
        currencyCode: string;
    };
    image?: {
        url: string;
        altText?: string;
    };
}

export interface OrderData {
    id: string;
    name: string;
    createdAt: string;
    financialStatus?: string;
    fulfillmentStatus: string;
    edited: boolean;
    lineItems: {
        nodes: LineItem[];
    };
    totalPrice: {
        amount: string;
        currencyCode: string;
    };
    subtotal?: {
        amount: string;
        currencyCode: string;
    };
    totalTax?: {
        amount: string;
        currencyCode: string;
    };
}

export interface Product {
    id: string;
    title: string;
    handle: string;
    featuredImage?: {
        url: string;
        altText?: string;
    };
    priceRange: {
        minVariantPrice: {
            amount: string;
            currencyCode: string;
        };
    };
    variants?: {
        edges: Array<{
            node: ProductVariant;
        }>;
    };
}

export interface ProductVariant {
    id: string;
    title: string;
    priceV2: {
        amount: string;
        currencyCode: string;
    };
    availableForSale: boolean;
    image?: {
        url: string;
        altText?: string;
    };
    sku?: string;
}

export interface VariantWithProduct {
    variantId: string;
    variantTitle: string;
    productId: string;
    productTitle: string;
    price: {
        amount: string;
        currencyCode: string;
    };
    availableForSale: boolean;
    image?: {
        url: string;
        altText?: string;
    };
    sku?: string;
}