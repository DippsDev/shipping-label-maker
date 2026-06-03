import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { error: 'Wallet feature is currently unavailable' },
        { status: 503 }
    );
}
