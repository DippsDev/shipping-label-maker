// Database schema definitions
// Note: This project uses raw SQL queries with Vercel Postgres
// These are TypeScript interfaces for type safety

export interface Label {
    id: string;
    userId: string;
    carrier: string;
    service: string;
    trackingNumber: string;
    shipToName: string;
    shipToAddress: string;
    shipToCity: string;
    shipToState: string;
    shipToZip: string;
    weight: string | null;
    createdAt: number;
}

export interface Address {
    id: string;
    userId: string;
    name: string;
    phone: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isSaved: boolean;
    lastUsed: number;
    usageCount: number;
    createdAt: number;
    updatedAt: number;
}

// Placeholder exports for compatibility
export const labels = 'labels';
export const address = 'address';
