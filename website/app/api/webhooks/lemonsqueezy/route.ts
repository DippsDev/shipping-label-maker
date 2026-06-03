import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-signature') || '';
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

        if (!secret) {
            console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        // Verify the webhook signature
        if (!signature || !verifySignature(rawBody, signature, secret)) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const eventName = payload.meta?.event_name;

        // Only handle order_created events
        if (eventName !== 'order_created') {
            return NextResponse.json({ received: true });
        }

        const order = payload.data?.attributes;
        const customData = payload.meta?.custom_data;

        // Must have custom data with user_id
        if (!customData?.user_id) {
            console.error('No user_id in webhook custom data');
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        // Only process paid orders
        if (order?.status !== 'paid') {
            return NextResponse.json({ received: true });
        }

        const userId = customData.user_id as string;
        const amount = parseFloat(customData.amount as string) || 0;
        const orderId = payload.data?.id as string;

        if (amount <= 0) {
            console.error('Invalid amount in webhook:', amount);
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Check if this order was already processed (idempotency)
        const { data: existingTxn } = await supabase
            .from('wallet_transactions')
            .select('id')
            .eq('id', `ls_${orderId}`)
            .single();

        if (existingTxn) {
            // Already processed, return success to prevent LS from retrying
            return NextResponse.json({ received: true });
        }

        // Get current wallet
        const { data: wallet, error: walletError } = await supabase
            .from('wallet')
            .select('*')
            .eq('userId', userId)
            .single();

        if (walletError || !wallet) {
            // Wallet doesn't exist yet — create it with the credited amount
            const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            const now = Date.now();

            const { error: createError } = await supabase
                .from('wallet')
                .insert({
                    id: walletId,
                    userId,
                    balance: amount,
                    createdAt: now,
                    updatedAt: now,
                });

            if (createError) {
                console.error('Failed to create wallet:', createError);
                return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
            }
        } else {
            // Update existing wallet balance
            const newBalance = parseFloat(wallet.balance) + amount;

            const { error: updateError } = await supabase
                .from('wallet')
                .update({ balance: newBalance, updatedAt: Date.now() })
                .eq('userId', userId);

            if (updateError) {
                console.error('Failed to update wallet:', updateError);
                return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
            }
        }

        // Record the transaction
        const { error: txnError } = await supabase
            .from('wallet_transactions')
            .insert({
                id: `ls_${orderId}`,
                userId,
                amount,
                type: 'credit',
                description: `Wallet top-up via Lemon Squeezy ($${amount})`,
                createdAt: Date.now(),
            });

        if (txnError) {
            console.error('Failed to record transaction:', txnError);
            // Don't return error — wallet was already credited, transaction log is non-critical
        }

        console.log(`Credited $${amount} to user ${userId} (order ${orderId})`);
        return NextResponse.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
