import { NextRequest, NextResponse } from 'next/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

// Map dollar amounts to variant IDs
const VARIANT_MAP: Record<number, string> = {
    10: process.env.LEMONSQUEEZY_VARIANT_ID_10!,
    50: process.env.LEMONSQUEEZY_VARIANT_ID_50!,
};

export async function POST(request: NextRequest) {
    try {
        const { amount, userId, userEmail } = await request.json();

        if (!amount || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: amount, userId' },
                { status: 400 }
            );
        }

        const variantId = VARIANT_MAP[amount as number];
        if (!variantId) {
            return NextResponse.json(
                { error: `No product configured for amount: $${amount}` },
                { status: 400 }
            );
        }

        const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
        const apiKey = process.env.LEMONSQUEEZY_API_KEY!;

        if (!storeId || !apiKey) {
            return NextResponse.json(
                { error: 'Lemon Squeezy is not configured' },
                { status: 500 }
            );
        }

        lemonSqueezySetup({ apiKey });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const { data, error } = await createCheckout(storeId, variantId, {
            checkoutData: {
                email: userEmail || undefined,
                custom: {
                    user_id: userId,
                    amount: amount.toString(),
                },
            },
            checkoutOptions: {
                embed: false,
            },
            productOptions: {
                redirectUrl: `${baseUrl}/wallet?success=true`,
            },
        });

        if (error || !data) {
            console.error('Lemon Squeezy checkout error:', error);
            return NextResponse.json(
                { error: 'Failed to create checkout session' },
                { status: 500 }
            );
        }

        const checkoutUrl = data.data.attributes.url;

        return NextResponse.json({ url: checkoutUrl });
    } catch (err) {
        console.error('Checkout error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
