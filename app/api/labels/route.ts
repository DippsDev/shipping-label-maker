import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

// Save a generated label
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const supabase = getSupabase();

        // Generate a unique ID
        const id = `label_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const createdAt = Date.now();

        // Insert label record into Supabase
        const { error } = await supabase
            .from('labels')
            .insert({
                id,
                userId: data.userId || 'guest',
                carrier: data.carrier,
                service: data.service,
                trackingNumber: data.trackingNumber,
                shipToName: data.shipToName,
                shipToAddress: data.shipToAddress,
                shipToCity: data.shipToCity,
                shipToState: data.shipToState,
                shipToZip: data.shipToZip,
                weight: data.weight || null,
                createdAt,
            });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to save label' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error saving label:', error);
        return NextResponse.json(
            { error: 'Failed to save label' },
            { status: 500 }
        );
    }
}

// Get label count for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 'guest';
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('labels')
            .select('*')
            .eq('userId', userId);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch labels' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            count: data?.length || 0,
            labels: data || [],
        });
    } catch (error) {
        console.error('Error fetching labels:', error);
        return NextResponse.json(
            { error: 'Failed to fetch labels' },
            { status: 500 }
        );
    }
}
