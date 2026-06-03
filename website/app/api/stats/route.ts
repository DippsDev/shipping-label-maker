import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get dashboard stats for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 'guest';

        let labelsCount = 0;
        let addressesCount = 0;
        let mostUsedCarrier = 'N/A';
        let walletBalance = 0.00;

        // Create Supabase client for direct database access
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Direct database queries instead of internal API calls
        try {
            // Get labels count and most used carrier
            const { data: labelsData, error: labelsError } = await supabase
                .from('labels')
                .select('carrier')
                .eq('userId', userId);

            if (!labelsError && labelsData) {
                labelsCount = labelsData.length;

                // Calculate most used carrier
                if (labelsData.length > 0) {
                    const carrierCounts: Record<string, number> = {};
                    labelsData.forEach((label) => {
                        carrierCounts[label.carrier] = (carrierCounts[label.carrier] || 0) + 1;
                    });

                    // Find carrier with highest count
                    let maxCount = 0;
                    Object.entries(carrierCounts).forEach(([carrier, count]) => {
                        if (count > maxCount) {
                            maxCount = count;
                            mostUsedCarrier = carrier;
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching labels stats:', error);
        }

        try {
            // Get addresses count
            const { count, error: addressError } = await supabase
                .from('address')
                .select('*', { count: 'exact', head: true })
                .eq('userId', userId);

            if (!addressError) {
                addressesCount = count || 0;
            }
        } catch (error) {
            console.error('Error fetching address count:', error);
        }

        try {
            // Get wallet balance
            const { data: walletData, error: walletError } = await supabase
                .from('wallet')
                .select('balance')
                .eq('userId', userId)
                .single();

            if (!walletError && walletData) {
                walletBalance = parseFloat(walletData.balance) || 0.00;
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }

        return NextResponse.json({
            totalLabels: labelsCount,
            savedAddresses: addressesCount,
            walletBalance: walletBalance,
            mostUsedCarrier: mostUsedCarrier,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
