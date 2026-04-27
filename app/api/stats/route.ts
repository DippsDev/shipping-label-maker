import { NextRequest, NextResponse } from 'next/server';

// Get dashboard stats for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 'guest';

        let labelsCount = 0;
        let addressesCount = 0;
        let mostUsedCarrier = 'N/A';
        let walletBalance = 0.00;

        // Try to get label count and most used carrier from the labels API
        try {
            const labelsResponse = await fetch(`${request.nextUrl.origin}/api/labels?userId=${userId}`);
            if (labelsResponse.ok) {
                const labelsData = await labelsResponse.json();
                labelsCount = labelsData.count || 0;

                // Calculate most used carrier
                if (labelsData.labels && labelsData.labels.length > 0) {
                    const carrierCounts: Record<string, number> = {};
                    labelsData.labels.forEach((label: any) => {
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
                } else {
                    mostUsedCarrier = 'N/A';
                }
            }
        } catch (error) {
            console.error('Error fetching labels count:', error);
        }

        // Try to get address count from the address API
        try {
            const addressResponse = await fetch(`${request.nextUrl.origin}/api/addresses?userId=${userId}`);
            if (addressResponse.ok) {
                const addressData = await addressResponse.json();
                addressesCount = Array.isArray(addressData) ? addressData.length : 0;
            }
        } catch (error) {
            console.error('Error fetching address count:', error);
        }

        // Try to get wallet balance from the wallet API
        try {
            const walletResponse = await fetch(`${request.nextUrl.origin}/api/wallet?userId=${userId}`);
            if (walletResponse.ok) {
                const walletData = await walletResponse.json();
                walletBalance = walletData.balance || 0.00;
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
