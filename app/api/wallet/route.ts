import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

const getSupabaseAdmin = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

const DEFAULT_BALANCE = 100.00;

// Get wallet balance
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 'guest';
        const supabase = getSupabase();

        // Try to get existing wallet
        const { data, error } = await supabase
            .from('wallet')
            .select('*')
            .eq('userId', userId)
            .single();

        // If wallet doesn't exist, create it with default balance
        if (error && error.code === 'PGRST116') {
            const id = `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            const now = Date.now();

            // Use service role key to bypass RLS for wallet creation
            const supabaseAdmin = getSupabaseAdmin();
            const { data: newWallet, error: insertError } = await supabaseAdmin
                .from('wallet')
                .insert({
                    id,
                    userId,
                    balance: DEFAULT_BALANCE,
                    createdAt: now,
                    updatedAt: now,
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating wallet:', insertError);
                return NextResponse.json(
                    { error: 'Failed to create wallet' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                balance: newWallet.balance,
                userId,
            });
        }

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch wallet balance' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            balance: data.balance,
            userId,
        });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet balance' },
            { status: 500 }
        );
    }
}

// Update wallet balance (add or deduct)
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const userId = data.userId || 'guest';
        const amount = parseFloat(data.amount) || 0;
        const type = data.type; // 'credit' or 'debit'
        const supabase = getSupabase();

        // Get current wallet
        const { data: wallet, error: fetchError } = await supabase
            .from('wallet')
            .select('*')
            .eq('userId', userId)
            .single();

        if (fetchError) {
            console.error('Error fetching wallet:', fetchError);
            return NextResponse.json(
                { error: 'Wallet not found' },
                { status: 404 }
            );
        }

        let newBalance = wallet.balance;

        // Update balance
        if (type === 'credit') {
            newBalance += amount;
        } else if (type === 'debit') {
            if (wallet.balance >= amount) {
                newBalance -= amount;
            } else {
                return NextResponse.json(
                    { error: 'Insufficient balance' },
                    { status: 400 }
                );
            }
        }

        // Update wallet in database
        const { error: updateError } = await supabase
            .from('wallet')
            .update({
                balance: newBalance,
                updatedAt: Date.now(),
            })
            .eq('userId', userId);

        if (updateError) {
            console.error('Error updating wallet:', updateError);
            return NextResponse.json(
                { error: 'Failed to update wallet' },
                { status: 500 }
            );
        }

        // Record transaction
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        await supabase
            .from('wallet_transactions')
            .insert({
                id: transactionId,
                userId,
                amount,
                type,
                description: data.description || `${type} transaction`,
                createdAt: Date.now(),
            });

        return NextResponse.json({
            success: true,
            balance: newBalance,
            userId,
        });
    } catch (error) {
        console.error('Error updating wallet balance:', error);
        return NextResponse.json(
            { error: 'Failed to update wallet balance' },
            { status: 500 }
        );
    }
}
