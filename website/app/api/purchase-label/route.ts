import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const LABEL_PRICE = 0.50;

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: { userId: string; labelData: Record<string, any> } = await request.json();
    const { userId, labelData } = body;

    if (!userId || !labelData) {
      return NextResponse.json({ error: 'Missing userId or labelData' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('balance')
      .eq('userId', userId)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (wallet.balance < LABEL_PRICE) {
      return NextResponse.json(
        { error: 'Insufficient balance', balance: wallet.balance, price: LABEL_PRICE },
        { status: 402 }
      );
    }

    // Deduct from wallet
    const { error: deductError } = await supabase
      .from('wallet')
      .update({ balance: wallet.balance - LABEL_PRICE, updatedAt: Date.now() })
      .eq('userId', userId);

    if (deductError) {
      return NextResponse.json({ error: 'Failed to deduct from wallet' }, { status: 500 });
    }

    // Record transaction
    await supabase.from('wallet_transactions').insert({
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      amount: LABEL_PRICE,
      type: 'debit',
      description: `Label: ${labelData.carrier} ${labelData.service} (${labelData.trackingNumber})`,
      createdAt: Date.now(),
    });

    // Generate single-use download token (5 min TTL)
    const token = crypto.randomBytes(32).toString('hex');
    const { error: tokenError } = await supabase
      .from('label_tokens')
      .insert({
        id: token,
        userId,
        labelData: JSON.stringify(labelData),
        used: false,
        expiresAt: Date.now() + 5 * 60 * 1000,
        createdAt: Date.now(),
      });

    if (tokenError) {
      // Refund the deduction if token storage fails
      await supabase
        .from('wallet')
        .update({ balance: wallet.balance, updatedAt: Date.now() })
        .eq('userId', userId);
      console.error('Token insert error:', tokenError);
      return NextResponse.json(
        { error: 'Failed to issue download token. Your wallet was not charged.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ token, price: LABEL_PRICE });
  } catch (error) {
    console.error('Purchase label error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
